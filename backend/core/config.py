from pydantic_settings import BaseSettings
from typing import Optional
from pathlib import Path

ENV_PATH = Path(__file__).parent.parent / ".env"

class Settings(BaseSettings):
    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3.1-8b-instant"

    FIREBASE_PROJECT_ID: Optional[str] = None
    VITE_FIREBASE_PROJECT_ID: Optional[str] = None

    # Plain string to avoid pydantic JSON parsing issues with env vars
    ALLOWED_ORIGINS_STR: str = "http://localhost:5173,http://localhost:3000"

    MAX_HISTORY_TURNS: int = 20

    class Config:
        env_file = str(ENV_PATH)
        env_file_encoding = "utf-8"
        extra = "ignore"

    @property
    def ALLOWED_ORIGINS(self) -> list:
        return [o.strip() for o in self.ALLOWED_ORIGINS_STR.split(",")]

    @property
    def firebase_project_id(self) -> str:
        return self.FIREBASE_PROJECT_ID or self.VITE_FIREBASE_PROJECT_ID or ""

settings = Settings()