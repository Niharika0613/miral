# server-fastapi/main_new.py
"""
WebSocket-based audio streaming backend for real-time speech recognition and AI feedback.
"""

import asyncio
import json
import os
import subprocess
import tempfile
from typing import Optional, Set

import numpy as np
import soundfile as sf
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests

# Try to import vosk
try:
    from vosk import Model, KaldiRecognizer
    VOSK_AVAILABLE = True
except ImportError:
    VOSK_AVAILABLE = False

# Configuration
OLLAMA_URL = "http://localhost:11434/api/generate"
VOSK_MODEL_PATH = os.getenv("VOSK_MODEL_PATH", "./vosk-model")
APP_ORIGINS = [
    "http://localhost:5000",
    "http://localhost:3000",
    "http://127.0.0.1:5000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
]

app = FastAPI(title="MiralAI WebSocket Backend", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=APP_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

vosk_model: Optional[Model] = None


def get_vosk_model() -> Optional[Model]:
    """Lazy load Vosk model"""
    global vosk_model
    if vosk_model is None and VOSK_AVAILABLE:
        try:
            if os.path.isdir(VOSK_MODEL_PATH):
                vosk_model = Model(VOSK_MODEL_PATH)
                print(f"✅ Vosk model loaded from {VOSK_MODEL_PATH}")
            else:
                print(f"⚠️  Vosk model path not found: {VOSK_MODEL_PATH}")
        except Exception as e:
            print(f"⚠️  Failed to load Vosk model: {e}")
    return vosk_model


def float_to_16bit_pcm(float32_array: np.ndarray) -> bytes:
    """Convert float32 audio to 16-bit PCM bytes"""
    float32_array = np.clip(float32_array, -1.0, 1.0)
    pcm16 = (float32_array * 32767).astype(np.int16)
    return pcm16.tobytes()


def downsample_buffer(buffer: np.ndarray, sample_rate: int, out_sample_rate: int) -> np.ndarray:
    """Resample audio buffer"""
    if out_sample_rate == sample_rate:
        return buffer
    
    sample_rate_ratio = sample_rate / out_sample_rate
    new_length = int(np.round(len(buffer) / sample_rate_ratio))
    result = np.zeros(new_length, dtype=np.float32)
    
    offset_result = 0
    while offset_result < len(result):
        next_offset_buffer = int(np.round((offset_result + 1) * sample_rate_ratio))
        start = int(np.round(offset_result * sample_rate_ratio))
        end = min(next_offset_buffer, len(buffer))
        
        if start < len(buffer):
            result[offset_result] = np.mean(buffer[start:end])
        offset_result += 1
    
    return result


def convert_audio_to_pcm16(data: bytes, source_sample_rate: int = 48000) -> bytes:
    """Convert various audio formats to PCM16 @ 16000Hz"""
    try:
        # Try 1: Assume Float32
        try:
            float32_arr = np.frombuffer(data, dtype=np.float32)
            if len(float32_arr) > 100:
                resampled = downsample_buffer(float32_arr, source_sample_rate, 16000)
                return float_to_16bit_pcm(resampled)
        except:
            pass
        
        # Try 2: Assume PCM16 already
        if len(data) % 2 == 0:
            try:
                pcm16 = np.frombuffer(data, dtype=np.int16)
                if np.abs(pcm16).max() > 100:
                    return data
            except:
                pass
        
        # Try 3: FFmpeg conversion
        try:
            tmp_in = tempfile.NamedTemporaryFile(delete=False, suffix=".raw")
            tmp_in.write(data)
            tmp_in.close()
            
            tmp_out = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
            tmp_out.close()
            
            cmd = [
                "ffmpeg", "-y", "-f", "f32le", "-ar", str(source_sample_rate),
                "-i", tmp_in.name, "-ar", "16000", "-ac", "1", tmp_out.name,
            ]
            
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=5)
            frames, sr = sf.read(tmp_out.name, dtype="int16")
            result = frames.tobytes()
            
            os.unlink(tmp_in.name)
            os.unlink(tmp_out.name)
            return result
        except:
            pass
        
        return data
    except Exception as e:
        print(f"⚠️  Audio conversion error: {e}")
        return data


class ConnectionManager:
    """Manage WebSocket connections"""
    def __init__(self):
        self.active: Set[WebSocket] = set()
    
    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.add(ws)
        print(f"✅ WebSocket connected. Total: {len(self.active)}")
    
    def disconnect(self, ws: WebSocket):
        self.active.discard(ws)
        print(f"❌ WebSocket disconnected. Total: {len(self.active)}")


manager = ConnectionManager()


# ============ HTTP Endpoints ============

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "vosk_available": VOSK_AVAILABLE, "ollama_url": OLLAMA_URL}


@app.post("/ask-ai")
async def ask_ai(payload: dict):
    """Proxy to Ollama generate endpoint"""
    try:
        if "model" not in payload or "prompt" not in payload:
            raise HTTPException(status_code=400, detail="Missing 'model' or 'prompt'")
        
        print(f"🤖 Calling Ollama: {payload['model']}")
        
        response = requests.post(OLLAMA_URL, json=payload, timeout=30)
        
        if response.status_code != 200:
            return {"error": f"Ollama returned {response.status_code}", "details": response.text[:500]}
        
        full_text = ""
        for line in response.text.split("\n"):
            if line.strip():
                try:
                    chunk = json.loads(line)
                    if "response" in chunk:
                        full_text += chunk["response"]
                except:
                    pass
        
        return {"status": "ok", "text": full_text}
    
    except requests.exceptions.ConnectionError:
        return {"error": "Cannot connect to Ollama", "details": f"Not reachable at {OLLAMA_URL}"}
    except Exception as e:
        return {"error": str(e)}


# ============ WebSocket Endpoint ============

@app.websocket("/ws/audio")
async def websocket_audio(ws: WebSocket):
    """WebSocket endpoint for real-time audio streaming"""
    await manager.connect(ws)
    rec = None
    
    try:
        model = get_vosk_model()
        if model:
            rec = KaldiRecognizer(model, 16000.0)
            print("✅ Vosk recognizer initialized")
        else:
            print("⚠️  Vosk recognizer not available")
        
        while True:
            data = await ws.receive_bytes()
            
            if not data:
                continue
            
            # Convert audio to PCM16
            pcm16_data = convert_audio_to_pcm16(data)
            
            if rec:
                try:
                    if rec.AcceptWaveform(pcm16_data):
                        res = json.loads(rec.Result())
                        text = res.get("text", "")
                        if text:
                            await ws.send_text(json.dumps({"type": "speech_final", "text": text}))
                    else:
                        res = json.loads(rec.PartialResult())
                        partial = res.get("partial", "")
                        if partial:
                            await ws.send_text(json.dumps({"type": "speech_partial", "text": partial}))
                except Exception as e:
                    print(f"⚠️  Vosk error: {e}")
                    await ws.send_text(json.dumps({"type": "error", "msg": str(e)}))
            else:
                # Mock response when Vosk not available
                await ws.send_text(json.dumps({
                    "type": "speech_partial",
                    "text": "[Audio received - Vosk not available]"
                }))
    
    except WebSocketDisconnect:
        manager.disconnect(ws)
    except Exception as e:
        print(f"❌ WebSocket error: {e}")
        manager.disconnect(ws)
        try:
            await ws.close(code=1011)
        except:
            pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
