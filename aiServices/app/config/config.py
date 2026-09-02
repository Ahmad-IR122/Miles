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

    AZURE_OPENAI_EMBEDDING_ENDPOINT: str | None = None
    AZURE_OPENAI_EMBEDDING_API_KEY: str | None = None
    AZURE_OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"
    AZURE_OPENAI_EMBEDDING_DEPLOYMENT: str = "text-embedding-3-small"

    AZURE_SEARCH_ENDPOINT: str
    AZURE_SEARCH_API_KEY: str
    AZURE_SEARCH_INDEX_NAME: str


settings = Settings()
