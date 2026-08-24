from fastapi import APIRouter

from app.models import RecommendationRequest, RecommendationResponse
from app.services.recommendation_service import recommend_destinations

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.post("/", response_model=list[RecommendationResponse])
def recommendations(request: RecommendationRequest):
    return recommend_destinations(request)
