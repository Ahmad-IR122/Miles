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

client = get_client()

Schema = TypeVar("Schema", bound=BaseModel)

# A day of 3-5 activities costs roughly this much JSON, with headroom. The
# budget has to grow with the trip: asking for a month of days inside a fixed
# 8k ceiling is what pushed the model into abbreviating its answer.
TOKENS_PER_DAY = 700
MIN_OUTPUT_TOKENS = 2000
# gpt-4o tops out at 16384 output tokens.
MAX_OUTPUT_TOKENS = 16000
# Follow-up requests for days the first pass skipped. Small batches, because
# that is exactly the shape of request the model handles reliably; the pass
# count is bounded so a stubborn model can't blow the caller's timeout.
TOP_UP_BATCH_DAYS = 4
MAX_TOP_UP_PASSES = 6


def _day_token_budget(num_days: int) -> int:
    return max(MIN_OUTPUT_TOKENS, min(MAX_OUTPUT_TOKENS, num_days * TOKENS_PER_DAY))


def _call_model(prompt: str, schema: type[Schema], max_output_tokens: int) -> Schema:
    """Ask the model for `schema` and get back a parsed instance.

    The schema is enforced by the service, not merely requested in the prompt,
    so the model cannot answer with prose, a fenced code block, or an
    abbreviated "...remaining days follow the same pattern" filler — all of
    which used to arrive as text and fail JSON parsing on longer trips.
    """
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
        reason = getattr(response.incomplete_details, "reason", "unknown")
        raise ValueError(
            f"the model ran out of room before finishing the {schema.__name__} "
            f"(reason: {reason}); try a shorter trip or fewer cities"
        )

    raise ValueError(f"the model returned no usable {schema.__name__}")


def generate_itinerary(
    preferences: TravelPreferences, travel_data: list[TravelDataItem]
) -> Itinerary:
    start = date.fromisoformat(preferences.start_date)
    end = date.fromisoformat(preferences.end_date)
    num_days = (end - start).days + 1
    wanted_dates = [
        (start + timedelta(days=offset)).isoformat() for offset in range(num_days)
    ]

    prompt = build_itinerary_prompt(preferences, travel_data)
    first_pass = _call_model(prompt, Itinerary, _day_token_budget(num_days))

    # An empty activities list satisfies the schema but is not a planned day,
    # so those count as missing too.
    wanted = set(wanted_dates)
    days_by_date = {
        day.date: day for day in first_pass.days if day.date in wanted and day.activities
    }

    # Asked for a long trip in one request the model regularly answers with
    # just the first few days and stops, even with plenty of output budget
    # left. Rather than saving a short itinerary, ask again for what is still
    # missing — it handles a handful of explicit dates reliably.
    for _ in range(MAX_TOP_UP_PASSES):
        missing = [value for value in wanted_dates if value not in days_by_date]
        if not missing:
            break

        batch = missing[:TOP_UP_BATCH_DAYS]
        planned_so_far = Itinerary(
            days=[days_by_date[value] for value in wanted_dates if value in days_by_date]
        )
        top_up = _call_model(
            build_missing_days_prompt(preferences, travel_data, planned_so_far, batch),
            Itinerary,
            _day_token_budget(len(batch)),
        )

        filled_any = False
        for day in top_up.days:
            if day.date in batch and day.date not in days_by_date and day.activities:
                days_by_date[day.date] = day
                filled_any = True

        # A pass that adds nothing will not do better if repeated.
        if not filled_any:
            break

    missing = [value for value in wanted_dates if value not in days_by_date]
    if missing:
        raise ValueError(
            f"the model only planned {len(days_by_date)} of {num_days} days; "
            f"still missing {', '.join(missing)}"
        )

    return Itinerary(days=[days_by_date[value] for value in wanted_dates])


def regenerate_itinerary(
    existing_itinerary: Itinerary,
    user_query: str,
    travel_data: list[TravelDataItem],
) -> Itinerary:
    prompt = build_regenerate_itinerary_prompt(
        existing_itinerary, user_query, travel_data
    )
    return _call_model(
        prompt, Itinerary, _day_token_budget(len(existing_itinerary.days))
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
    new_day = _call_model(prompt, ItineraryDay, _day_token_budget(1))

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
    new_activity = _call_model(prompt, ItineraryActivity, MIN_OUTPUT_TOKENS)

    updated_activities = list(target_day.activities)
    updated_activities[activity_index] = new_activity
    updated_days = list(existing_itinerary.days)
    updated_days[day_index] = ItineraryDay(
        date=target_day.date, activities=updated_activities
    )
    return Itinerary(days=updated_days)
