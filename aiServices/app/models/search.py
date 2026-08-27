from pydantic import BaseModel


class SearchResult(BaseModel):
    title: str | None = None
    content: str
    url: str | None = None
    source: str