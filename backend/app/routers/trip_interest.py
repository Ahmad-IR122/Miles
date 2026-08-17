from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.db import get_db
from app.schemas.interest import InterestResponse
from app.schemas.trip_interest import TripInterestCreate
from app.services import interest_service, trip_interest_service, trip_service

router = APIRouter(prefix="/trips/{trip_id}/interests", tags=["trip-interests"])


@router.post(
    "",
    response_model=InterestResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_trip_interest(
    trip_id: int,
    payload: TripInterestCreate,
    db: Session = Depends(get_db),
):
    if trip_service.get_trip(db, trip_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"trip {trip_id} not found",
        )

    interest = interest_service.get_interest(db, payload.interest_id)
    if interest is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"interest {payload.interest_id} not found",
        )

    existing = trip_interest_service.get_trip_interest(
        db, trip_id, payload.interest_id
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="interest already added to this trip",
        )

    trip_interest_service.add_trip_interest(db, trip_id, payload.interest_id)
    return interest


@router.get("", response_model=list[InterestResponse])
def list_trip_interests(trip_id: int, db: Session = Depends(get_db)):
    if trip_service.get_trip(db, trip_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"trip {trip_id} not found",
        )

    return trip_interest_service.list_trip_interests(db, trip_id)


@router.delete("/{interest_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_trip_interest(
    trip_id: int,
    interest_id: int,
    db: Session = Depends(get_db),
) -> None:
    removed = trip_interest_service.remove_trip_interest(db, trip_id, interest_id)
    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="interest not found on this trip",
        )