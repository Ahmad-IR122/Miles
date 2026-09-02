import logging

import pandas as pd
from app.models.recommendation import (
    ActivityResponse,
    RecommendationRequest,
    RecommendationResponse,
    RestaurantRecommendationRequest,
    RestaurantRecommendationResponse,
)
from app.services.recommendation_service import (
    get_budget_level,
    recommend_activities,
    recommend_destinations,
    recommend_restaurants,
)
from azure.core.exceptions import (
    ClientAuthenticationError,
    HttpResponseError,
    ResourceNotFoundError,
    ServiceRequestError,
)
from fastapi import APIRouter, HTTPException, status

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
            "budget_level": get_budget_level(request.budget),
            "travel_month": request.travel_month,
            "style": request.style,
        }

        recommendations = recommend_destinations(
            user_preferences=user_preferences,
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
        logger.exception("Recommendation data file was not found.")
        raise HTTPException(
            status_code=503,
            detail="Recommendation data is unavailable.",
        ) from error

    except HttpResponseError as error:
        logger.exception("Failed to access recommendation data source.")
        raise HTTPException(
            status_code=503,
            detail="Recommendation service is temporarily unavailable.",
        ) from error

    except Exception as error:
        logger.exception("Unexpected recommendation service error.")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred.",
        ) from error


@router.post(
    "/restaurants",
    response_model=RestaurantRecommendationResponse,
)
def get_restaurant_recommendations(
    request: RestaurantRecommendationRequest,
):
    try:
        recommendations = recommend_restaurants(
            destination_id=request.destination_id,
            user_budget=request.budget,
        )

        if not recommendations:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No restaurants found for the selected destination.",
            )

        return {"recommendations": recommendations}

    except HTTPException:
        raise

    except ResourceNotFoundError as error:
        logger.exception("Restaurant recommendation data was not found.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Restaurant recommendation data is unavailable.",
        ) from error

    except ClientAuthenticationError as error:
        logger.exception("Azure authentication failed while loading restaurant data.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Restaurant recommendation service is unavailable.",
        ) from error

    except ServiceRequestError as error:
        logger.exception("Failed to connect to restaurant data source.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to connect to restaurant data source.",
        ) from error

    except HttpResponseError as error:
        logger.exception("Azure returned an error while loading restaurant data.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Restaurant recommendation data is temporarily unavailable.",
        ) from error

    except (
        pd.errors.EmptyDataError,
        pd.errors.ParserError,
    ) as error:
        logger.exception("Restaurant dataset is empty or invalid.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Restaurant recommendation data is invalid.",
        ) from error

    except (
        KeyError,
        TypeError,
        ValueError,
    ) as error:
        logger.exception("Failed to process restaurant recommendation data.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process restaurant recommendation data.",
        ) from error

    except Exception as error:
        logger.exception("Unexpected restaurant recommendation error.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred.",
        ) from error

@router.get(
    "/activities",
    response_model=ActivityResponse,
)
def get_activities_endpoint():
    try:
        activities = recommend_activities()

        if not activities:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No activities found.",
            )

        return {
            "activities": activities,
        }

    except HTTPException:
        raise

    except ResourceNotFoundError as error:
        logger.exception("Activity recommendation data was not found.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Activity recommendation data is unavailable.",
        ) from error

    except ClientAuthenticationError as error:
        logger.exception("Azure authentication failed while loading activity data.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Activity recommendation service is unavailable.",
        ) from error

    except ServiceRequestError as error:
        logger.exception("Failed to connect to activity data source.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to connect to activity data source.",
        ) from error

    except HttpResponseError as error:
        logger.exception("Azure returned an error while loading activity data.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Activity recommendation data is temporarily unavailable.",
        ) from error

    except (
        pd.errors.EmptyDataError,
        pd.errors.ParserError,
    ) as error:
        logger.exception("Activity dataset is empty or invalid.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Activity recommendation data is invalid.",
        ) from error

    except (
        KeyError,
        TypeError,
        ValueError,
    ) as error:
        logger.exception("Failed to process activity recommendation data.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process activity recommendation data.",
        ) from error

    except Exception as error:
        logger.exception("Unexpected activity recommendation error.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred.",
        ) from error
