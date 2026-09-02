from datetime import date, timedelta
from typing import TypeVar

from pydantic import BaseModel

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
    build_missing_days_prompt,
    build_regenerate_activity_prompt,
    build_regenerate_day_prompt,
    build_regenerate_itinerary_prompt,
)
from app.services.additional_notes_service import (
    resolve_preferences_from_additional_notes,
)
from app.services.search import search_service

client = get_client()

Schema = TypeVar("Schema", bound=BaseModel)


# A normal day contains around 3-5 scheduled blocks.
# Output tokens scale with the number of trip days so longer itineraries
# have enough room to complete.
TOKENS_PER_DAY = 700
MIN_OUTPUT_TOKENS = 2000

# gpt-4o output ceiling.
MAX_OUTPUT_TOKENS = 16000

# Missing or incomplete days are requested again in small batches.
TOP_UP_BATCH_DAYS = 4
MAX_TOP_UP_PASSES = 6
SEARCH_RESULTS_LIMIT = 20


def _build_search_query(preferences: TravelPreferences) -> str:
    destinations = ", ".join(
        ", ".join(
            value
            for value in (destination.get("city"), destination.get("country"))
            if value
        )
        for destination in preferences.destinations
    )
    interests = ", ".join(preferences.interests) or "general sightseeing"
    return (
        f"Travel recommendations in {destinations}; interests: {interests}; "
        f"budget: {preferences.budget} ({preferences.budget_level or 'any level'}); "
        f"dates: {preferences.start_date} to {preferences.end_date}"
    )


def _retrieve_travel_data(
    preferences: TravelPreferences, supplied_data: list[TravelDataItem]
) -> list[TravelDataItem]:
    """Search for recommendations matching the user's itinerary preferences."""
    search_results = search_service.search(
        _build_search_query(preferences), top=SEARCH_RESULTS_LIMIT, threshold=0.025
    )
    retrieved_data = [
        TravelDataItem.model_validate(result) for result in search_results
    ]

    merged_data: list[TravelDataItem] = []
    seen: set[tuple[str, str, str]] = set()
    for item in [*supplied_data, *retrieved_data]:
        key = (
            item.type.lower(),
            item.name.casefold(),
            (item.location or "").casefold(),
        )
        if key not in seen:
            seen.add(key)
            merged_data.append(item)
    return merged_data


def _day_token_budget(num_days: int) -> int:
    return max(
        MIN_OUTPUT_TOKENS,
        min(MAX_OUTPUT_TOKENS, num_days * TOKENS_PER_DAY),
    )


def _is_complete_day(day: ItineraryDay) -> bool:
    """A generated day is complete when it contains 3-5 scheduled blocks."""
    return 3 <= len(day.activities) <= 5


def _call_model(
    prompt: str,
    schema: type[Schema],
    max_output_tokens: int,
) -> Schema:
    """Ask the model for a structured response matching the given schema."""

    response = client.responses.parse(
        model=settings.AZURE_OPENAI_DEPLOYMENT,
        input=prompt,
        text_format=schema,
        max_output_tokens=max_output_tokens,
    )

    parsed = response.output_parsed

    if parsed is not None:
        return parsed

    if response.status == "incomplete":
        reason = getattr(
            response.incomplete_details,
            "reason",
            "unknown",
        )

        raise ValueError(
            f"the model ran out of room before finishing the "
            f"{schema.__name__} "
            f"(reason: {reason}); try a shorter trip or fewer cities"
        )

    raise ValueError(
        f"the model returned no usable {schema.__name__}"
    )


def generate_itinerary(
    preferences: TravelPreferences,
    travel_data: list[TravelDataItem],
) -> Itinerary:
    # Resolve explicit destination-day instructions from additional_notes
    # before building the required destination-day plan.
    preferences = resolve_preferences_from_additional_notes(
        preferences
    )

    start = date.fromisoformat(preferences.start_date)
    end = date.fromisoformat(preferences.end_date)

    num_days = (end - start).days + 1

    wanted_dates = [
        (start + timedelta(days=offset)).isoformat()
        for offset in range(num_days)
    ]

    # Search Azure AI Search for dataset entries matching these preferences
    # and merge them with any travel_data already supplied, so the model has
    # relevant real entries to work from instead of relying purely on its
    # own knowledge.
    travel_data = _retrieve_travel_data(preferences, travel_data)

    prompt = build_itinerary_prompt(
        preferences,
        travel_data,
    )

    first_pass = _call_model(
        prompt,
        Itinerary,
        _day_token_budget(num_days),
    )

    wanted = set(wanted_dates)

    # Only accept requested dates that are complete.
    #
    # A day with only 1-2 activities is treated exactly like a missing day.
    # A day with more than 5 blocks is also regenerated so the itinerary
    # maintains the intended daily structure.
    days_by_date = {
        day.date: day
        for day in first_pass.days
        if day.date in wanted and _is_complete_day(day)
    }

    # Fill dates that were either completely missing or returned incomplete.
    for _ in range(MAX_TOP_UP_PASSES):
        missing = [
            value
            for value in wanted_dates
            if value not in days_by_date
        ]

        if not missing:
            break

        batch = missing[:TOP_UP_BATCH_DAYS]

        planned_so_far = Itinerary(
            days=[
                days_by_date[value]
                for value in wanted_dates
                if value in days_by_date
            ]
        )

        top_up = _call_model(
            build_missing_days_prompt(
                preferences,
                travel_data,
                planned_so_far,
                batch,
            ),
            Itinerary,
            _day_token_budget(len(batch)),
        )

        filled_any = False

        for day in top_up.days:
            if (
                day.date in batch
                and day.date not in days_by_date
                and _is_complete_day(day)
            ):
                days_by_date[day.date] = day
                filled_any = True

        # If this pass did not produce even one usable day,
        # repeating the same top-up request is unlikely to help.
        if not filled_any:
            break

    missing = [
        value
        for value in wanted_dates
        if value not in days_by_date
    ]

    if missing:
        raise ValueError(
            f"the model only planned {len(days_by_date)} "
            f"complete day(s) out of {num_days}; "
            f"still missing or incomplete: {', '.join(missing)}"
        )

    final_itinerary = Itinerary(
        days=[
            days_by_date[value]
            for value in wanted_dates
        ]
    )
    return final_itinerary


def regenerate_itinerary(
    existing_itinerary: Itinerary,
    user_query: str,
    travel_data: list[TravelDataItem],
    preferences: TravelPreferences,
) -> Itinerary:
    prompt = build_regenerate_itinerary_prompt(
        existing_itinerary,
        user_query,
        travel_data,
        preferences,
    )

    return _call_model(
        prompt,
        Itinerary,
        _day_token_budget(
            len(existing_itinerary.days)
        ),
    )


def regenerate_day(
    existing_itinerary: Itinerary,
    day_number: int,
    user_query: str,
    travel_data: list[TravelDataItem],
    preferences: TravelPreferences,
) -> Itinerary:
    day_index = day_number - 1

    if (
        day_index < 0
        or day_index >= len(existing_itinerary.days)
    ):
        raise ValueError(
            f"day_number {day_number} is out of range for "
            f"an itinerary with "
            f"{len(existing_itinerary.days)} day(s)"
        )

    prompt = build_regenerate_day_prompt(
        existing_itinerary,
        day_number,
        user_query,
        travel_data,
        preferences,
    )

    new_day = _call_model(
        prompt,
        ItineraryDay,
        _day_token_budget(1),
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
    preferences: TravelPreferences,
) -> Itinerary:
    day_index = day_number - 1

    if (
        day_index < 0
        or day_index >= len(existing_itinerary.days)
    ):
        raise ValueError(
            f"day_number {day_number} is out of range for "
            f"an itinerary with "
            f"{len(existing_itinerary.days)} day(s)"
        )

    target_day = existing_itinerary.days[day_index]

    if (
        activity_index < 0
        or activity_index >= len(target_day.activities)
    ):
        raise ValueError(
            f"activity_index {activity_index} is out of range "
            f"for day {day_number} with "
            f"{len(target_day.activities)} activity(ies)"
        )

    prompt = build_regenerate_activity_prompt(
        existing_itinerary,
        day_number,
        activity_index,
        user_query,
        travel_data,
        preferences,
    )

    new_activity = _call_model(
        prompt,
        ItineraryActivity,
        MIN_OUTPUT_TOKENS,
    )

    updated_activities = list(target_day.activities)
    updated_activities[activity_index] = new_activity

    updated_days = list(existing_itinerary.days)

    updated_day_data = target_day.model_dump()
    updated_day_data["activities"] = updated_activities

    updated_days[day_index] = ItineraryDay(
        **updated_day_data
    )

    return Itinerary(days=updated_days)
