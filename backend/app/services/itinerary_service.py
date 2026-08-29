from datetime import date as DateType
from datetime import datetime, timedelta
from decimal import Decimal, InvalidOperation

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models import Activity as DBActivity
from app.models import Itinerary as DBItinerary
from app.models import ItineraryDay as DBItineraryDay
from app.models import Trip
from app.schemas import (
    ActivityCreate,
    ItineraryCreate,
    ItineraryUpdate,
)
from app.services.ai_client import _parse_time, post, preferences_from_trip
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


def _find_db_day(itinerary: DBItinerary, day_number: int) -> DBItineraryDay:
    for day in itinerary.days:
        if day.day_number == day_number:
            return day
    raise NotFound(f"day {day_number} not found")


def _activity_duration_minutes(activity: DBActivity) -> int:
    if activity.start_time is None or activity.end_time is None:
        return 60
    start = datetime.combine(DateType.min, activity.start_time)
    end = datetime.combine(DateType.min, activity.end_time)
    if end < start:
        end += timedelta(days=1)
    return int((end - start).total_seconds() // 60)


def _activity_wire(activity: DBActivity) -> dict:
    """Serialise a stored (DB) activity into the AI service itinerary shape."""
    return {
        "time": activity.start_time.strftime("%I:%M %p")
        if activity.start_time
        else "",
        "duration_minutes": _activity_duration_minutes(activity),
        "activity": activity.name,
        "category": activity.category or "general",
        "tags": [],
        "location": activity.location_name or "",
        "recommendation": activity.description or "",
        "estimated_cost": str(activity.estimated_cost)
        if activity.estimated_cost is not None
        else None,
    }


def _day_wire(day: DBItineraryDay) -> dict:
    return {
        "date": str(day.date),
        "activities": [_activity_wire(activity) for activity in day.activities],
    }


def _itinerary_wire(days: list[DBItineraryDay]) -> dict:
    return {"days": [_day_wire(day) for day in days]}


def _apply_regenerated_days(
    db: Session, itinerary: DBItinerary, raw_days: list[dict]
) -> None:
    """Apply the AI service's full-itinerary response onto existing DB rows in
    place, matching by position so day/activity ids (and therefore any
    frontend state keyed on them) stay stable across a regenerate call.
    """
    existing_days = list(itinerary.days)

    for index, raw_day in enumerate(raw_days):
        if index < len(existing_days):
            day = existing_days[index]
            day.date = DateType.fromisoformat(raw_day["date"])
        else:
            day = DBItineraryDay(
                itinerary_id=itinerary.id,
                day_number=index + 1,
                date=DateType.fromisoformat(raw_day["date"]),
            )
            db.add(day)
            db.flush()

        existing_activities = list(day.activities)
        raw_activities = raw_day["activities"]

        for position, raw_activity in enumerate(raw_activities):
            start_time = _parse_time(raw_activity["time"])
            end_time = (
                datetime.combine(day.date, start_time)
                + timedelta(minutes=raw_activity["duration_minutes"])
            ).time()

            if position < len(existing_activities):
                activity = existing_activities[position]
                activity.name = raw_activity["activity"]
                activity.description = raw_activity.get("recommendation")
                activity.location_name = raw_activity.get("location")
                activity.start_time = start_time
                activity.end_time = end_time
                activity.estimated_cost = _to_decimal(
                    raw_activity.get("estimated_cost")
                )
                activity.category = raw_activity.get("category")
                activity.activity_order = position + 1
            else:
                db.add(
                    DBActivity(
                        itinerary_day_id=day.id,
                        name=raw_activity["activity"],
                        description=raw_activity.get("recommendation"),
                        location_name=raw_activity.get("location"),
                        start_time=start_time,
                        end_time=end_time,
                        estimated_cost=_to_decimal(
                            raw_activity.get("estimated_cost")
                        ),
                        category=raw_activity.get("category"),
                        activity_order=position + 1,
                    )
                )

        # Drop activities beyond what the AI returned for this day.
        for stale_activity in existing_activities[len(raw_activities):]:
            db.delete(stale_activity)

    # Drop days beyond what the AI returned.
    for stale_day in existing_days[len(raw_days):]:
        db.delete(stale_day)


def _regenerate_db(
    db: Session,
    itinerary: DBItinerary,
    path: str,
    extra: dict,
    user_query: str,
) -> DBItinerary:
    raw = post(
        path,
        {
            "itinerary": _itinerary_wire(itinerary.days),
            "user_query": user_query,
            **extra,
        },
    )
    _apply_regenerated_days(db, itinerary, raw["days"])
    db.commit()
    db.refresh(itinerary)
    return itinerary


def regenerate_trip(db: Session, itinerary_id: int, user_id: int) -> DBItinerary:
    itinerary = get_itinerary_by_id(db, itinerary_id, user_id)
    return _regenerate_db(
        db,
        itinerary,
        "/itinerary/regenerate",
        {},
        "Rebuild this itinerary with different activities from the ones "
        "currently listed, keeping the same dates and the same number of days.",
    )


def regenerate_day(
    db: Session, itinerary_id: int, day_number: int, user_id: int
) -> DBItinerary:
    itinerary = get_itinerary_by_id(db, itinerary_id, user_id)
    _find_db_day(itinerary, day_number)
    return _regenerate_db(
        db,
        itinerary,
        "/itinerary/regenerate-day",
        {"day_number": day_number},
        f"Rebuild day {day_number} with different activities from the ones currently "
        "listed on that day, keeping the same date.",
    )


def regenerate_activity(
    db: Session, itinerary_id: int, day_number: int, activity_id: int, user_id: int
) -> DBItinerary:
    itinerary = get_itinerary_by_id(db, itinerary_id, user_id)
    day = _find_db_day(itinerary, day_number)

    for position, activity in enumerate(day.activities):
        if activity.id == activity_id:
            break
    else:
        raise NotFound(f"activity {activity_id} not found")

    return _regenerate_db(
        db,
        itinerary,
        "/itinerary/regenerate-activity",
        {"day_number": day_number, "activity_index": position},
        f"Replace '{activity.name}' with a different activity, keeping a similar time "
        "and duration.",
    )


def add_activity(
    db: Session,
    itinerary_id: int,
    day_number: int,
    user_id: int,
    activity_data: ActivityCreate,
) -> DBItinerary:
    itinerary = get_itinerary_by_id(db, itinerary_id, user_id)
    day = _find_db_day(itinerary, day_number)

    next_order = max((a.activity_order for a in day.activities), default=0) + 1
    db.add(
        DBActivity(
            itinerary_day_id=day.id,
            **activity_data.model_dump(exclude={"activity_order"}),
            activity_order=next_order,
        )
    )
    db.commit()
    db.refresh(itinerary)
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
