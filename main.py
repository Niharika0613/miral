# Root entrypoint for Render and production deployment
import os
import sys
from pathlib import Path

# Add 'server' directory to sys.path so all server modules import cleanly
server_path = Path(__file__).resolve().parent / "server"
if str(server_path) not in sys.path:
    sys.path.insert(0, str(server_path))

from app import create_app
from config import settings

# Create FastAPI app instance
app = create_app()

if __name__ == "__main__":
    import uvicorn
    # Render passes PORT environment variable (typically 10000)
    port = int(os.environ.get("PORT", getattr(settings, "port", 8000) or 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"[MIRAL] Starting production server on {host}:{port} ...", flush=True)
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=False,
        access_log=True,
    )
