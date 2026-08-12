from uuid import UUID

from app.schemas.itinerary import DayPlan, Itinerary
from app.services.ai_client import from_itinerary, post, to_day
from app.services.store import get_itinerary, get_trip_request, save_itinerary
import uuid

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.itinerary import Itinerary
from app.schemas.itinerary import ItineraryCreate, ItineraryUpdate




class NotFound(LookupError):
    """Requested itinerary, day, or activity does not exist."""


def _load(itinerary_id: UUID):
    itinerary = get_itinerary(itinerary_id)
    if itinerary is None:
        raise NotFound(f"itinerary {itinerary_id} not found")
    trip = get_trip_request(itinerary.trip_request_id)
    if trip is None:
        raise NotFound(f"trip request {itinerary.trip_request_id} not found")
    return itinerary, trip


def _find_day(itinerary: Itinerary, day_number: int):
    for index, day in enumerate(itinerary.days):
        if day.day_number == day_number:
            return index, day
    raise NotFound(f"day {day_number} not found")


def _merge_days(itinerary: Itinerary, raw_days: list[dict]) -> list[DayPlan]:
    """Rebuild days from the AI service's response, keeping our ids stable by position.

    The AI service returns the whole itinerary on every regenerate call, so days and
    activities the user didn't ask to change come back unchanged; matching by position
    keeps their ids so the frontend doesn't see everything as new.
    """
    merged: list[DayPlan] = []
    for index, raw in enumerate(raw_days):
        existing = itinerary.days[index] if index < len(itinerary.days) else None
        day = to_day(raw, existing.day_number if existing else index + 1)
        if existing is not None:
            day.id = existing.id
            for position, activity in enumerate(day.activities):
                if position < len(existing.activities):
                    activity.id = existing.activities[position].id
        merged.append(day)
    return merged


def _regenerate(itinerary: Itinerary, path: str, extra: dict, user_query: str) -> Itinerary:
    raw = post(
        path,
        {
            "itinerary": from_itinerary(itinerary.days),
            "user_query": user_query,
            **extra,
        },
    )
    itinerary.days = _merge_days(itinerary, raw["days"])
    return save_itinerary(itinerary)


def regenerate_trip(itinerary_id: UUID) -> Itinerary:
    itinerary, _ = _load(itinerary_id)
    return _regenerate(
        itinerary,
        "/itinerary/regenerate",
        {},
        "Rebuild this itinerary with different activities from the ones currently listed, "
        "keeping the same dates and the same number of days.",
    )


def regenerate_day(itinerary_id: UUID, day_number: int) -> Itinerary:
    itinerary, _ = _load(itinerary_id)
    _find_day(itinerary, day_number)
    return _regenerate(
        itinerary,
        "/itinerary/regenerate-day",
        {"day_number": day_number},
        f"Rebuild day {day_number} with different activities from the ones currently "
        "listed on that day, keeping the same date.",
    )


def regenerate_activity(
    itinerary_id: UUID, day_number: int, activity_id: UUID
) -> Itinerary:
    itinerary, _ = _load(itinerary_id)
    _, day = _find_day(itinerary, day_number)

    for position, activity in enumerate(day.activities):
        if activity.id == activity_id:
            break
    else:
        raise NotFound(f"activity {activity_id} not found")

    return _regenerate(
        itinerary,
        "/itinerary/regenerate-activity",
        {"day_number": day_number, "activity_index": position},
        f"Replace '{activity.name}' with a different activity, keeping a similar time "
        "and duration.",
    )

"""
AHMAD IRSHAID SPACE FOR NEW CODE
"""
    
def create_itinerary(db: Session, itinerary_data: ItineraryCreate):
    itinerary = Itinerary(**itinerary_data.model_dump())

    db.add(itinerary)
    db.commit()
    db.refresh(itinerary)

    return itinerary


def get_all_itineraries(db: Session):
    return db.query(Itinerary).all()


def get_itinerary_by_id(db: Session, itinerary_id: uuid.UUID):
    itinerary = (
        db.query(Itinerary)
        .filter(Itinerary.id == itinerary_id)
        .first()
    )

    if not itinerary:
        raise HTTPException(
            status_code=404,
            detail="Itinerary not found",
        )

    return itinerary


def update_itinerary(
    db: Session,
    itinerary_id: uuid.UUID,
    itinerary_data: ItineraryUpdate,
):
    itinerary = get_itinerary_by_id(db, itinerary_id)

    update_data = itinerary_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(itinerary, key, value)

    db.commit()
    db.refresh(itinerary)

    return itinerary


def delete_itinerary(db: Session, itinerary_id: uuid.UUID):
    itinerary = get_itinerary_by_id(db, itinerary_id)

    db.delete(itinerary)
    db.commit()

    return {"message": "Itinerary deleted successfully"}