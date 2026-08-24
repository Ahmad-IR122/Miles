from datetime import date as DateType
from datetime import datetime, timedelta
from decimal import Decimal, InvalidOperation
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models import Activity as DBActivity
from app.models import Itinerary as DBItinerary
from app.models import ItineraryDay as DBItineraryDay
from app.models import Trip
from app.schemas import (
    DayPlan,
    Itinerary,
    ItineraryCreate,
    ItineraryUpdate,
)
from app.services.ai_client import (
    _parse_time,
    from_itinerary,
    post,
    preferences_from_trip,
    to_day,
)
from app.services.store import get_itinerary, get_trip_request, save_itinerary
from app.services.trip_interest_service import list_trip_interests


class NotFound(LookupError):
    """Requested itinerary, day, or activity does not exist."""

def _to_decimal(value: str | None) -> Decimal | None:
    """Best-effort parse of the AI service's free-text estimated_cost field."""
    if not value:
        return None
    cleaned = "".join(ch for ch in value if ch.isdigit() or ch == ".")
    if not cleaned:
        return None
    try:
        return Decimal(cleaned)
    except InvalidOperation:
        return None


def generate_itinerary_for_trip(db: Session, trip_id: int, user_id: int) -> DBItinerary:
    trip = db.get(Trip, trip_id)
    if trip is None or trip.user_id != user_id:
        raise NotFound(f"trip {trip_id} not found")

    interest_names = [interest.name for interest in list_trip_interests(db, trip_id)]
    preferences = preferences_from_trip(trip, interest_names)

    raw = post("/itinerary/", {"preferences": preferences})

    itinerary = DBItinerary(trip_id=trip_id, version=1, generated_by="aiServices")
    db.add(itinerary)
    db.flush()

    for day_index, raw_day in enumerate(raw["days"]):
        day = DBItineraryDay(
            itinerary_id=itinerary.id,
            day_number=day_index + 1,
            date=DateType.fromisoformat(raw_day["date"]),
        )
        db.add(day)
        db.flush()

        for position, raw_activity in enumerate(raw_day["activities"]):
            start_time = _parse_time(raw_activity["time"])
            end_time = (
                datetime.combine(day.date, start_time)
                + timedelta(minutes=raw_activity["duration_minutes"])
            ).time()

            db.add(
                DBActivity(
                    itinerary_day_id=day.id,
                    name=raw_activity["activity"],
                    description=raw_activity.get("recommendation"),
                    location_name=raw_activity.get("location"),
                    start_time=start_time,
                    end_time=end_time,
                    estimated_cost=_to_decimal(raw_activity.get("estimated_cost")),
                    category=raw_activity.get("category"),
                    activity_order=position + 1,
                )
            )

    db.commit()
    db.refresh(itinerary)
    return itinerary


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


def _regenerate(
    itinerary: Itinerary,
    path: str,
    extra: dict,
    user_query: str,
) -> Itinerary:
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
        "Rebuild this itinerary with different activities from the ones "
        "currently listed, keeping the same dates and the same number of days.",
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


def create_itinerary(db: Session, itinerary_data: ItineraryCreate):
    itinerary = DBItinerary(**itinerary_data.model_dump())

    db.add(itinerary)
    db.commit()
    db.refresh(itinerary)

    return itinerary


def get_all_itineraries(db: Session):
    return db.query(DBItinerary).all()


def get_itinerary_by_id(db: Session, itinerary_id: int):
    itinerary = db.query(DBItinerary).filter(DBItinerary.id == itinerary_id).first()

    if not itinerary:
        raise HTTPException(
            status_code=404,
            detail="Itinerary not found",
        )

    return itinerary


def update_itinerary(
    db: Session,
    itinerary_id: int,
    itinerary_data: ItineraryUpdate,
):
    itinerary = get_itinerary_by_id(db, itinerary_id)

    update_data = itinerary_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(itinerary, key, value)

    db.commit()
    db.refresh(itinerary)

    return itinerary


def delete_itinerary(db: Session, itinerary_id: int):
    itinerary = get_itinerary_by_id(db, itinerary_id)

    db.delete(itinerary)
    db.commit()

    return {"message": "Itinerary deleted successfully"}
