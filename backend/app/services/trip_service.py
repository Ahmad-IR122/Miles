import uuid

from sqlalchemy.orm import Session

from app.models import Trip
from app.schemas import (
    MAX_TRIP_DAYS,
    TripCreate,
    TripRequest,
    TripRequestResponse,
    TripUpdate,
)
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


def _check_dates(start_date, end_date) -> None:
    """PATCH can send either date alone, so the pair is only checkable here."""
    if end_date < start_date:
        raise ValueError("end_date must be on or after start_date")
    if (end_date - start_date).days + 1 > MAX_TRIP_DAYS:
        raise ValueError(f"trip length cannot exceed {MAX_TRIP_DAYS} days")


def create_trip(db: Session, user_id: int, payload: TripCreate) -> Trip:
    trip = Trip(user_id=user_id, **payload.model_dump())
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip


def list_trips(db: Session, user_id: int | None = None) -> list[Trip]:
    query = db.query(Trip)
    if user_id is not None:
        query = query.filter(Trip.user_id == user_id)
    return query.order_by(Trip.created_at.desc()).all()


def get_trip(db: Session, trip_id: int) -> Trip | None:
    return db.get(Trip, trip_id)


def update_trip(db: Session, trip_id: int, payload: TripUpdate) -> Trip | None:
    trip = db.get(Trip, trip_id)
    if trip is None:
        return None

    changes = payload.model_dump(exclude_unset=True)
    _check_dates(
        changes.get("start_date", trip.start_date),
        changes.get("end_date", trip.end_date),
    )
    for field, value in changes.items():
        setattr(trip, field, value)

    db.commit()
    db.refresh(trip)
    return trip


def delete_trip(db: Session, trip_id: int) -> bool:
    trip = db.get(Trip, trip_id)
    if trip is None:
        return False

    db.delete(trip)
    db.commit()
    return True