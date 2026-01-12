from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # FastAPI leerá automáticamente estas variables del archivo .env
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    class Config:
        env_file = ".env"

settings = Settings()