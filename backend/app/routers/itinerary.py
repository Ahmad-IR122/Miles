from fastapi import APIRouter

from app.schemas.itinerary import Itinerary

router = APIRouter(prefix="/itinerary", tags=["itinerary"])

itinerary_data: list[Itinerary] = []


@router.get("")
def get_itineraries():
    return {"data": itinerary_data}
