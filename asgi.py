# ASGI entrypoint for Render and ASGI servers
import os
import sys
from pathlib import Path

# Add server directory to path
server_path = Path(__file__).resolve().parent / "server"
if str(server_path) not in sys.path:
    sys.path.insert(0, str(server_path))

from app import create_app

app = create_app()
