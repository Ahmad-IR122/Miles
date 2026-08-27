"""Pydantic schemas used by the backend API."""

from .activity import ActivityCreate, ActivityResponse, ActivityUpdate
from .conversation import (
    ConversationCreate,
    ConversationResponse,
    ConversationUpdate,
    MessageCreate,
    MessageResponse,
)
from .interest import InterestCreate, InterestResponse, InterestUpdate
from .itinerary import (
    Activity,
    DayPlan,
    Itinerary,
    ItineraryCreate,
    ItineraryDayResponse,
    ItineraryDetailResponse,
    ItineraryResponse,
    ItineraryUpdate,
)
from .recommendation import (
    RecommendationItem,
    RecommendationRequest,
    RecommendationResponse,
)
from .trip import (
    MAX_TRIP_DAYS,
    TripCreate,
    TripRequest,
    TripRequestResponse,
    TripRequestUpdate,
    TripResponse,
    TripUpdate,
)
from .user import UserResponse

__all__ = [
    "Activity",
    "ActivityCreate",
    "ActivityResponse",
    "ActivityUpdate",
    "ConversationCreate",
    "ConversationResponse",
    "ConversationUpdate",
    "DayPlan",
    "InterestCreate",
    "InterestResponse",
    "InterestUpdate",
    "Itinerary",
    "ItineraryCreate",
    "ItineraryDayResponse",
    "ItineraryDetailResponse",
    "ItineraryResponse",
    "ItineraryUpdate",
    "MAX_TRIP_DAYS",
    "MessageCreate",
    "MessageResponse",
    "RecommendationItem",
    "RecommendationRequest",
    "RecommendationResponse",
    "TripCreate",
    "TripRequest",
    "TripRequestResponse",
    "TripRequestUpdate",
    "TripResponse",
    "TripUpdate",
    "UserResponse",
]
