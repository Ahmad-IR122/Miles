from fastapi import APIRouter, HTTPException, status

from app.schemas.trip import TripRequest, TripRequestResponse, TripRequestUpdate
from app.services.store import get_trip_request, save_trip_request
from app.services.trip_service import create_trip_request

router = APIRouter(prefix="/trips", tags=["trips"])


@router.post(
    "", response_model=TripRequestResponse, status_code=status.HTTP_201_CREATED
)
def submit_trip_request(payload: TripRequest) -> TripRequestResponse:
    return create_trip_request(payload)


@router.get("/{request_id}", response_model=TripRequestResponse)
def read_trip_request(request_id: str) -> TripRequestResponse:
    trip = get_trip_request(request_id)
    if trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return trip


@router.patch("/{request_id}", response_model=TripRequestResponse)
def update_trip_request(
    request_id: str, payload: TripRequestUpdate
) -> TripRequestResponse:
    trip = get_trip_request(request_id)
    if trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    trip.interests = payload.interests
    trip.other_interest = payload.other_interest
    return save_trip_request(trip)
