import re
from datetime import date

from pydantic import BaseModel, Field

from app.clients import get_client
from app.config import settings
from app.models import TravelPreferences


class DestinationReference(BaseModel):
    country: str
    city: str | None = None


class DestinationDayOverride(DestinationReference):
    days: int = Field(gt=0)


class AdditionalNoteConstraints(BaseModel):
    destination_day_overrides: list[DestinationDayOverride] = Field(
        default_factory=list
    )
    remaining_days_destination: DestinationReference | None = None


def extract_additional_note_constraints(
    preferences: TravelPreferences,
) -> AdditionalNoteConstraints:
    if (
        not preferences.additional_notes
        or not preferences.additional_notes.strip()
    ):
        return AdditionalNoteConstraints()

    extraction_prompt = f"""
You are converting a traveler's additional notes into structured destination-allocation constraints.

SELECTED DESTINATIONS:
{preferences.destinations}

ADDITIONAL NOTES:
{preferences.additional_notes}

Extract ONLY requirements explicitly stated by the traveler.

IMPORTANT:
A selected destination may contain only a country and no city.
If the traveler explicitly names a city inside that selected country in the
additional notes, that city may be used as a destination constraint even if
the city was not selected separately in the form.

1. destination_day_overrides

Use this ONLY when the traveler explicitly gives a concrete number of days
for a destination.

Examples:
- "Spend 6 days in Paris" -> Paris = 6
- "Spend exactly 1 day in Lisbon" -> Lisbon = 1
- "Two days in Porto" -> Porto = 2

DO NOT guess a number.

If the traveler says:
"Spend 1 day in Lisbon and the rest in Porto"

then:
- Lisbon belongs in destination_day_overrides with days = 1
- Porto does NOT get a guessed number
- Porto belongs in remaining_days_destination

2. remaining_days_destination

Use this only when the traveler explicitly says that the rest or remaining
days should be spent in a destination.

Examples:
- "the rest in Porto" -> Porto
- "spend the remaining days in Bordeaux" -> Bordeaux

Never calculate the remaining number yourself.

STRICT RULES:
- Do not invent requirements.
- Do not infer day counts that were not written by the traveler.
- Do not convert the total trip duration into a destination-day override.
- Do not assign every selected destination a day count unless the traveler
  explicitly gave those counts.
- A city may be introduced from the notes only when its country is one of the
  selected countries.
"""

    client = get_client()

    response = client.responses.parse(
        model=settings.AZURE_OPENAI_DEPLOYMENT,
        input=extraction_prompt,
        text_format=AdditionalNoteConstraints,
        max_output_tokens=1500,
    )

    if response.output_parsed is None:
        raise ValueError(
            "Could not interpret constraints from additional notes."
        )

    return response.output_parsed


def _normalize(value: str | None) -> str:
    return (value or "").strip().lower()


def _selected_countries(
    preferences: TravelPreferences,
) -> set[str]:
    return {
        _normalize(destination.get("country"))
        for destination in preferences.destinations
        if destination.get("country")
    }


def _reference_name(
    reference: DestinationReference,
) -> str:
    return reference.city or reference.country


def _note_for_day_matching(note: str) -> str:
    number_words = {
        "one": "1",
        "two": "2",
        "three": "3",
        "four": "4",
        "five": "5",
        "six": "6",
        "seven": "7",
        "eight": "8",
        "nine": "9",
        "ten": "10",
        "eleven": "11",
        "twelve": "12",
        "thirteen": "13",
        "fourteen": "14",
        "fifteen": "15",
        "sixteen": "16",
        "seventeen": "17",
        "eighteen": "18",
        "nineteen": "19",
        "twenty": "20",
        "twenty one": "21",
        "twenty-two": "22",
        "twenty two": "22",
        "twenty-three": "23",
        "twenty three": "23",
        "twenty-four": "24",
        "twenty four": "24",
        "twenty-five": "25",
        "twenty five": "25",
        "twenty-six": "26",
        "twenty six": "26",
        "twenty-seven": "27",
        "twenty seven": "27",
        "twenty-eight": "28",
        "twenty eight": "28",
        "twenty-nine": "29",
        "twenty nine": "29",
        "thirty": "30",
        "thirty one": "31",
        "thirty-one": "31",
    }
    normalized = note.lower()
    for word, number in sorted(number_words.items(), key=lambda item: len(item[0]), reverse=True):
        normalized = re.sub(rf"\b{re.escape(word)}\b", number, normalized)
    return normalized


def _destination_context_matches(
    note: str,
    reference: DestinationReference,
    *,
    day_count: int | None = None,
    remaining: bool = False,
) -> bool:
    normalized_note = _note_for_day_matching(note)
    place = re.escape(_reference_name(reference).lower())
    patterns: list[str] = []

    if day_count is not None:
        days = str(day_count)
        patterns.extend(
            [
                rf"\b{days}\s+days?\b[^.!?\n]{{0,60}}\b{place}\b",
                rf"\b{place}\b[^.!?\n]{{0,60}}\b{days}\s+days?\b",
            ]
        )

    if remaining:
        patterns.extend(
            [
                rf"\b(?:rest|remaining)\b[^.!?\n]{{0,80}}\b{place}\b",
                rf"\b{place}\b[^.!?\n]{{0,80}}\b(?:rest|remaining)\b",
            ]
        )

    return any(re.search(pattern, normalized_note, re.IGNORECASE) for pattern in patterns)


def _explicit_day_override_is_in_note(
    note: str,
    override: DestinationDayOverride,
) -> bool:
    return _destination_context_matches(
        note,
        override,
        day_count=override.days,
    )


def _remaining_destination_is_in_note(
    note: str,
    reference: DestinationReference,
) -> bool:
    return _destination_context_matches(
        note,
        reference,
        remaining=True,
    )


def _sanitize_destination_constraints(
    preferences: TravelPreferences,
    constraints: AdditionalNoteConstraints,
) -> AdditionalNoteConstraints:
    """
    Reject destination allocations that the extraction model invented.

    A numeric override is accepted only when:
    - its country was selected, and
    - the note actually contains that destination with that day count.

    A remaining-days destination is accepted only when:
    - its country was selected, and
    - the note actually says rest/remaining days for that destination.
    """
    note = preferences.additional_notes or ""
    selected_countries = _selected_countries(preferences)

    valid_overrides: list[DestinationDayOverride] = []

    for override in constraints.destination_day_overrides:
        if _normalize(override.country) not in selected_countries:
            continue

        if not _explicit_day_override_is_in_note(
            note,
            override,
        ):
            continue

        valid_overrides.append(override)

    remaining_destination = constraints.remaining_days_destination

    if remaining_destination is not None and (
        _normalize(remaining_destination.country)
        not in selected_countries
        or not _remaining_destination_is_in_note(
            note,
            remaining_destination,
        )
    ):
        remaining_destination = None

    return constraints.model_copy(
        update={
            "destination_day_overrides": valid_overrides,
            "remaining_days_destination": remaining_destination,
        }
    )


def _destination_matches_reference(
    destination: dict,
    reference: DestinationReference,
) -> bool:
    destination_country = _normalize(
        destination.get("country")
    )
    destination_city = _normalize(
        destination.get("city")
    )

    reference_country = _normalize(reference.country)
    reference_city = _normalize(reference.city)

    if destination_country != reference_country:
        return False

    if reference_city:
        return destination_city == reference_city

    return not destination_city


def _country_was_selected(
    preferences: TravelPreferences,
    country: str,
) -> bool:
    selected = _selected_countries(preferences)
    return _normalize(country) in selected


def _find_or_add_destination(
    resolved: list[dict],
    preferences: TravelPreferences,
    reference: DestinationReference,
) -> int:
    for index, destination in enumerate(resolved):
        if _destination_matches_reference(
            destination,
            reference,
        ):
            return index

    if not _country_was_selected(
        preferences,
        reference.country,
    ):
        raise ValueError(
            f"{reference.country} was not selected for this trip."
        )

    resolved.append(
        {
            "country": reference.country,
            "city": reference.city,
            "days": 0,
        }
    )

    return len(resolved) - 1


def resolve_destination_days(
    preferences: TravelPreferences,
    constraints: AdditionalNoteConstraints,
) -> list[dict]:
    start = date.fromisoformat(preferences.start_date)
    end = date.fromisoformat(preferences.end_date)

    total_trip_days = (end - start).days + 1

    resolved = [
        dict(destination)
        for destination in preferences.destinations
    ]

    overridden_indexes: set[int] = set()

    for override in constraints.destination_day_overrides:
        index = _find_or_add_destination(
            resolved,
            preferences,
            override,
        )

        resolved[index]["days"] = override.days
        overridden_indexes.add(index)

    fixed_days = sum(
        int(resolved[index]["days"])
        for index in overridden_indexes
    )

    if fixed_days > total_trip_days:
        raise ValueError(
            "Explicit destination-day requests exceed the total trip length."
        )

    if constraints.remaining_days_destination is not None:
        remainder_index = _find_or_add_destination(
            resolved,
            preferences,
            constraints.remaining_days_destination,
        )

        remaining_days = total_trip_days - fixed_days

        # "The rest in X" means X owns every day not already fixed by
        # an explicit numeric destination instruction.
        for index in range(len(resolved)):
            if (
                index not in overridden_indexes
                and index != remainder_index
            ):
                resolved[index]["days"] = 0

        resolved[remainder_index]["days"] = remaining_days

        return [
            destination
            for destination in resolved
            if int(destination.get("days", 0)) > 0
        ]

    if not overridden_indexes:
        return resolved

    remaining_days = total_trip_days - fixed_days

    flexible_indexes = [
        index
        for index in range(len(resolved))
        if index not in overridden_indexes
    ]

    if not flexible_indexes:
        if remaining_days != 0:
            raise ValueError(
                "Explicit destination-day requests do not add up to the "
                "total trip length."
            )

        return resolved

    original_weights: list[int] = []

    for index in flexible_indexes:
        destination = resolved[index]

        matching_original = next(
            (
                original
                for original in preferences.destinations
                if _destination_matches_reference(
                    original,
                    DestinationReference(
                        country=destination["country"],
                        city=destination.get("city"),
                    ),
                )
            ),
            None,
        )

        original_weights.append(
            max(
                int(
                    matching_original.get("days", 0)
                    if matching_original
                    else 0
                ),
                0,
            )
        )

    weight_total = sum(original_weights)

    if weight_total == 0:
        original_weights = [1] * len(flexible_indexes)
        weight_total = len(flexible_indexes)

    raw_allocations = [
        remaining_days * weight / weight_total
        for weight in original_weights
    ]

    allocations = [
        int(value)
        for value in raw_allocations
    ]

    leftover = remaining_days - sum(allocations)

    remainder_order = sorted(
        range(len(raw_allocations)),
        key=lambda index: (
            raw_allocations[index] - allocations[index]
        ),
        reverse=True,
    )

    for index in remainder_order[:leftover]:
        allocations[index] += 1

    for allocation_index, destination_index in enumerate(
        flexible_indexes
    ):
        resolved[destination_index]["days"] = allocations[
            allocation_index
        ]

    return [
        destination
        for destination in resolved
        if int(destination.get("days", 0)) > 0
    ]


def resolve_preferences_from_additional_notes(
    preferences: TravelPreferences,
) -> TravelPreferences:
    constraints = extract_additional_note_constraints(
        preferences
    )

    constraints = _sanitize_destination_constraints(
        preferences,
        constraints,
    )

    if (
        not constraints.destination_day_overrides
        and constraints.remaining_days_destination is None
    ):
        return preferences

    resolved_destinations = resolve_destination_days(
        preferences,
        constraints,
    )

    return preferences.model_copy(
        update={
            "destinations": resolved_destinations,
        }
    )
