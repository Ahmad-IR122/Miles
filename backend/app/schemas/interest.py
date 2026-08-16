from pydantic import BaseModel, Field


class InterestCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class InterestResponse(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class InterestUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)