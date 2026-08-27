from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient

from app.config import settings
from app.models.search import SearchResult

MIN_RELEVANCE_SCORE = 12  # tune after testing against real queries


def get_search_client() -> SearchClient:
    return SearchClient(
        endpoint=settings.AZURE_SEARCH_ENDPOINT,
        index_name=settings.AZURE_SEARCH_INDEX_NAME,
        credential=AzureKeyCredential(settings.AZURE_SEARCH_API_KEY),
    )

def search_azure(query: str, top_k: int = 5) -> list[SearchResult]:
    client = get_search_client()
    try:
        hits = client.search(
            search_text=query,
            top=top_k,
            select=["name", "rag_text", "description"],
        )
        hits = list(hits)
        results = [
            SearchResult(
                title=hit.get("name"),
                content=hit.get("rag_text") or hit.get("description", ""),
                url=None,
                source="azure_search",
            )
            for hit in hits
            if hit["@search.score"] >= MIN_RELEVANCE_SCORE
        ]
        print(f"[azure_search] {len(results)}/{len(hits)} hit(s) above score threshold")
        return results
    except Exception as e:
        print(f"[azure_search] ERROR: {type(e).__name__}: {e}")
        return []
    