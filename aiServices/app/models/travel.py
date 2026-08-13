from pydantic import BaseModel


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
    location: str | None = None
    tags: list[str] | None = None

    category: str | None = None
    estimated_duration_minutes: int | None = None
    time_of_day: str | None = None
    rating: float | None = None
    review_count: float | None = None
    indoor_outdoor: str | None = None

    cuisines: str | None = None
    price_range: str | None = None
    meal_type: str | None = None
    budget_level: str | None = None


class ItineraryActivity(BaseModel):
    time: str
    duration_minutes: int
    activity: str
    category: str
    tags: list[str]
    location: str
    recommendation: str
    estimated_cost: str | None = None


class ItineraryDay(BaseModel):
    date: str
    activities: list[ItineraryActivity]


class Itinerary(BaseModel):
    days: list[ItineraryDay]


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
