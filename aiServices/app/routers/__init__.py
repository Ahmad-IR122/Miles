"""HTTP routers exposed by the AI service."""

from . import health, itinerary, rag

__all__ = ["health", "itinerary", "rag", "recommendations"]
