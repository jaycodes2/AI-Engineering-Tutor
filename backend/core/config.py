from pydantic_settings import BaseSettings
from typing import List, Optional
from pathlib import Path

ENV_PATH = Path(__file__).parent.parent / ".env"

class Settings(BaseSettings):
    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3.1-8b-instant"

    FIREBASE_PROJECT_ID: Optional[str] = None
    VITE_FIREBASE_PROJECT_ID: Optional[str] = None

    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://ai-engineering-tutor.vercel.app",
    ]
    MAX_HISTORY_TURNS: int = 20

    class Config:
        env_file = str(ENV_PATH)
        env_file_encoding = "utf-8"
        extra = "ignore"

    @property
    def firebase_project_id(self) -> str:
        return self.FIREBASE_PROJECT_ID or self.VITE_FIREBASE_PROJECT_ID or ""

settings = Settings()