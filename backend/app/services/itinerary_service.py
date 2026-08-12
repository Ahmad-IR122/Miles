import uuid

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.itinerary import Itinerary
from app.schemas.itinerary import ItineraryCreate, ItineraryUpdate


def create_itinerary(db: Session, itinerary_data: ItineraryCreate):
    itinerary = Itinerary(**itinerary_data.model_dump())

    db.add(itinerary)
    db.commit()
    db.refresh(itinerary)

    return itinerary


def get_all_itineraries(db: Session):
    return db.query(Itinerary).all()


def get_itinerary_by_id(db: Session, itinerary_id: uuid.UUID):
    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()

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

    if not itinerary:
        raise HTTPException(
            status_code=404,
            detail="Itinerary not found",
        )

    update_data = itinerary_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(itinerary, key, value)

    db.commit()
    db.refresh(itinerary)

    return itinerary


def delete_itinerary(db: Session, itinerary_id: uuid.UUID):
    itinerary = get_itinerary_by_id(db, itinerary_id)

    if not itinerary:
        raise HTTPException(
            status_code=404,
            detail="Itinerary not found",
        )

    db.delete(itinerary)
    db.commit()

    return {"message": "Itinerary deleted successfully"}
