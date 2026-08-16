from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Project A Backend"
    VERSION: str = "0.1.0"
    ENV: str = "development"
    DATABASE_URL: str
    AI_SERVICE_URL: str = "http://127.0.0.1:8001"
    AI_SERVICE_TIMEOUT: float = 120.0
    CLERK_WEBHOOK_SECRET: str

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()