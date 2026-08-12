from pydantic import BaseModel
from typing import Optional


class TravelPreferences(BaseModel):
    destination: str
    start_date: str
    end_date: str
    interests: list[str]
    budget: str


class TravelDataItem(BaseModel):
    name: str
    type: str
    description: str
    location: Optional[str] = None
    tags: Optional[list[str]] = None


class ItineraryActivity(BaseModel):
    time: str
    duration_minutes: int
    activity: str
    category: str  
    tags: list[str]  
    location: str
    recommendation: str
    estimated_cost: Optional[str] = None  


class itinerary_day(BaseModel):
    date: str
    activities: list[ItineraryActivity]


class Itinerary(BaseModel):
    days: list[itinerary_day]


class ItineraryRequest(BaseModel):
    preferences: TravelPreferences
    travel_data: list[TravelDataItem] = []


class RegenerateItineraryRequest(BaseModel):
    itinerary: Itinerary
    user_query: str
    travel_data: list[TravelDataItem] = []


class RegenerateDayRequest(BaseModel):
    itinerary: Itinerary
    day_number: int
    user_query: str
    travel_data: list[TravelDataItem] = []


class RegenerateActivityRequest(BaseModel):
    itinerary: Itinerary
    day_number: int
    activity_index: int
    user_query: str
    travel_data: list[TravelDataItem] = []
