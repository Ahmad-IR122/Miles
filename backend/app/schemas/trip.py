from datetime import date, datetime
from decimal import Decimal

from pydantic import AliasChoices, BaseModel, Field, field_validator, model_validator

MAX_TRIP_DAYS = 31
MAX_TRAVELERS = 10


class TripRequest(BaseModel):
    origin: str = Field(..., min_length=1, max_length=100)
    destination: str = Field(..., min_length=1, max_length=100)
    start_date: date
    end_date: date
    adults: int = Field(..., ge=1, le=MAX_TRAVELERS)
    children: int = Field(0, ge=0, le=MAX_TRAVELERS - 1)
    interests: list[str] = Field(default_factory=list, max_length=3)
    other_interest: str | None = Field(default=None, max_length=100)
    budget: float = Field(..., gt=0)

    @field_validator("origin", "destination")
    @classmethod
    def not_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("must not be blank")
        return value

    @model_validator(mode="after")
    def check_dates(self):
        if self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        trip_length = (self.end_date - self.start_date).days + 1
        if trip_length > MAX_TRIP_DAYS:
            raise ValueError(f"trip length cannot exceed {MAX_TRIP_DAYS} days")
        return self

    @model_validator(mode="after")
    def check_travelers(self):
        if self.adults + self.children > MAX_TRAVELERS:
            raise ValueError(f"travelers cannot exceed {MAX_TRAVELERS}")
        return self

    @model_validator(mode="after")
    def check_interests(self):
        if not self.interests and not (
            self.other_interest and self.other_interest.strip()
        ):
            raise ValueError("select at least one interest, or fill in other_interest")
        return self


class TripRequestResponse(BaseModel):
    request_id: str
    user_id: int
    origin: str
    destination: str
    start_date: date
    end_date: date
    adults: int
    children: int
    interests: list[str]
    other_interest: str | None = None
    budget: float


class TripRequestUpdate(BaseModel):
    interests: list[str] = Field(default_factory=list, max_length=3)
    other_interest: str | None = Field(default=None, max_length=100)

    @model_validator(mode="after")
    def check_interests(self):
        if not self.interests and not (
            self.other_interest and self.other_interest.strip()
        ):
            raise ValueError("select at least one interest, or fill in other_interest")
        return self


class TripDestination(BaseModel):
    country: str = Field(..., min_length=1, max_length=100)
    city: str = Field(default="", max_length=100)
    days: int = Field(..., gt=0)

    @field_validator("country")
    @classmethod
    def country_not_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("must not be blank")
        return value


class TripCreate(BaseModel):
    destinations: list[TripDestination] = Field(..., min_length=1)
    start_date: date
    end_date: date
    budget: Decimal | None = Field(
        default=None,
        gt=0,
        validation_alias=AliasChoices("budget", "budget_max"),
    ) 
    currency: str = Field(default="USD", min_length=1, max_length=10)
    travelers_count: int = Field(default=1, ge=1, le=MAX_TRAVELERS)
    adults: int = Field(default=1, ge=1)
    children: int = Field(default=0, ge=0)
    trip_status: str = Field(default="planning", min_length=1, max_length=30)
    additional_notes: str | None = Field(default=None, max_length=1000)
    other_interest: str | None = Field(default=None, max_length=100)

    @field_validator("currency", "trip_status")
    @classmethod
    def not_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("must not be blank")
        return value

    @model_validator(mode="after")
    def check_dates(self):
        if self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        trip_length = (self.end_date - self.start_date).days + 1
        if trip_length > MAX_TRIP_DAYS:
            raise ValueError(f"trip length cannot exceed {MAX_TRIP_DAYS} days")
        allocated_days = sum(destination.days for destination in self.destinations)
        if allocated_days != trip_length:
            raise ValueError("destination days must equal the trip length")
        return self

    @model_validator(mode="after")
    def check_travelers(self):
        if self.adults + self.children != self.travelers_count:
            raise ValueError("adults + children must equal travelers_count")
        if self.adults + self.children > MAX_TRAVELERS:
            raise ValueError(f"travelers cannot exceed {MAX_TRAVELERS}")
        return self


class TripUpdate(BaseModel):
    """Every field optional — only the ones actually sent get applied."""

    destinations: list[TripDestination] | None = Field(default=None, min_length=1)
    start_date: date | None = None
    end_date: date | None = None
    budget: Decimal | None = Field(default=None, gt=0)
    currency: str | None = Field(default=None, min_length=1, max_length=10)
    travelers_count: int | None = Field(default=None, ge=1, le=MAX_TRAVELERS)
    trip_status: str | None = Field(default=None, min_length=1, max_length=30)

    @field_validator("currency", "trip_status")
    @classmethod
    def not_blank(cls, value: str | None) -> str | None:
        if value is not None and not value.strip():
            raise ValueError("must not be blank")
        return value


class TripResponse(BaseModel):
    id: int
    user_id: int
    destinations: list[TripDestination]
    start_date: date
    end_date: date
    budget: Decimal | None = None
    currency: str
    travelers_count: int
    trip_status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}