from uuid import UUID

import httpx
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.schemas.itinerary import Itinerary
from app.services.ai_client import post, preferences_from, to_day
from app.services.itinerary_service import (
    NotFound,
    regenerate_activity,
    regenerate_day,
    regenerate_trip,
)
from app.services.store import get_trip_request, list_itineraries, save_itinerary

router = APIRouter(prefix="/itinerary", tags=["itinerary"])


class CreateItineraryRequest(BaseModel):
    trip_request_id: str


def _guard(action):
    """Run a service call, translating its failures into HTTP responses."""
    try:
        return action()
    except NotFound as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI service request failed: {e}",
        )
    except (ValueError, KeyError) as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI service returned unusable data: {e}",
        )


@router.get("")
def get_itineraries():
    return {"data": list_itineraries()}


@router.post("", response_model=Itinerary, status_code=status.HTTP_201_CREATED)
def create_itinerary(payload: CreateItineraryRequest):
    trip = get_trip_request(payload.trip_request_id)
    if trip is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"trip request {payload.trip_request_id} not found",
        )

    def action():
        raw = post("/itinerary/", {"preferences": preferences_from(trip)})
        itinerary = Itinerary(
            trip_request_id=trip.request_id,
            destination=trip.destination,
            days=[to_day(day, i + 1) for i, day in enumerate(raw["days"])],
        )
        return save_itinerary(itinerary)

    return _guard(action)


@router.post("/{itinerary_id}/regenerate", response_model=Itinerary)
def regenerate_full(itinerary_id: UUID):
    return _guard(lambda: regenerate_trip(itinerary_id))


@router.post("/{itinerary_id}/days/{day_number}/regenerate", response_model=Itinerary)
def regenerate_single_day(itinerary_id: UUID, day_number: int):
    return _guard(lambda: regenerate_day(itinerary_id, day_number))


@router.post(
    "/{itinerary_id}/days/{day_number}/activities/{activity_id}/regenerate",
    response_model=Itinerary,
)
def regenerate_single_activity(itinerary_id: UUID, day_number: int, activity_id: UUID):
    return _guard(lambda: regenerate_activity(itinerary_id, day_number, activity_id))
