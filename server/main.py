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
    """
    Run FastAPI server
    Matches: server/index-dev.ts behavior
    """
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
        log_level="info",
        access_log=False  # Suppress 404 logs for favicon, etc.
    )
