import uuid

from app.schemas.trip import TripRequest, TripRequestResponse
from app.services.store import save_trip_request


def create_trip_request(payload: TripRequest) -> TripRequestResponse:
    request_id = str(uuid.uuid4())
    return save_trip_request(
        TripRequestResponse(
            request_id=request_id,
            origin=payload.origin,
            destination=payload.destination,
            start_date=payload.start_date,
            end_date=payload.end_date,
            adults=payload.adults,
            children=payload.children,
            interests=payload.interests,
            other_interest=payload.other_interest,
            budget=payload.budget,
        )
    )
