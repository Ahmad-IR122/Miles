from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import (
    SearchIndex, SimpleField, SearchableField, SearchFieldDataType
)
from app.config.config import settings

credential = AzureKeyCredential(settings.AZURE_SEARCH_API_KEY)

fields = [
    SimpleField(name="id", type=SearchFieldDataType.String, key=True),
    SearchableField(name="name", type=SearchFieldDataType.String),
    SearchableField(name="description", type=SearchFieldDataType.String),
    SimpleField(name="type", type=SearchFieldDataType.String, filterable=True),
    SimpleField(name="location", type=SearchFieldDataType.String, filterable=True),
    SimpleField(name="tags", type=SearchFieldDataType.Collection(SearchFieldDataType.String), filterable=True),
    SimpleField(name="budget_level", type=SearchFieldDataType.String, filterable=True),
]

sample_docs = [
    {
        "id": "1",
        "name": "Eiffel Tower",
        "type": "attraction",
        "description": "Iconic iron tower in Paris with panoramic city views.",
        "location": "Paris, France",
        "tags": ["landmark", "sightseeing", "romantic"],
        "budget_level": "medium",
    },
]

def run():
    index_client = SearchIndexClient(settings.AZURE_SEARCH_ENDPOINT, credential)
    index_client.create_or_update_index(SearchIndex(name=settings.AZURE_SEARCH_INDEX_NAME, fields=fields))
    print(f"Index '{settings.AZURE_SEARCH_INDEX_NAME}' created/updated.")

    search_client = SearchClient(settings.AZURE_SEARCH_ENDPOINT, settings.AZURE_SEARCH_INDEX_NAME, credential)
    result = search_client.upload_documents(documents=sample_docs)
    print(f"Uploaded {len(result)} document(s).")

if __name__ == "__main__":
    run()
