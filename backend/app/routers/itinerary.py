from fastapi import APIRouter

router = APIRouter(prefix="/itinerary", tags=["itinerary"])

itinerary_data = [ ]# use a database to store itinerary data in a real application
@router.get("")
def health_check_itinerary():
    return {"data": itinerary_data}
