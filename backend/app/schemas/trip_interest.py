from pydantic import BaseModel


class TripInterestCreate(BaseModel):
    interest_id: int