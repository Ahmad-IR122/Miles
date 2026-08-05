from datetime import date

from pydantic import BaseModel, Field, field_validator, model_validator

MAX_TRIP_DAYS = 31


class TripRequest(BaseModel):
    origin: str = Field(..., min_length=1, max_length=100)
    destination: str = Field(..., min_length=1, max_length=100)
    start_date: date
    end_date: date
    adults: int = Field(..., ge=1)
    children: int = Field(0, ge=0)
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
    def check_interests(self):
        if not self.interests and not (self.other_interest and self.other_interest.strip()):
            raise ValueError("select at least one interest, or fill in other_interest")
        return self


class TripRequestResponse(BaseModel):
    request_id: str
    origin: str
    destination: str
    start_date: date
    end_date: date
    adults: int
    children: int
    interests: list[str]
    other_interest: str | None = None
    budget: float