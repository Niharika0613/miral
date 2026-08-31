# server/realtime.py
import os
import json
import subprocess
from typing import Set

import numpy as np
import soundfile as sf
import requests
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

try:
    from vosk import Model, KaldiRecognizer
    VOSK_AVAILABLE = True
except ImportError:
    Model = None
    KaldiRecognizer = None
    VOSK_AVAILABLE = False

VOSK_MODEL_PATH = os.path.join(os.path.dirname(__file__), "vosk-model")
OLLAMA_URL = "http://localhost:11434/api/generate"

vosk_model = None
if VOSK_AVAILABLE and os.path.exists(VOSK_MODEL_PATH):
    try:
        vosk_model = Model(VOSK_MODEL_PATH)
    except Exception:
        vosk_model = None

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
    return {"status": "ok", "vosk": VOSK_AVAILABLE and vosk_model is not None}


@router.post("/ask-ai")
async def ask_ai(payload: dict):
    """
    Simple proxy to Ollama generate endpoint.
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
    WebSocket flow for real-time audio streaming.
    """
    await manager.connect(ws)
    rec = None
    if VOSK_AVAILABLE and vosk_model and KaldiRecognizer:
        try:
            rec = KaldiRecognizer(vosk_model, 16000.0)
        except Exception:
            rec = None

    try:
        while True:
            data = await ws.receive_bytes()

            if not data:
                continue

            if rec:
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
                except Exception as e:
                    await ws.send_text(json.dumps({
                        "type": "error",
                        "msg": str(e)
                    }))
            else:
                await ws.send_text(json.dumps({
                    "type": "speech_partial",
                    "text": "[Audio stream active]"
                }))

    except WebSocketDisconnect:
        manager.disconnect(ws)
    except Exception:
        manager.disconnect(ws)
        try:
            await ws.close(code=1011)
        except Exception:
            pass
