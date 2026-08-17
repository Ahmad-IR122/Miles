from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.db import get_db
from app.schemas.trip_preference import (
    TripPreferenceCreate,
    TripPreferenceResponse,
    TripPreferenceUpdate,
)
from app.services import trip_preference_service, trip_service

router = APIRouter(prefix="/trips/{trip_id}/preferences", tags=["trip-preferences"])


@router.post(
    "",
    response_model=TripPreferenceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_trip_preference(
    trip_id: int,
    payload: TripPreferenceCreate,
    db: Session = Depends(get_db),
):
    if trip_service.get_trip(db, trip_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"trip {trip_id} not found",
        )

    if trip_preference_service.get_trip_preference(db, trip_id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="preferences already exist for this trip",
        )

    return trip_preference_service.create_trip_preference(db, trip_id, payload)


@router.get("", response_model=TripPreferenceResponse)
def read_trip_preference(trip_id: int, db: Session = Depends(get_db)):
    preference = trip_preference_service.get_trip_preference(db, trip_id)
    if preference is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="preferences not found for this trip",
        )
    return preference


@router.patch("", response_model=TripPreferenceResponse)
def update_trip_preference(
    trip_id: int,
    payload: TripPreferenceUpdate,
    db: Session = Depends(get_db),
):
    preference = trip_preference_service.update_trip_preference(
        db, trip_id, payload
    )
    if preference is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="preferences not found for this trip",
        )
    return preference


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip_preference(trip_id: int, db: Session = Depends(get_db)) -> None:
    deleted = trip_preference_service.delete_trip_preference(db, trip_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="preferences not found for this trip",
        )