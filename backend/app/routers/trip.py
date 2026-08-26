from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db import get_db
from app.models import User
from app.schemas import (
    TripCreate,
    TripRequest,
    TripRequestResponse,
    TripRequestUpdate,
    TripResponse,
    TripUpdate,
)
from app.services import trip_service
from app.services.store import get_trip_request, save_trip_request

router = APIRouter(prefix="/trips", tags=["trips"])


@router.post("", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def create_trip(
    payload: TripCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    overlapping = trip_service.get_overlapping_trip(
        db, current_user.id, payload.start_date, payload.end_date
    )
    if overlapping is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"trip dates overlap with existing trip {overlapping.id} "
                f"({overlapping.start_date} to {overlapping.end_date})"
            ),
        )
    return trip_service.create_trip(db, current_user.id, payload)


@router.get("", response_model=list[TripResponse])
def list_trips(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Trips belonging to the caller only - no way to query another user's trips."""
    return trip_service.list_trips(db, current_user.id)


@router.get("/{trip_id}", response_model=TripResponse)
def read_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trip = trip_service.get_trip(db, trip_id, current_user.id)
    if trip is None:
        # 404 regardless of whether the trip doesn't exist or belongs to
        # someone else, so we don't leak which trip ids are in use.
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"trip {trip_id} not found",
        )
    return trip


@router.patch("/{trip_id}", response_model=TripResponse)
def update_trip(
    trip_id: int,
    payload: TripUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        trip = trip_service.update_trip(db, trip_id, current_user.id, payload)
    except trip_service.TripDateConflictError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        ) from error
    if trip is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"trip {trip_id} not found",
        )
    return trip


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    if not trip_service.delete_trip(db, trip_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"trip {trip_id} not found",
        )


# Pre-database trip requests, kept until the frontend moves onto /trips.
legacy_router = APIRouter(prefix="/trip-requests", tags=["trip-requests"])


@legacy_router.post(
    "", response_model=TripRequestResponse, status_code=status.HTTP_201_CREATED
)
def submit_trip_request(
    payload: TripRequest,
    current_user: User = Depends(get_current_user),
) -> TripRequestResponse:
    return trip_service.create_trip_request(current_user.id, payload)


@legacy_router.get("/{request_id}", response_model=TripRequestResponse)
def read_trip_request(
    request_id: str,
    current_user: User = Depends(get_current_user),
) -> TripRequestResponse:
    trip = get_trip_request(request_id)
    if trip is None or trip.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return trip


@legacy_router.patch("/{request_id}", response_model=TripRequestResponse)
def update_trip_request(
    request_id: str,
    payload: TripRequestUpdate,
    current_user: User = Depends(get_current_user),
) -> TripRequestResponse:
    trip = get_trip_request(request_id)
    if trip is None or trip.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    trip.interests = payload.interests
    trip.other_interest = payload.other_interest
    return save_trip_request(trip)
