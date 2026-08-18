from azure.identity import DefaultAzureCredential, get_bearer_token_provider
from openai import AzureOpenAI

from app.config import settings


def get_client():
    print("Creating Azure client...")
    print(settings.AZURE_OPENAI_ENDPOINT)
    print(settings.AZURE_OPENAI_API_VERSION)

    if settings.AZURE_OPENAI_API_KEY:
        print("Using API Key")
        return AzureOpenAI(
            api_key=settings.AZURE_OPENAI_API_KEY,
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
            api_version="2025-03-01-preview",
        )
    token_provider = get_bearer_token_provider(
        DefaultAzureCredential(),
        "https://cognitiveservices.azure.com/.default",
    )
    return AzureOpenAI(
        azure_ad_token_provider=token_provider,
        azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
        api_version=settings.AZURE_OPENAI_API_VERSION,
    )
