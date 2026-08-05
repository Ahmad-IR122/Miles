from fastapi import APIRouter, status

from app.schemas.trip import TripRequest, TripRequestResponse
from app.services.trip_service import create_trip_request

router = APIRouter(prefix="/trips", tags=["trips"])


@router.post(
    "", response_model=TripRequestResponse, status_code=status.HTTP_201_CREATED
)
def submit_trip_request(payload: TripRequest) -> TripRequestResponse:
    return create_trip_request(payload)
