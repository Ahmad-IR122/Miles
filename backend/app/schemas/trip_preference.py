from pydantic import BaseModel, Field


class TripPreferenceCreate(BaseModel):
    travel_style: str | None = Field(default=None, max_length=100)
    budget_level: str | None = Field(default=None, max_length=50)
    food_preference: str | None = Field(default=None, max_length=100)
    accommodation_type: str | None = Field(default=None, max_length=100)
    transportation_preference: str | None = Field(default=None, max_length=100)
    notes: str | None = None


class TripPreferenceUpdate(BaseModel):
    travel_style: str | None = Field(default=None, max_length=100)
    budget_level: str | None = Field(default=None, max_length=50)
    food_preference: str | None = Field(default=None, max_length=100)
    accommodation_type: str | None = Field(default=None, max_length=100)
    transportation_preference: str | None = Field(default=None, max_length=100)
    notes: str | None = None


class TripPreferenceResponse(BaseModel):
    id: int
    trip_id: int
    travel_style: str | None = None
    budget_level: str | None = None
    food_preference: str | None = None
    accommodation_type: str | None = None
    transportation_preference: str | None = None
    notes: str | None = None

    model_config = {"from_attributes": True}