from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Project A Backend"
    VERSION: str = "0.1.0"
    ENV: str = "development"
    DATABASE_URL: str
    AI_SERVICE_URL: str = "http://127.0.0.1:8001"
    AI_SERVICE_TIMEOUT: float = 120.0
    CORS_ORIGINS: str = (
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
    )
    CLERK_WEBHOOK_SECRET: str


    CLERK_ISSUER: str = "https://deep-gobbler-20.clerk.accounts.dev"
    CLERK_JWKS_URL: str = ""
    CLERK_AUTHORIZED_PARTIES: str = ""
    CLERK_JWT_LEEWAY_SECONDS: int = 5

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()
        ]

    @model_validator(mode="after")
    def _default_clerk_jwks_url(self) -> "Settings":
        if not self.CLERK_JWKS_URL:
            issuer = self.CLERK_ISSUER.rstrip("/")
            self.CLERK_JWKS_URL = f"{issuer}/.well-known/jwks.json"
        return self

    @property
    def clerk_authorized_parties(self) -> list[str]:
        parties = self.CLERK_AUTHORIZED_PARTIES.split(",")
        return [p.strip() for p in parties if p.strip()]


settings = Settings()