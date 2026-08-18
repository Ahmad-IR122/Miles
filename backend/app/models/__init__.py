# Importing every model registers it with SQLAlchemy's class registry, so
# relationship() strings like "User" resolve when mappers configure.
from .activity_models import Activity
from .conversation_models import Conversation, Message
from .interest_models import Interest
from .itinerary_day_models import ItineraryDay
from .itinerary_models import Itinerary
from .trip_interest_models import TripInterest
from .trip_models import Trip
from .trip_preference_models import TripPreference
from .user_models import User

__all__ = [
    "Activity",
    "Conversation",
    "Interest",
    "Itinerary",
    "ItineraryDay",
    "Message",
    "Trip",
    "TripInterest",
    "TripPreference",
    "User",
]
