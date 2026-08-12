from fastapi import APIRouter, HTTPException

from app.models.travel import (
    ItineraryRequest,
    RegenerateActivityRequest,
    RegenerateDayRequest,
    RegenerateItineraryRequest,
)
from app.services.itinerary import (
    generate_itinerary,
    regenerate_activity,
    regenerate_day,
    regenerate_itinerary,
)

router = APIRouter(prefix="/itinerary", tags=["itinerary"])


@router.post("/")
def itinerary(request: ItineraryRequest):
    result = generate_itinerary(request.preferences, request.travel_data)
    return result


@router.post("/regenerate")
def itinerary_regenerate(request: RegenerateItineraryRequest):
    try:
        result = regenerate_itinerary(
            request.itinerary, request.user_query, request.travel_data
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return result


@router.post("/regenerate-day")
def itinerary_regenerate_day(request: RegenerateDayRequest):
    try:
        result = regenerate_day(
            request.itinerary,
            request.day_number,
            request.user_query,
            request.travel_data,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return result


@router.post("/regenerate-activity")
def itinerary_regenerate_activity(request: RegenerateActivityRequest):
    try:
        result = regenerate_activity(
            request.itinerary,
            request.day_number,
            request.activity_index,
            request.user_query,
            request.travel_data,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return result
