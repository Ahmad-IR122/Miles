from fastapi import APIRouter
from app.services.itinerary import generate_itinerary
from app.models.travel import ItineraryRequest

router = APIRouter(prefix="/itinerary", tags=["itinerary"])


@router.post("/")
def itinerary(request: ItineraryRequest):
    result = generate_itinerary(request.preferences, request.travel_data)
    return result
