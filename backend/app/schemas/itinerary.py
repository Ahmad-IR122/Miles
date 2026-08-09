from datetime import date, time
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class Activity(BaseModel):
    name: str = Field(..., min_length=1)
    start_time: time
    duration_minutes: int = Field(..., gt=0)
    location: str | None = None
    description: str | None = None


class DayPlan(BaseModel):
    day_number: int = Field(..., ge=1)
    date: date
    activities: list[Activity] = Field(default_factory=list)


class Itinerary(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    trip_request_id: str
    destination: str
    days: list[DayPlan] = Field(default_factory=list)
