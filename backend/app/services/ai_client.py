from datetime import date, datetime
from decimal import Decimal

import httpx

from app.core import settings
from app.schemas import Activity, DayPlan

TIME_FORMATS = ("%H:%M", "%H:%M:%S", "%I:%M %p")


def map_budget_level(budget: Decimal | float | int | None) -> str | None:
    """Map a numeric trip budget to the dataset's supported budget levels."""
    if budget is None:
        return None
    if budget <= 400:
        return "low"
    if budget <= 1000:
        return "mid"
    return "high"


def post(path: str, payload: dict) -> dict:
    with httpx.Client(timeout=settings.AI_SERVICE_TIMEOUT) as client:
        base_url = settings.AI_SERVICE_URL.rstrip("/")
        normalized_path = path if path.startswith("/") else f"/{path}"
        response = client.post(f"{base_url}{normalized_path}", json=payload)
        response.raise_for_status()
        return response.json()


def get(path: str, params: dict | None = None) -> dict:
    with httpx.Client(timeout=settings.AI_SERVICE_TIMEOUT) as client:
        base_url = settings.AI_SERVICE_URL.rstrip("/")
        normalized_path = path if path.startswith("/") else f"/{path}"
        response = client.get(f"{base_url}{normalized_path}", params=params)
        response.raise_for_status()
        return response.json()


def _parse_time(value: str):
    for fmt in TIME_FORMATS:
        try:
            return datetime.strptime(value.strip(), fmt).time()  # noqa: DTZ007
        except ValueError:
            continue
    raise ValueError(f"could not parse time from AI service: {value!r}")


def to_activity(raw: dict) -> Activity:
    return Activity(
        name=raw["activity"],
        start_time=_parse_time(raw["time"]),
        duration_minutes=raw["duration_minutes"],
        location=raw.get("location"),
        description=raw.get("recommendation"),
        category=raw.get("category") or "general",
        tags=raw.get("tags") or [],
        estimated_cost=raw.get("estimated_cost"),
    )


def to_day(raw: dict, day_number: int) -> DayPlan:
    return DayPlan(
        day_number=day_number,
        date=date.fromisoformat(raw["date"]),
        activities=[to_activity(a) for a in raw["activities"]],
    )


def from_activity(activity: Activity) -> dict:
    """Serialise a stored activity into the AI service itinerary shape."""
    return {
        "time": activity.start_time.strftime("%I:%M %p"),
        "duration_minutes": activity.duration_minutes,
        "activity": activity.name,
        "category": activity.category,
        "tags": activity.tags,
        "location": activity.location or "",
        "recommendation": activity.description or "",
        "estimated_cost": activity.estimated_cost,
    }


def from_day(day: DayPlan) -> dict:
    return {
        "date": str(day.date),
        "activities": [from_activity(activity) for activity in day.activities],
    }


def from_itinerary(days: list[DayPlan]) -> dict:
    return {"days": [from_day(day) for day in days]}


def preferences_from_trip(trip, interest_names: list[str]) -> dict:
    """Build the aiServices TravelPreferences payload from a DB Trip row."""
    return {
        "destinations": trip.destinations,
        "start_date": str(trip.start_date),
        "end_date": str(trip.end_date),
        "interests": interest_names,
        "budget": str(trip.budget) if trip.budget is not None else "",
        "budget_level": map_budget_level(trip.budget),
        "additional_notes": trip.additional_notes,
        "adults": trip.adults,
        "children": trip.children,
    }
