from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Project A Backend"
    VERSION: str = "0.1.0"
    ENV: str = "development"
    DATABASE_URL: str
    AI_SERVICE_URL: str = "http://127.0.0.1:8001"
    AI_SERVICE_TIMEOUT: float = 120.0
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()
        ]


settings = Settings()
