from uuid import UUID

from app.schemas.itinerary import Itinerary
from app.schemas.trip import TripRequestResponse

trip_requests: dict[str, TripRequestResponse] = {}
itineraries: dict[UUID, Itinerary] = {}


def save_trip_request(trip: TripRequestResponse) -> TripRequestResponse:
    trip_requests[trip.request_id] = trip
    return trip


def get_trip_request(request_id: str) -> TripRequestResponse | None:
    return trip_requests.get(request_id)


def save_itinerary(itinerary: Itinerary) -> Itinerary:
    itineraries[itinerary.id] = itinerary
    return itinerary


def get_itinerary(itinerary_id: UUID) -> Itinerary | None:
    return itineraries.get(itinerary_id)


def list_itineraries() -> list[Itinerary]:
    return list(itineraries.values())
