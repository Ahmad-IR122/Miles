from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Activity, Itinerary, ItineraryDay, Trip
from app.schemas import ActivityCreate, ActivityUpdate


def _owned_day(db: Session, itinerary_day_id: int, user_id: int) -> ItineraryDay | None:
    """The itinerary day only if it sits under a trip the user owns."""
    return (
        db.query(ItineraryDay)
        .join(Itinerary, Itinerary.id == ItineraryDay.itinerary_id)
        .join(Trip, Trip.id == Itinerary.trip_id)
        .filter(ItineraryDay.id == itinerary_day_id, Trip.user_id == user_id)
        .one_or_none()
    )


def _owned_activity_query(db: Session, user_id: int):
    return (
        db.query(Activity)
        .join(ItineraryDay, ItineraryDay.id == Activity.itinerary_day_id)
        .join(Itinerary, Itinerary.id == ItineraryDay.itinerary_id)
        .join(Trip, Trip.id == Itinerary.trip_id)
        .filter(Trip.user_id == user_id)
    )


def create_activity(
    db: Session,
    itinerary_day_id: int,
    user_id: int,
    activity: ActivityCreate,
) -> Activity | None:
    if _owned_day(db, itinerary_day_id, user_id) is None:
        return None

    new_activity = Activity(
        itinerary_day_id=itinerary_day_id,
        **activity.model_dump(),
    )

    db.add(new_activity)
    db.commit()
    db.refresh(new_activity)

    return new_activity


def list_activities(
    db: Session,
    itinerary_day_id: int,
    user_id: int,
) -> list[Activity] | None:
    if _owned_day(db, itinerary_day_id, user_id) is None:
        return None

    statement = (
        select(Activity)
        .where(Activity.itinerary_day_id == itinerary_day_id)
        .order_by(Activity.activity_order)
    )

    return list(db.scalars(statement).all())


def get_activity(
    db: Session,
    activity_id: int,
    user_id: int,
) -> Activity | None:
    return (
        _owned_activity_query(db, user_id)
        .filter(Activity.id == activity_id)
        .one_or_none()
    )


def update_activity(
    db: Session,
    activity_id: int,
    user_id: int,
    activity: ActivityUpdate,
) -> Activity | None:
    existing_activity = get_activity(db, activity_id, user_id)

    if existing_activity is None:
        return None

    update_data = activity.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(existing_activity, field, value)

    db.commit()
    db.refresh(existing_activity)

    return existing_activity


def delete_activity(
    db: Session,
    activity_id: int,
    user_id: int,
) -> bool:
    existing_activity = get_activity(db, activity_id, user_id)

    if existing_activity is None:
        return False

    db.delete(existing_activity)
    db.commit()

    return True
