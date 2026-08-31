from pydantic import ValidationError

from app.clients import get_client
from app.config import settings
from app.models import (
    Itinerary,
    ItineraryActivity,
    ItineraryDay,
    TravelDataItem,
    TravelPreferences,
)
from app.prompts import (
    build_itinerary_prompt,
    build_regenerate_activity_prompt,
    build_regenerate_day_prompt,
    build_regenerate_itinerary_prompt,
)

client = get_client()


def _call_model(prompt: str, max_output_tokens: int = 8000) -> str:
    response = client.responses.create(
        model=settings.AZURE_OPENAI_DEPLOYMENT,
        input=prompt,
        max_output_tokens=max_output_tokens,
    )

    output_text = response.output_text.strip()
    if output_text.startswith("```"):
        output_text = output_text.strip("`")
        output_text = output_text.removeprefix("json")
        output_text = output_text.strip()

    return output_text


def generate_itinerary(
    preferences: TravelPreferences, travel_data: list[TravelDataItem]
) -> Itinerary:
    prompt = build_itinerary_prompt(preferences, travel_data)
    output_text = _call_model(prompt)

    try:
        return Itinerary.model_validate_json(output_text)
    except ValidationError as e:
        raise ValueError(
            f"LLM returned an itinerary that didn't match the expected format: {e}"
        )


def regenerate_itinerary(
    existing_itinerary: Itinerary,
    user_query: str,
    travel_data: list[TravelDataItem],
) -> Itinerary:
    prompt = build_regenerate_itinerary_prompt(
        existing_itinerary, user_query, travel_data
    )
    output_text = _call_model(prompt)

    try:
        return Itinerary.model_validate_json(output_text)
    except ValidationError as e:
        raise ValueError(
            f"LLM returned an itinerary that didn't match the expected format: {e}"
        )


def regenerate_day(
    existing_itinerary: Itinerary,
    day_number: int,
    user_query: str,
    travel_data: list[TravelDataItem],
) -> Itinerary:
    day_index = day_number - 1
    if day_index < 0 or day_index >= len(existing_itinerary.days):
        raise ValueError(
            f"day_number {day_number} is out of range for an itinerary with "
            f"{len(existing_itinerary.days)} day(s)"
        )

    prompt = build_regenerate_day_prompt(
        existing_itinerary, day_number, user_query, travel_data
    )
    output_text = _call_model(prompt)

    try:
        new_day = ItineraryDay.model_validate_json(output_text)
    except ValidationError as e:
        raise ValueError(
            f"LLM returned a day that didn't match the expected format: {e}"
        )

    updated_days = list(existing_itinerary.days)
    updated_days[day_index] = new_day
    return Itinerary(days=updated_days)


def regenerate_activity(
    existing_itinerary: Itinerary,
    day_number: int,
    activity_index: int,
    user_query: str,
    travel_data: list[TravelDataItem],
) -> Itinerary:
    day_index = day_number - 1
    if day_index < 0 or day_index >= len(existing_itinerary.days):
        raise ValueError(
            f"day_number {day_number} is out of range for an itinerary with "
            f"{len(existing_itinerary.days)} day(s)"
        )

    target_day = existing_itinerary.days[day_index]
    if activity_index < 0 or activity_index >= len(target_day.activities):
        raise ValueError(
            f"activity_index {activity_index} is out of range for day {day_number} with "
            f"{len(target_day.activities)} activity(ies)"
        )

    prompt = build_regenerate_activity_prompt(
        existing_itinerary, day_number, activity_index, user_query, travel_data
    )
    output_text = _call_model(prompt)

    try:
        new_activity = ItineraryActivity.model_validate_json(output_text)
    except ValidationError as e:
        raise ValueError(
            f"LLM returned an activity that didn't match the expected format: {e}"
        )

    updated_activities = list(target_day.activities)
    updated_activities[activity_index] = new_activity
    updated_days = list(existing_itinerary.days)
    updated_days[day_index] = ItineraryDay(
        date=target_day.date, activities=updated_activities
    )
    return Itinerary(days=updated_days)
