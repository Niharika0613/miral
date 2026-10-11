# Root app.py entrypoint for Render and ASGI runners
import os
import sys
from pathlib import Path

# Add server directory to path
server_path = Path(__file__).resolve().parent / "server"
if str(server_path) not in sys.path:
    sys.path.insert(0, str(server_path))

from app import create_app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    uvicorn.run("app:app", host=host, port=port)
