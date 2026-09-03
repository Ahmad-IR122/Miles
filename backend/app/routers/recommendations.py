import httpx
from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.recommendation import (
    DEFAULT_RECOMMENDATION_LIMIT,
    MAX_RECOMMENDATION_LIMIT,
    ActivityResponse,
    RecommendationRequest,
    RecommendationResponse,
    RestaurantRecommendationRequest,
    RestaurantRecommendationResponse,
)
from app.services import ai_client

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


def _ai_error_detail(error: httpx.HTTPStatusError):
    try:
        body = error.response.json()
    except ValueError:
        return error.response.text

    if isinstance(body, dict) and "detail" in body:
        return body["detail"]

    return body


@router.post("", response_model=RecommendationResponse)
@router.post("/", response_model=RecommendationResponse)
def get_recommendations(payload: RecommendationRequest):
    try:
        return ai_client.post(
            "/api/recommendations",
            payload.model_dump(),
        )
    except httpx.HTTPStatusError as error:
        response_text = error.response.text
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "AI service returned "
                f"{error.response.status_code}: {response_text}"
            ),
        ) from error
    except httpx.HTTPError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI service request failed: {error}",
        ) from error


@router.get("/activities", response_model=ActivityResponse)
@router.get("/activities/", response_model=ActivityResponse)
def get_activities(
    limit: int = Query(
        default=DEFAULT_RECOMMENDATION_LIMIT, ge=1, le=MAX_RECOMMENDATION_LIMIT
    ),
    offset: int = Query(default=0, ge=0),
):
    try:
        return ai_client.get(
            "/api/recommendations/activities",
            params={"limit": limit, "offset": offset},
        )
    except httpx.HTTPStatusError as error:
        if error.response.status_code in {
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_404_NOT_FOUND,
            status.HTTP_422_UNPROCESSABLE_ENTITY,
        }:
            raise HTTPException(
                status_code=error.response.status_code,
                detail=_ai_error_detail(error),
            ) from error

        response_text = error.response.text
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "AI service returned "
                f"{error.response.status_code}: {response_text}"
            ),
        ) from error
    except httpx.HTTPError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI service request failed: {error}",
        ) from error


@router.post("/restaurants", response_model=RestaurantRecommendationResponse)
@router.post("/restaurants/", response_model=RestaurantRecommendationResponse)
def get_restaurant_recommendations(payload: RestaurantRecommendationRequest):
    try:
        return ai_client.post(
            "/api/recommendations/restaurants",
            payload.model_dump(),
        )
    except httpx.HTTPStatusError as error:
        if error.response.status_code in {
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_404_NOT_FOUND,
            status.HTTP_422_UNPROCESSABLE_ENTITY,
        }:
            raise HTTPException(
                status_code=error.response.status_code,
                detail=_ai_error_detail(error),
            ) from error

        response_text = error.response.text
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "AI service returned "
                f"{error.response.status_code}: {response_text}"
            ),
        ) from error
    except httpx.HTTPError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI service request failed: {error}",
        ) from error

