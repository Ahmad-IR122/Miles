from app.clients.azure_ai_search import get_search_client


class SearchService:
    def __init__(self):
        self.client = get_search_client()

    def search(self, query: str, top: int = 5, filters: str | None = None):
        results = self.client.search(
            search_text=query,
            top=top,
            filter=filters,
        )
        return [dict(r) for r in results]

    def vector_search(
        self, vector: list[float], vector_field: str = "content_vector", top: int = 5
    ):
        from azure.search.documents.models import VectorizedQuery

        vq = VectorizedQuery(
            vector=vector, k_nearest_neighbors=top, fields=vector_field
        )
        results = self.client.search(search_text=None, vector_queries=[vq])
        return [dict(r) for r in results]

    def upload_documents(self, documents: list[dict]):
        return self.client.upload_documents(documents=documents)
