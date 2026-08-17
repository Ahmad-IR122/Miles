from sqlalchemy.orm import Session

from app.models.trip_preference_models import TripPreference
from app.schemas.trip_preference import TripPreferenceCreate, TripPreferenceUpdate


def get_trip_preference(db: Session, trip_id: int) -> TripPreference | None:
    return (
        db.query(TripPreference)
        .filter(TripPreference.trip_id == trip_id)
        .first()
    )


def create_trip_preference(
    db: Session,
    trip_id: int,
    payload: TripPreferenceCreate,
) -> TripPreference:
    preference = TripPreference(trip_id=trip_id, **payload.model_dump())
    db.add(preference)
    db.commit()
    db.refresh(preference)
    return preference


def update_trip_preference(
    db: Session,
    trip_id: int,
    payload: TripPreferenceUpdate,
) -> TripPreference | None:
    preference = get_trip_preference(db, trip_id)
    if preference is None:
        return None

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(preference, field, value)

    db.commit()
    db.refresh(preference)
    return preference


def delete_trip_preference(db: Session, trip_id: int) -> bool:
    preference = get_trip_preference(db, trip_id)
    if preference is None:
        return False

    db.delete(preference)
    db.commit()
    return True