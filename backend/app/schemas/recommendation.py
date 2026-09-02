from pydantic import BaseModel, Field


class RecommendationRequest(BaseModel):
    interests: list[str] = Field(default_factory=list)
    budget_level: str
    travel_month: int = Field(ge=1, le=12)
    style: str


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
    budget: float = Field(ge=0)


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


class ActivityItem(BaseModel):
    activity_id: str | None = None
    destination_id: str | None = None
    city: str | None = None
    country: str | None = None
    name: str | None = None
    category: str | None = None
    description: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    website: str | None = None
    rating: float | None = None
    review_count: float | None = None
    estimated_duration_minutes: float | None = None
    time_of_day: str | None = None
    indoor_outdoor: str | None = None
    interest_tags: str | None = None


class ActivityResponse(BaseModel):
    activities: list[ActivityItem]
