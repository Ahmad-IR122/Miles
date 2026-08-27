from collections.abc import Callable

from app.models.search import SearchResult


class SearchService:
    """
    Coordinates retrieval from Azure AI Search and Web Search.

    Azure-specific and Web-specific search logic should stay outside this
    service. This class is responsible for deciding when to use each source,
    merging results, removing duplicates, and formatting the final context.
    """

    def __init__(
        self,
        azure_search: Callable[[str, int], list[SearchResult]] | None = None,
        web_search: Callable[[str, int], list[SearchResult]] | None = None,
        min_azure_results: int = 3,
    ):
        self._azure_search = azure_search
        self._web_search = web_search
        self._min_azure_results = min_azure_results

    def _retrieve_ai_search(
        self,
        query: str,
        top_k: int = 5,
    ) -> list[SearchResult]:
        """
        Retrieve results from Azure AI Search.

        The actual Azure Search implementation is provided externally.
        """

        if self._azure_search is None:
            return []

        return self._azure_search(query, top_k)

    def _retrieve_web_search(
        self,
        query: str,
        top_k: int = 5,
    ) -> list[SearchResult]:
        """
        Retrieve results from Web Search.

        The actual Web Search implementation is provided externally.
        """

        if self._web_search is None:
            return []

        return self._web_search(query, top_k)

    def _should_use_web_search(
        self,
        azure_results: list[SearchResult],
    ) -> bool:
        """
        Decide whether Web Search should be used as a fallback.

        For now, Web Search is used when Azure AI Search returns fewer than
        the configured minimum number of relevant results (results below
        MIN_RELEVANCE_SCORE are already filtered out in search_azure()).

        This rule can be changed later after the retrieval strategy is agreed.
        """

        return len(azure_results) < self._min_azure_results

    def _merge_results(
        self,
        azure_results: list[SearchResult],
        web_results: list[SearchResult],
    ) -> list[SearchResult]:
        """
        Merge Azure and Web results while removing obvious duplicates.
        """

        merged_results: list[SearchResult] = []
        seen: set[str] = set()

        for result in azure_results + web_results:
            key = self._deduplication_key(result)

            if key in seen:
                continue

            seen.add(key)
            merged_results.append(result)

        return merged_results

    @staticmethod
    def _deduplication_key(result: SearchResult) -> str:
        """
        Generate a simple key used for duplicate detection.

        URL is preferred when available. Otherwise, title + content are used.
        """

        if result.url:
            return f"url:{result.url.strip().lower()}"

        title = (result.title or "").strip().lower()
        content = result.content.strip().lower()

        return f"content:{title}:{content}"

    def retrieve(
        self,
        query: str,
        top_k: int = 5,
    ) -> list[SearchResult]:
        """
        Retrieve relevant information for a query.

        Flow:
        1. Search Azure AI Search.
        2. Check whether Web Search fallback is needed.
        3. Search the Web when necessary.
        4. Merge and deduplicate the results.
        """

        azure_results = self._retrieve_ai_search(
            query=query,
            top_k=top_k,
        )

        web_results: list[SearchResult] = []

        if self._should_use_web_search(azure_results):
            print(
                f"Azure Search returned {len(azure_results)} relevant result(s) "
                "— falling back to web search"
            )
            web_results = self._retrieve_web_search(
                query=query,
                top_k=top_k,
            )
        else:
            print(
                f"Azure Search returned {len(azure_results)} relevant result(s) "
                "— no web fallback needed"
            )

        return self._merge_results(
            azure_results=azure_results,
            web_results=web_results,
        )

    @staticmethod
    def format_context(results: list[SearchResult]) -> str:
        """
        Convert search results into text that can be passed to the LLM.
        """

        if not results:
            return "No relevant information was found."

        formatted_results: list[str] = []

        for index, result in enumerate(results, start=1):
            parts = [
                f"Result {index}",
                f"Source: {result.source}",
            ]

            if result.title:
                parts.append(f"Title: {result.title}")

            if result.url:
                parts.append(f"URL: {result.url}")

            parts.append(f"Content: {result.content}")

            formatted_results.append("\n".join(parts))

        return "\n\n".join(formatted_results)