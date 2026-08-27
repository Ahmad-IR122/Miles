from app.clients.azure_openai import get_client
from app.config import settings
from app.models.search import SearchResult


def search_web(query: str, top_k: int = 5) -> list[SearchResult]:
    """Retrieve web results via the Azure OpenAI Responses API's built-in
    web_search tool. No separate Bing resource needed - it's a tool flag on
    the same client/deployment already used for chat.
    """
    client = get_client()
    response = client.responses.create(
        model=settings.AZURE_OPENAI_DEPLOYMENT,
        tools=[{"type": "web_search"}],
        input=query,
    )

    results: list[SearchResult] = []
    for item in response.output:
        if item.type != "message":
            continue
        for content in item.content:
            for annotation in getattr(content, "annotations", []):
                if annotation.type != "url_citation":
                    continue
                results.append(
                    SearchResult(
                        title=annotation.title,
                        content=content.text[
                            annotation.start_index : annotation.end_index
                        ],
                        url=annotation.url,
                        source="web",
                    )
                )

    return results[:top_k]