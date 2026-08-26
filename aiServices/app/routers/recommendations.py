from fastapi import APIRouter, HTTPException

from app.models.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
)
from app.services.recommendation_service import recommend_destinations

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.post("/", response_model=RecommendationResponse)
def get_recommendations(request: RecommendationRequest):
    try:
        user_preferences = {
            "interests": request.interests,
            "budget_level": request.budget_level,
            "travel_month": request.travel_month,
            "style": request.style,
        }

        recommendations = recommend_destinations(
            user_preferences=user_preferences, limit=request.limit
        )

        return {"recommendations": recommendations}
    except Exception as error:
        raise HTTPException(
            status_code=500, detail="Failed to generate recommendations."
        ) from error
