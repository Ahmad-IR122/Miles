"""Clients for external AI and search services."""

from .azure_openai import get_client
from .azure_search import get_search_client

__all__ = ["get_client", "get_search_client"]
