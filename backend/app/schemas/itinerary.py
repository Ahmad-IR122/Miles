from datetime import date, time
from uuid import UUID, uuid4
from app.schemas.activity import ActivityResponse

from pydantic import BaseModel, ConfigDict, Field


class Activity(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str = Field(..., min_length=1)
    start_time: time
    duration_minutes: int = Field(..., gt=0)
    location: str | None = None
    description: str | None = None
    category: str = "general"
    tags: list[str] = Field(default_factory=list)
    estimated_cost: str | None = None


class DayPlan(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    day_number: int = Field(..., ge=1)
    date: date
    activities: list[Activity] = Field(default_factory=list)


class Itinerary(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    user_id: int
    trip_request_id: str
    destination: str
    days: list[DayPlan] = Field(default_factory=list)


class ItineraryCreate(BaseModel):
    trip_id: int
    version: int = 1
    generated_by: str | None = None


class ItineraryUpdate(BaseModel):
    trip_id: int | None = None
    version: int | None = None
    generated_by: str | None = None


class ItineraryResponse(BaseModel):
    id: int
    trip_id: int
    version: int
    generated_by: str | None = None

    model_config = ConfigDict(from_attributes=True)

class ItineraryDayResponse(BaseModel):
    id: int
    itinerary_id: int
    day_number: int
    date: date
    title: str | None
    summary: str | None
    activities: list["ActivityResponse"] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class ItineraryDetailResponse(BaseModel):
    id: int
    trip_id: int
    version: int
    generated_by: str | None
    days: list[ItineraryDayResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


ItineraryDayResponse.model_rebuild()