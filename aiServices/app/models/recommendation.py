from typing import Literal

from pydantic import BaseModel, Field


class RecommendationRequest(BaseModel):
    interests: list[str] = Field(default_factory=list)
    budget_level: str
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


class RestaurantRecommendationRequest(BaseModel):
    destination_id: str = Field(min_length=1)

    budget_level: Literal[
        "low",
        "mid",
        "high",
    ]

    limit: int = Field(
        default=5,
        ge=1,
        le=20,
    )


class RestaurantRecommendationItem(BaseModel):
    restaurant_id: str
    destination_id: str
    name: str
    cuisines: str
    budget_level: str
    average_price: float
    rating: float
    review_count: float
    adjusted_rating: float
    budget_score_match: float
    restaurant_score: float


class RestaurantRecommendationResponse(BaseModel):
    recommendations: list[RestaurantRecommendationItem]