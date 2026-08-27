import logging

from azure.core.exceptions import HttpResponseError, ResourceNotFoundError
from fastapi import APIRouter, HTTPException

from app.models.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
)
from app.services.recommendation_service import recommend_destinations

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"],
)


@router.post(
    "",
    response_model=RecommendationResponse,
)
@router.post(
    "/",
    response_model=RecommendationResponse,
)
def get_recommendations(
    request: RecommendationRequest,
):
    try:
        user_preferences = {
            "interests": request.interests,
            "budget_level": request.budget_level,
            "travel_month": request.travel_month,
            "style": request.style,
        }

        recommendations = recommend_destinations(
            user_preferences=user_preferences,
            limit=request.limit,
        )

        return {"recommendations": recommendations}

    except ValueError as error:
        logger.warning(
            "Invalid recommendation data: %s",
            error,
        )
        raise HTTPException(
            status_code=400,
            detail="Invalid recommendation data.",
        ) from error

    except ResourceNotFoundError as error:
        logger.exception(
            "Recommendation data file was not found."
        )
        raise HTTPException(
            status_code=503,
            detail="Recommendation data is unavailable.",
        ) from error

    except HttpResponseError as error:
        logger.exception(
            "Failed to access recommendation data source."
        )
        raise HTTPException(
            status_code=503,
            detail="Recommendation service is temporarily unavailable.",
        ) from error

    except Exception as error:
        logger.exception(
            "Unexpected recommendation service error."
        )
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred.",
        ) from error
