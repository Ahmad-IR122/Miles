from pydantic import BaseModel, Field


class RecommendationRequest(BaseModel):
    interests: list[str] = Field(default_factory=list)
    budget: str | None = None
    travel_month: str | int | None = None
    travel_style: str | None = None
    limit: int = Field(default=5, ge=1, le=50)


class RecommendationResponse(BaseModel):
    destination_id: str
    name: str
    country: str | None = None
    description: str | None = None
    score: float
    similarity_score: float
    budget_score: float
    season_score: float
    style_score: float
    matched_interests: list[str]
