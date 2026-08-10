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


class ItineraryDay(BaseModel):
    date: str
    activities: list[ItineraryActivity]


class Itinerary(BaseModel):
    days: list[ItineraryDay]


class ItineraryRequest(BaseModel):
    preferences: TravelPreferences
    travel_data: list[TravelDataItem] = []
