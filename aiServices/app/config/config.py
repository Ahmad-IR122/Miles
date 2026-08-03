from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )
    # Azure OpenAI configuration
    AZURE_OPENAI_ENDPOINT: str 
    AZURE_OPENAI_DEPLOYMENT: str
    AZURE_OPENAI_API_KEY: str 
    AZURE_OPENAI_API_VERSION: str
    
    # Azure AI Search
    AZURE_SEARCH_ENDPOINT: str
    AZURE_SEARCH_API_KEY: str
    AZURE_SEARCH_INDEX_NAME: str

settings = Settings()
