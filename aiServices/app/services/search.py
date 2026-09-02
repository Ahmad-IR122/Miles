import json

from app.clients.azure_openai import get_embedding_client
from app.clients.azure_search import get_search_client
from app.config import settings


class SearchService:
    def __init__(self):
        """Summary: initialize Azure AI Search clients.

        Inputs: none.
        Outputs: none; stores configured search clients on the service.
        """
        self.search_client = get_search_client()

    def search(self, query: str, top: int = 5, threshold: float = 0.01):
        """Summary: run vector search, falling back to keyword search.

        Inputs: `query` is the search text; `top` limits results; `threshold`
        optionally filters results by their search score.
        Outputs: a list of matching Azure Search documents.
        """
        try:
            embedding = self._embed_query(query)
        except ValueError:
            results = self.search_client.search(
                search_text=query,
                query_type="simple",
                top=top,
            )
        else:
            results = self.search_client.search(
                search_text=query,
                vector_queries=[
                    {
                        "kind": "vector",
                        "vector": embedding,
                        "k": top,
                        "fields": "contentVector",
                    }
                ],
                query_type="simple",
                top=top,
            )

        results_list = list(results)
        if threshold is not None:
            normalized_threshold = float(threshold)
            filtered_results = []
            for result in results_list:
                raw_score = result.get("@search.score", result.get("score"))
                try:
                    score = float(raw_score)
                except (TypeError, ValueError):
                    continue
                if score >= normalized_threshold:
                    filtered_results.append(result)
            results_list = filtered_results

        sanitized_results = []
        for result in results_list:
            cleaned = {}
            for field, value in result.items():
                if field in {"id", "destination_id"}:
                    continue
                if isinstance(value, (dict, list, tuple)):
                    cleaned[field] = json.dumps(value, default=str)
                elif isinstance(value, float):
                    cleaned[field] = round(value, 6)
                else:
                    cleaned[field] = value
            sanitized_results.append(cleaned)

        return sanitized_results

    def _embed_query(self, query: str):
        """Summary: create an Azure OpenAI embedding for a query.

        Inputs: `query` is the text to embed.
        Outputs: a list of floating-point embedding values.
        """
        deployment = settings.AZURE_OPENAI_EMBEDDING_DEPLOYMENT or ""
        if not deployment:
            raise ValueError("Azure OpenAI embedding deployment is missing.")

        client = get_embedding_client()
        response = client.embeddings.create(
            model=deployment,
            input=query,
        )
        return response.data[0].embedding


search_service = SearchService()
