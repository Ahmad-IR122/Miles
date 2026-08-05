from fastapi import APIRouter

router = APIRouter(prefix="/itinerary", tags=["itinerary"])

itinerary_data = []  # this is a placeholder for the itinerary data, you can replace it with actual data or a database query in the future


@router.get("")
def get_itinerary():
    return {"data": itinerary_data}
