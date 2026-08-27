import httpx
from fastapi import APIRouter, HTTPException, status

from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
)
from app.services import ai_client

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


@router.post("", response_model=RecommendationResponse)
@router.post("/", response_model=RecommendationResponse)
def get_recommendations(payload: RecommendationRequest):
    try:
        return ai_client.post(
            "/api/recommendations/",
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
