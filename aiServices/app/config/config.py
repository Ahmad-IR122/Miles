from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )
    AZURE_OPENAI_ENDPOINT: str 
    AZURE_OPENAI_DEPLOYMENT: str
    AZURE_OPENAI_API_KEY: str 
    AZURE_OPENAI_API_VERSION: str

settings = Settings()
