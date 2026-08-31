# server-fastapi/realtime.py
import os
import json
import subprocess
from typing import Set

import numpy as np
import soundfile as sf
import requests
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from vosk import Model, KaldiRecognizer

# IMPORTANT: adjust this path to your actual model directory
VOSK_MODEL_PATH = os.path.join(os.path.dirname(__file__), "vosk-model")
OLLAMA_URL = "http://localhost:11434/api/generate"

if not os.path.exists(VOSK_MODEL_PATH):
    raise RuntimeError(f"VOSK model not found at {VOSK_MODEL_PATH}")

vosk_model = Model(VOSK_MODEL_PATH)

router = APIRouter()

class ConnectionManager:
    def __init__(self) -> None:
        self.active: Set[WebSocket] = set()

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.add(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

manager = ConnectionManager()


@router.get("/health-realtime")
async def health_realtime():
    """Simple health endpoint for the realtime service."""
    return {"status": "ok", "vosk": True}


@router.post("/ask-ai")
async def ask_ai(payload: dict):
    """
    Simple proxy to Ollama generate endpoint.
    Example payload:
    {
      "model": "gemma2:2b",
      "prompt": "Give feedback on: ...."
    }
    """
    try:
        resp = requests.post(OLLAMA_URL, json=payload, timeout=60)
        return {
            "status": resp.status_code,
            "text": resp.text,
        }
    except Exception as e:
        return {"error": str(e)}


@router.websocket("/ws/audio")
async def websocket_audio(ws: WebSocket):
    """
    WebSocket flow:
    - Frontend sends binary PCM16 (16kHz) or float32 PCM audio frames.
    - Backend uses Vosk in streaming mode.
    - Sends back JSON messages:
        {"type": "speech_partial", "text": "..."}
        {"type": "speech_final", "text": "..."}
        {"type": "error", "msg": "..."}
    """
    await manager.connect(ws)
    rec = KaldiRecognizer(vosk_model, 16000.0)

    try:
        while True:
            data = await ws.receive_bytes()

            # First try: assume data is already PCM16@16kHz as bytes
            try:
                if rec.AcceptWaveform(data):
                    res = json.loads(rec.Result())
                    await ws.send_text(json.dumps({
                        "type": "speech_final",
                        "text": res.get("text", "")
                    }))
                else:
                    res = json.loads(rec.PartialResult())
                    await ws.send_text(json.dumps({
                        "type": "speech_partial",
                        "text": res.get("partial", "")
                    }))
                continue
            except Exception:
                pass

            # Second try: treat as float32 PCM and convert
            try:
                arr = np.frombuffer(data, dtype=np.float32)
                pcm16 = (arr * 32767).astype(np.int16).tobytes()
                if rec.AcceptWaveform(pcm16):
                    res = json.loads(rec.Result())
                    await ws.send_text(json.dumps({
                        "type": "speech_final",
                        "text": res.get("text", "")
                    }))
                else:
                    res = json.loads(rec.PartialResult())
                    await ws.send_text(json.dumps({
                        "type": "speech_partial",
                        "text": res.get("partial", "")
                    }))
                continue
            except Exception:
                pass

            # Final fallback using ffmpeg
            try:
                tmp_in = os.path.join(os.path.dirname(__file__), "tmp_in.raw")
                tmp_wav = os.path.join(os.path.dirname(__file__), "tmp_out.wav")

                with open(tmp_in, "wb") as f:
                    f.write(data)

                # This command assumes 48kHz float32 LE input from browser
                cmd = [
                    "ffmpeg",
                    "-y",
                    "-f", "f32le",
                    "-ar", "48000",
                    "-ac", "1",
                    "-i", tmp_in,
                    "-ar", "16000",
                    "-ac", "1",
                    tmp_wav,
                ]
                subprocess.run(
                    cmd,
                    check=True,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                )

                frames, sr = sf.read(tmp_wav, dtype="int16")
                pcm_bytes = frames.tobytes()

                if rec.AcceptWaveform(pcm_bytes):
                    res = json.loads(rec.Result())
                    await ws.send_text(json.dumps({
                        "type": "speech_final",
                        "text": res.get("text", "")
                    }))
                else:
                    res = json.loads(rec.PartialResult())
                    await ws.send_text(json.dumps({
                        "type": "speech_partial",
                        "text": res.get("partial", "")
                    }))
            except Exception as e3:
                await ws.send_text(json.dumps({
                    "type": "error",
                    "msg": f"audio processing failed: {str(e3)}"
                }))

    except WebSocketDisconnect:
        manager.disconnect(ws)
    except Exception:
        manager.disconnect(ws)
        await ws.close(code=1011)
