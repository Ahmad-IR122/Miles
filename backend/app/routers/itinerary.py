import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db import get_db
from app.models import User
from app.schemas import (
    ActivityCreate,
    ItineraryCreate,
    ItineraryDetailResponse,
    ItineraryResponse,
    ItineraryUpdate,
)
from app.services import itinerary_service
from app.services.itinerary_service import (
    NotFound,
    add_activity,
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
def get_stored_itineraries(current_user: User = Depends(get_current_user)):
    owned = [
        itinerary
        for itinerary in list_itineraries()
        if itinerary.user_id == current_user.id
    ]
    return {"data": owned}


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


@router.post(
    "/{itinerary_id}/regenerate", response_model=ItineraryDetailResponse
)
def regenerate_full(
    itinerary_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _guard(lambda: regenerate_trip(db, itinerary_id, current_user.id))


@router.post(
    "/{itinerary_id}/days/{day_number}/regenerate",
    response_model=ItineraryDetailResponse,
)
def regenerate_single_day(
    itinerary_id: int,
    day_number: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _guard(
        lambda: regenerate_day(db, itinerary_id, day_number, current_user.id)
    )


@router.post(
    "/{itinerary_id}/days/{day_number}/activities/{activity_id}/regenerate",
    response_model=ItineraryDetailResponse,
)
def regenerate_single_activity(
    itinerary_id: int,
    day_number: int,
    activity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _guard(
        lambda: regenerate_activity(
            db, itinerary_id, day_number, activity_id, current_user.id
        )
    )


@router.post(
    "/{itinerary_id}/days/{day_number}/activities",
    response_model=ItineraryDetailResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_day_activity(
    itinerary_id: int,
    day_number: int,
    payload: ActivityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _guard(
        lambda: add_activity(db, itinerary_id, day_number, current_user.id, payload)
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
