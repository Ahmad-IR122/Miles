"""Request and itinerary models used by the AI service."""

from .rag import ChatRequest, ChatResponse
from .travel import (
    Itinerary,
    ItineraryActivity,
    ItineraryDay,
    ItineraryRequest,
    RegenerateActivityRequest,
    RegenerateDayRequest,
    RegenerateItineraryRequest,
    TravelDataItem,
    TravelPreferences,
)

__all__ = [
    "ChatRequest",
    "ChatResponse",
    "Itinerary",
    "ItineraryActivity",
    "ItineraryDay",
    "ItineraryRequest",
    "RegenerateActivityRequest",
    "RegenerateDayRequest",
    "RegenerateItineraryRequest",
    "TravelDataItem",
    "TravelPreferences",
]
