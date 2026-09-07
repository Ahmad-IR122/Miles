"""HTTP routers exposed by the AI service."""

from . import health, itinerary

__all__ = ["health", "itinerary", "recommendations"]
