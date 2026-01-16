from typing import List
from pydantic_settings import BaseSettings
#from pydantic import AnyHttpUrl

class Settings(BaseSettings):
    # FastAPI leerá automáticamente estas variables del archivo .env
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",    # Frontend Vite local
        "http://127.0.0.1:5173",    # Alternativa local
        # "https://cordoba-pro.com" # Futuro dominio de producción
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()