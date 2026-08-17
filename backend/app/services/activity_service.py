from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Activity
from app.schemas import ActivityCreate, ActivityUpdate


def create_activity(
    db: Session,
    itinerary_day_id: int,
    activity: ActivityCreate,
) -> Activity:
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
) -> list[Activity]:
    statement = (
        select(Activity)
        .where(Activity.itinerary_day_id == itinerary_day_id)
        .order_by(Activity.activity_order)
    )

    return list(db.scalars(statement).all())


def get_activity(
    db: Session,
    activity_id: int,
) -> Activity | None:
    return db.get(Activity, activity_id)


def update_activity(
    db: Session,
    activity_id: int,
    activity: ActivityUpdate,
) -> Activity | None:
    existing_activity = db.get(Activity, activity_id)

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
) -> bool:
    existing_activity = db.get(Activity, activity_id)

    if existing_activity is None:
        return False

    db.delete(existing_activity)
    db.commit()

    return True
