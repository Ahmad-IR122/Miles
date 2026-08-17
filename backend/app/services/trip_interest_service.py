from sqlalchemy.orm import Session

from app.models.interest_models import Interest
from app.models.trip_interest_models import TripInterest


def add_trip_interest(
    db: Session,
    trip_id: int,
    interest_id: int,
) -> TripInterest:
    trip_interest = TripInterest(trip_id=trip_id, interest_id=interest_id)
    db.add(trip_interest)
    db.commit()
    return trip_interest


def get_trip_interest(
    db: Session,
    trip_id: int,
    interest_id: int,
) -> TripInterest | None:
    return (
        db.query(TripInterest)
        .filter(
            TripInterest.trip_id == trip_id,
            TripInterest.interest_id == interest_id,
        )
        .first()
    )


def list_trip_interests(
    db: Session,
    trip_id: int,
) -> list[Interest]:
    return (
        db.query(Interest)
        .join(TripInterest, TripInterest.interest_id == Interest.id)
        .filter(TripInterest.trip_id == trip_id)
        .all()
    )


def remove_trip_interest(
    db: Session,
    trip_id: int,
    interest_id: int,
) -> bool:
    trip_interest = get_trip_interest(db, trip_id, interest_id)
    if trip_interest is None:
        return False

    db.delete(trip_interest)
    db.commit()
    return True