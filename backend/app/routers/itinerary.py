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
    ItineraryDetailResponse,
    ItineraryResponse,
    ItineraryUpdate,
)
from app.services import itinerary_service
from app.services.itinerary_service import (
    NotFound,
    generate_itinerary_for_trip,
    regenerate_activity,
    regenerate_day,
    regenerate_trip,
)
from app.services.store import list_itineraries

router = APIRouter(prefix="/itinerary", tags=["itinerary"])


class CreateItineraryRequest(BaseModel):
    trip_id: int


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
def get_stored_itineraries():
    return {"data": list_itineraries()}


@router.post(
    "", response_model=ItineraryDetailResponse, status_code=status.HTTP_201_CREATED
)
def create_generated_itinerary(
    payload: CreateItineraryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _guard(
        lambda: generate_itinerary_for_trip(db, payload.trip_id, current_user.id)
    )


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


"""
AHMAD IRSHAID SPACE FOR NEW CODE
"""


@router.post("/create_itinerary/", response_model=ItineraryResponse)
def create_db_itinerary(
    itinerary_data: ItineraryCreate,
    db: Session = Depends(get_db),
):
    return itinerary_service.create_itinerary(
        db,
        itinerary_data,
    )


@router.get("/get_all_itineraries/", response_model=list[ItineraryResponse])
def get_all_db_itineraries(
    db: Session = Depends(get_db),
):
    return itinerary_service.get_all_itineraries(db)


@router.get("/get_itinerary/{itinerary_id}", response_model=ItineraryResponse)
def get_itinerary(
    itinerary_id: int,
    db: Session = Depends(get_db),
):
    return itinerary_service.get_itinerary_by_id(
        db,
        itinerary_id,
    )


@router.put("/update_itinerary/{itinerary_id}", response_model=ItineraryResponse)
def update_itinerary(
    itinerary_id: int,
    itinerary_data: ItineraryUpdate,
    db: Session = Depends(get_db),
):
    return itinerary_service.update_itinerary(
        db,
        itinerary_id,
        itinerary_data,
    )


@router.delete("/delete_itinerary/{itinerary_id}")
def delete_itinerary(
    itinerary_id: int,
    db: Session = Depends(get_db),
):
    return itinerary_service.delete_itinerary(
        db,
        itinerary_id,
    )