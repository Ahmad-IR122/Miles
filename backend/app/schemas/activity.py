from datetime import time
from decimal import Decimal

from pydantic import BaseModel, Field


class ActivityCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    description: str | None = None
    location_name: str | None = Field(default=None, max_length=200)
    latitude: Decimal | None = None
    longitude: Decimal | None = None
    start_time: time | None = None
    end_time: time | None = None
    estimated_cost: Decimal | None = None
    category: str | None = Field(default=None, max_length=100)
    activity_order: int = Field(default=1, ge=1)


class ActivityResponse(BaseModel):
    id: int
    itinerary_day_id: int
    name: str
    description: str | None
    location_name: str | None
    latitude: Decimal | None
    longitude: Decimal | None
    start_time: time | None
    end_time: time | None
    estimated_cost: Decimal | None
    category: str | None
    activity_order: int

    model_config = {"from_attributes": True}


class ActivityUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=150)
    description: str | None = None
    location_name: str | None = Field(default=None, max_length=200)
    latitude: Decimal | None = None
    longitude: Decimal | None = None
    start_time: time | None = None
    end_time: time | None = None
    estimated_cost: Decimal | None = None
    category: str | None = Field(default=None, max_length=100)
    activity_order: int | None = Field(default=None, ge=1)
