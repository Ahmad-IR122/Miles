from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from app.config.config import settings

def get_search_client() -> SearchClient:
    return SearchClient(
        endpoint=settings.AZURE_SEARCH_ENDPOINT,
        index_name=settings.AZURE_SEARCH_INDEX_NAME,
        credential=AzureKeyCredential(settings.AZURE_SEARCH_API_KEY),
    )
