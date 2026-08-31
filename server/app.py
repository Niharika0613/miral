# server-fastapi/app.py
from fastapi import FastAPI, Request, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from datetime import datetime
import time
import json
import os
from typing import Optional, Set

import numpy as np
import requests

from routes import router
from config import settings
from database import engine, Base
from models import User, Session  # Import models to register them

# Try to import vosk
try:
    from vosk import Model, KaldiRecognizer
    VOSK_AVAILABLE = True
except ImportError:
    VOSK_AVAILABLE = False

def create_app() -> FastAPI:
    """
    Create and configure FastAPI application
    """
    app = FastAPI(
        title="MiralAI API",
        description="Confidence Building & Public Speaking Practice Platform",
        version="2.0.0",
        # Serialize responses using field aliases (snake_case -> camelCase)
        response_model_by_alias=True,
    )
    
    # CORS middleware - FIX: Use get_cors_list() method
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.get_cors_list(),  # ← Changed this line
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Custom exception handler for validation errors (422)
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        """
        Custom handler for 422 validation errors to provide better error messages
        """
        errors = exc.errors()
        error_messages = []
        for error in errors:
            field = ".".join(str(loc) for loc in error.get("loc", []))
            message = error.get("msg", "Validation error")
            error_messages.append(f"{field}: {message}")
        
        error_detail = "; ".join(error_messages) if error_messages else "Validation error"
        print(f"Validation error on {request.url.path}: {error_detail}")
        
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "message": error_detail,
                "detail": errors
            }
        )
    
    # Request logging middleware
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        start_time = time.time()
        
        # Log request details for API endpoints
        if request.url.path.startswith("/api"):
            formatted_time = datetime.now().strftime("%I:%M:%S %p")
            print(f"{formatted_time} [fastapi] {request.method} {request.url.path}")
        
        response = await call_next(request)
        duration = int((time.time() - start_time) * 1000)
        
        if request.url.path.startswith("/api"):
            formatted_time = datetime.now().strftime("%I:%M:%S %p")
            log_line = f"{formatted_time} [fastapi] {request.method} {request.url.path} {response.status_code} in {duration}ms"
            
            if len(log_line) > 80:
                log_line = log_line[:79] + "…"
            
            print(log_line)
        
        return response
    
    # Include API routes
    app.include_router(router)
    
    # Initialize database tables on startup
    @app.on_event("startup")
    async def init_db():
        """Create database tables if they don't exist"""
        try:
            async with engine.begin() as conn:
                # Create all tables
                await conn.run_sync(Base.metadata.create_all)
            print("[OK] Database tables initialized successfully")
        except Exception as e:
            print(f"[WARNING] Could not initialize database tables: {e}")
            print("   Make sure your database is accessible and DATABASE_URL is correct")
    
    # Root endpoint
    @app.get("/")
    async def root():
        return {
            "message": "MiralAI FastAPI Backend",
            "version": "2.0.0",
            "status": "running"
        }
    
    # Health check endpoint
    @app.get("/health")
    async def health_check():
        vosk_available = VOSK_AVAILABLE and get_vosk_model() is not None
        return {
            "status": "ok",
            "vosk_available": vosk_available,
            "ollama_url": "http://localhost:11434/api/generate"
        }
    
    # ============ WebSocket & Ollama Endpoints ============
    
    # Global Vosk model
    vosk_model: Optional[Model] = None
    
    def get_vosk_model() -> Optional[Model]:
        """Lazy load Vosk model"""
        nonlocal vosk_model
        if vosk_model is None and VOSK_AVAILABLE:
            try:
                vosk_path = getattr(settings, 'vosk_model_path', None) or "./vosk-model"
                if os.path.isdir(vosk_path):
                    vosk_model = Model(vosk_path)
                    print(f"✅ Vosk model loaded from {vosk_path}")
                else:
                    print(f"⚠️  Vosk model path not found: {vosk_path}")
            except Exception as e:
                print(f"⚠️  Failed to load Vosk model: {e}")
        return vosk_model
    
    # Ollama proxy endpoint
    @app.post("/ask-ai")
    async def ask_ai(payload: dict):
        """Proxy to Ollama generate endpoint"""
        try:
            if "model" not in payload or "prompt" not in payload:
                raise ValueError("Missing 'model' or 'prompt'")
            
            ollama_url = "http://localhost:11434/api/generate"
            print(f"🤖 Calling Ollama: {payload['model']}")
            
            response = requests.post(ollama_url, json=payload, timeout=30)
            
            if response.status_code != 200:
                return {"error": f"Ollama returned {response.status_code}"}
            
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
            return {"error": "Cannot connect to Ollama at http://localhost:11434"}
        except Exception as e:
            return {"error": str(e)}
    
    # Connection manager for WebSocket
    class ConnectionManager:
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
    
    # WebSocket endpoint for audio streaming
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
                
                if rec:
                    try:
                        if rec.AcceptWaveform(data):
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
    
    return app
