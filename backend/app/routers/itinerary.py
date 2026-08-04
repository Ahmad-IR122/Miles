from fastapi import APIRouter

router = APIRouter(prefix="/itinerary", tags=["itinerary"])

itinerary_data = [
    {
        "destination": "Rome",
        "startDate": "2026-08-10",
        "endDate": "2026-08-15",
        "days": [
            {
                "day": 1,
                "activities": [
                    "Visit the Colosseum",
                    "Lunch at a local restaurant",
                ],
            },
            {
                "day": 2,
                "activities": [
                    "Visit the Vatican",
                    "Walk around Piazza Navona",
                ],
            },
        ],
    },
    {
        "destination": "Nablus",
        "startDate": "2026-08-10",
        "endDate": "2026-08-15",
        "days": [
            {
                "day": 1,
                "activities": [
                    "Visit the old city",
                    "Lunch at a W restaurant",
                ],
            },
            {
                "day": 2,
                "activities": [
                    "Visit the Vatican",
                    "Walk around Piazza Navona",
                ],
            },
        ],
    },
]# use a database to store itinerary data in a real application
@router.get("")
def health_check_itinerary():
    return {"data": itinerary_data}
