import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.db import get_db
from app.schemas.itinerary import (
    ItineraryCreate,
    ItineraryResponse,
    ItineraryUpdate,
)
from app.services import itinerary_service

router = APIRouter(
    prefix="/itineraries",
    tags=["Itineraries"],
)


@router.post("/", response_model=ItineraryResponse)
def create_itinerary(
    itinerary_data: ItineraryCreate,
    db: Session = Depends(get_db),
):
    return itinerary_service.create_itinerary(
        db,
        itinerary_data,
    )


@router.get("/", response_model=list[ItineraryResponse])
def get_itineraries(
    db: Session = Depends(get_db),
):
    return itinerary_service.get_all_itineraries(db)


@router.get("/{itinerary_id}", response_model=ItineraryResponse)
def get_itinerary(
    itinerary_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    return itinerary_service.get_itinerary_by_id(
        db,
        itinerary_id,
    )

@router.put("/{itinerary_id}", response_model=ItineraryResponse)
def update_itinerary(
    itinerary_id: uuid.UUID,
    itinerary_data: ItineraryUpdate,
    db: Session = Depends(get_db),
):
    return itinerary_service.update_itinerary(
        db,
        itinerary_id,
        itinerary_data,
    )

@router.delete("/{itinerary_id}")
def delete_itinerary(
    itinerary_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    return itinerary_service.delete_itinerary(
        db,
        itinerary_id,
    )