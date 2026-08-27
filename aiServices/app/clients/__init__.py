"""Clients for external AI and search services."""

from .azure_openai import get_client
from .azure_search import get_search_client, search_azure
from .web_search import search_web

__all__ = ["get_client", "get_search_client", "search_azure", "search_web"]
