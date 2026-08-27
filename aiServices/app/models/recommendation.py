from pydantic import BaseModel, Field


class RecommendationRequest(BaseModel):
  interests: list[str] = Field(default_factory=list)
  budget_level:str
  travel_month: int = Field(ge=1, le=12)
  style: str
  limit: int = Field(default=5, ge=1, le=20)
  
class RecommendationItem(BaseModel):
    destination_id: str
    city: str
    country: str
    region: str
    style: str
    budget_level: str
    similarity_score: float
    budget_score_match: float
    season_score_match: float
    style_score_match: float
    final_score: float


class RecommendationResponse(BaseModel):
    recommendations: list[RecommendationItem]
