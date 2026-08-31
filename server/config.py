# server-fastapi/config.py
from pydantic_settings import BaseSettings
from typing import Optional
import os
from pathlib import Path

# Get the project root directory (parent of server-fastapi)
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR / ".env"

class Settings(BaseSettings):
    # Database
    database_url: str
    
    # OpenAI
    openai_api_key: Optional[str] = None
    # Local speech-to-text (Vosk)
    vosk_model_path: Optional[str] = None
    
    # Server
    port: int = 8000
    host: str = "0.0.0.0"
    
    # Security
    session_secret: str = "your-random-secret-key-here"
    
    # CORS - Use string instead of list, we'll parse it manually
    cors_origins: str = "http://localhost:5000"
    
    model_config = {
        "env_file": str(ENV_FILE),
        "env_file_encoding": "utf-8",
        "extra": "ignore",
        "case_sensitive": False
    }
    
    def get_cors_list(self) -> list:
        """Convert CORS_ORIGINS string to list"""
        return [origin.strip() for origin in self.cors_origins.split(",")]

settings = Settings()

# Debug: Print loaded values (remove after testing)
print(f"[OK] Config loaded from: {ENV_FILE}")
print(f"[OK] Database URL: Found")
print(f"[OK] CORS Origins: {settings.get_cors_list()}")
