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


def get_embedding_client():
    endpoint = settings.AZURE_OPENAI_EMBEDDING_ENDPOINT or ""
    api_key = settings.AZURE_OPENAI_EMBEDDING_API_KEY or ""

    if not endpoint or not api_key:
        raise ValueError("Azure OpenAI embedding configuration is missing.")

    return AzureOpenAI(
        api_key=api_key,
        azure_endpoint=endpoint,
        api_version=settings.AZURE_OPENAI_API_VERSION,
    )
