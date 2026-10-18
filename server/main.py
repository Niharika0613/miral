# server-fastapi/main.py
import uvicorn
import sys
from pathlib import Path

# Add current directory to path so we can import app and config
sys.path.insert(0, str(Path(__file__).parent))

from app import create_app
from config import settings

# Create app instance
app = create_app()

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", getattr(settings, "port", 8000) or 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"[VaniDarpan] Starting server on {host}:{port} ...", flush=True)
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=False,
        log_level="info",
        access_log=True
    )
