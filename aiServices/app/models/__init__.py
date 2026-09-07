"""Request and itinerary models used by the AI service."""

from .recommendation import RecommendationRequest, RecommendationResponse
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
    "RecommendationRequest",
    "RecommendationResponse",
    "RegenerateActivityRequest",
    "RegenerateDayRequest",
    "RegenerateItineraryRequest",
    "TravelDataItem",
    "TravelPreferences",
]
