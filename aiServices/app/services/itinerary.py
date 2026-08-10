from pydantic import ValidationError

from app.clients.azure_openai import get_client
from app.config.config import settings
from app.models.travel import Itinerary, ItineraryDay, TravelDataItem, TravelPreferences
from app.prompts.itinerary_prompt import (
    build_itinerary_prompt,
    build_regenerate_day_prompt,
    build_regenerate_itinerary_prompt,
)

client = get_client()


def _call_model(prompt: str) -> str:
    response = client.responses.create(
        model=settings.AZURE_OPENAI_DEPLOYMENT,
        input=prompt,
    )

    output_text = response.output_text.strip()
    if output_text.startswith("```"):
        output_text = output_text.strip("`")
        if output_text.startswith("json"):
            output_text = output_text[4:]
        output_text = output_text.strip()

    return output_text


def generate_itinerary(preferences: TravelPreferences, travel_data: list[TravelDataItem]) -> Itinerary:
    prompt = build_itinerary_prompt(preferences, travel_data)
    output_text = _call_model(prompt)

    try:
        return Itinerary.model_validate_json(output_text)
    except ValidationError as e:
        raise ValueError(f"LLM returned an itinerary that didn't match the expected format: {e}")


def regenerate_itinerary(
    existing_itinerary: Itinerary,
    user_query: str,
    travel_data: list[TravelDataItem],
) -> Itinerary:
    prompt = build_regenerate_itinerary_prompt(existing_itinerary, user_query, travel_data)
    output_text = _call_model(prompt)

    try:
        return Itinerary.model_validate_json(output_text)
    except ValidationError as e:
        raise ValueError(f"LLM returned an itinerary that didn't match the expected format: {e}")


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

    prompt = build_regenerate_day_prompt(existing_itinerary, day_number, user_query, travel_data)
    output_text = _call_model(prompt)

    try:
        new_day = ItineraryDay.model_validate_json(output_text)
    except ValidationError as e:
        raise ValueError(f"LLM returned a day that didn't match the expected format: {e}")

    updated_days = list(existing_itinerary.days)
    updated_days[day_index] = new_day
    return Itinerary(days=updated_days)