from uuid import UUID

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db import get_db
from app.models import User
from app.schemas import (
    Itinerary,
    ItineraryCreate,
    ItineraryResponse,
    ItineraryUpdate,
)
from app.services import itinerary_service
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
def get_stored_itineraries(current_user: User = Depends(get_current_user)):
    owned = [
        itinerary
        for itinerary in list_itineraries()
        if itinerary.user_id == current_user.id
    ]
    return {"data": owned}


@router.post("", response_model=Itinerary, status_code=status.HTTP_201_CREATED)
def create_generated_itinerary(
    payload: CreateItineraryRequest,
    current_user: User = Depends(get_current_user),
):
    trip = get_trip_request(payload.trip_request_id)
    if trip is None or trip.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"trip request {payload.trip_request_id} not found",
        )

    def action():
        raw = post("/itinerary/", {"preferences": preferences_from(trip)})
        itinerary = Itinerary(
            user_id=current_user.id,
            trip_request_id=trip.request_id,
            destination=trip.destination,
            days=[to_day(day, i + 1) for i, day in enumerate(raw["days"])],
        )
        return save_itinerary(itinerary)

    return _guard(action)


@router.post("/{itinerary_id}/regenerate", response_model=Itinerary)
def regenerate_full(
    itinerary_id: UUID,
    current_user: User = Depends(get_current_user),
):
    return _guard(lambda: regenerate_trip(itinerary_id, current_user.id))


@router.post("/{itinerary_id}/days/{day_number}/regenerate", response_model=Itinerary)
def regenerate_single_day(
    itinerary_id: UUID,
    day_number: int,
    current_user: User = Depends(get_current_user),
):
    return _guard(lambda: regenerate_day(itinerary_id, day_number, current_user.id))


@router.post(
    "/{itinerary_id}/days/{day_number}/activities/{activity_id}/regenerate",
    response_model=Itinerary,
)
def regenerate_single_activity(
    itinerary_id: UUID,
    day_number: int,
    activity_id: UUID,
    current_user: User = Depends(get_current_user),
):
    return _guard(
        lambda: regenerate_activity(
            itinerary_id, day_number, activity_id, current_user.id
        )
    )


"""
AHMAD IRSHAID SPACE FOR NEW CODE
"""


@router.post("/create_itinerary/", response_model=ItineraryResponse)
def create_db_itinerary(
    itinerary_data: ItineraryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return itinerary_service.create_itinerary(
        db,
        current_user.id,
        itinerary_data,
    )


@router.get("/get_all_itineraries/", response_model=list[ItineraryResponse])
def get_all_db_itineraries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return itinerary_service.get_all_itineraries(db, current_user.id)


@router.get("/get_itinerary/{itinerary_id}", response_model=ItineraryResponse)
def get_itinerary(
    itinerary_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return itinerary_service.get_itinerary_by_id(
        db,
        itinerary_id,
        current_user.id,
    )


@router.put("/update_itinerary/{itinerary_id}", response_model=ItineraryResponse)
def update_itinerary(
    itinerary_id: int,
    itinerary_data: ItineraryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return itinerary_service.update_itinerary(
        db,
        itinerary_id,
        current_user.id,
        itinerary_data,
    )


@router.delete("/delete_itinerary/{itinerary_id}")
def delete_itinerary(
    itinerary_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return itinerary_service.delete_itinerary(
        db,
        itinerary_id,
        current_user.id,
    )
