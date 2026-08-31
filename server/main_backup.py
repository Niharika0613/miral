# server-fastapi/main.py
import uvicorn
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
        reload=True,  # Auto-reload on code changes (development)
        log_level="info"
    )
