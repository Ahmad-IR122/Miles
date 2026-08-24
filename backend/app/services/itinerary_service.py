from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models import Itinerary as DBItinerary
from app.models import Trip
from app.schemas import (
    DayPlan,
    Itinerary,
    ItineraryCreate,
    ItineraryUpdate,
)
from app.services.ai_client import from_itinerary, post, to_day
from app.services.store import get_itinerary, get_trip_request, save_itinerary


class NotFound(LookupError):
    """Requested itinerary, day, or activity does not exist."""


def _load(itinerary_id: UUID, user_id: int):
    itinerary = get_itinerary(itinerary_id)
    if itinerary is None or itinerary.user_id != user_id:
        # Treat "exists but belongs to someone else" the same as "doesn't
        # exist" so ownership can't be probed from the outside.
        raise NotFound(f"itinerary {itinerary_id} not found")
    trip = get_trip_request(itinerary.trip_request_id)
    if trip is None or trip.user_id != user_id:
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


def regenerate_trip(itinerary_id: UUID, user_id: int) -> Itinerary:
    itinerary, _ = _load(itinerary_id, user_id)
    return _regenerate(
        itinerary,
        "/itinerary/regenerate",
        {},
        "Rebuild this itinerary with different activities from the ones "
        "currently listed, keeping the same dates and the same number of days.",
    )


def regenerate_day(itinerary_id: UUID, day_number: int, user_id: int) -> Itinerary:
    itinerary, _ = _load(itinerary_id, user_id)
    _find_day(itinerary, day_number)
    return _regenerate(
        itinerary,
        "/itinerary/regenerate-day",
        {"day_number": day_number},
        f"Rebuild day {day_number} with different activities from the ones currently "
        "listed on that day, keeping the same date.",
    )


def regenerate_activity(
    itinerary_id: UUID, day_number: int, activity_id: UUID, user_id: int
) -> Itinerary:
    itinerary, _ = _load(itinerary_id, user_id)
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


def _owned_itinerary_query(db: Session, user_id: int):
    """Base query for itineraries reachable from user_id via their trips."""
    return (
        db.query(DBItinerary)
        .join(Trip, Trip.id == DBItinerary.trip_id)
        .filter(Trip.user_id == user_id)
    )


def create_itinerary(db: Session, user_id: int, itinerary_data: ItineraryCreate):
    # The itinerary must be created on a trip the caller actually owns.
    trip = (
        db.query(Trip)
        .filter(Trip.id == itinerary_data.trip_id, Trip.user_id == user_id)
        .one_or_none()
    )
    if trip is None:
        raise HTTPException(
            status_code=404,
            detail=f"trip {itinerary_data.trip_id} not found",
        )

    itinerary = DBItinerary(**itinerary_data.model_dump())

    db.add(itinerary)
    db.commit()
    db.refresh(itinerary)

    return itinerary


def get_all_itineraries(db: Session, user_id: int):
    return _owned_itinerary_query(db, user_id).all()


def get_itinerary_by_id(db: Session, itinerary_id: int, user_id: int):
    itinerary = (
        _owned_itinerary_query(db, user_id)
        .filter(DBItinerary.id == itinerary_id)
        .one_or_none()
    )

    if not itinerary:
        raise HTTPException(
            status_code=404,
            detail="Itinerary not found",
        )

    return itinerary


def update_itinerary(
    db: Session,
    itinerary_id: int,
    user_id: int,
    itinerary_data: ItineraryUpdate,
):
    itinerary = get_itinerary_by_id(db, itinerary_id, user_id)

    update_data = itinerary_data.model_dump(exclude_unset=True)

    new_trip_id = update_data.get("trip_id")
    if new_trip_id is not None and new_trip_id != itinerary.trip_id:
        # Moving an itinerary to a different trip must not let a user hand
        # their data to (or take data from) a trip they don't own.
        owns_target_trip = (
            db.query(Trip)
            .filter(Trip.id == new_trip_id, Trip.user_id == user_id)
            .one_or_none()
        )
        if owns_target_trip is None:
            raise HTTPException(
                status_code=404,
                detail=f"trip {new_trip_id} not found",
            )

    for key, value in update_data.items():
        setattr(itinerary, key, value)

    db.commit()
    db.refresh(itinerary)

    return itinerary


def delete_itinerary(db: Session, itinerary_id: int, user_id: int):
    itinerary = get_itinerary_by_id(db, itinerary_id, user_id)

    db.delete(itinerary)
    db.commit()

    return {"message": "Itinerary deleted successfully"}
