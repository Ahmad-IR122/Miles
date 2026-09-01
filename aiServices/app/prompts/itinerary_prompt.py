from typing import Union

from app.models import Itinerary, TravelPreferences

# Type hint for activity or restaurant data
TravelDataItem = Union["ActivityItem", "RestaurantItem"]


class ActivityItem:
    """Represents an activity from activities_30_enriched.csv"""

    name: str
    category: str
    description: str
    estimated_duration_minutes: int
    time_of_day: str
    rating: float
    review_count: float
    indoor_outdoor: str


class RestaurantItem:
    """Represents a restaurant from restaurants_final_enriched.csv"""

    name: str
    cuisines: str
    price_range: str
    description: str
    rating: float
    review_count: float
    estimated_duration_minutes: int
    meal_type: str
    budget_level: str


def _is_restaurant(item: TravelDataItem) -> bool:
    """Distinguish between activity and restaurant items"""
    return item.type.lower() == "restaurant"


def _format_item_for_prompt(item: TravelDataItem) -> str:
    """Format a single activity or restaurant for the prompt"""
    line = f"- {item.name}"

    if _is_restaurant(item):
        line += " (Restaurant)"
        if item.cuisines:
            line += f" | {item.cuisines}"
        if item.price_range:
            line += f" | {item.price_range}"
        if item.rating:
            line += f" | ⭐{item.rating}"
        if item.meal_type:
            line += f" | {item.meal_type}"
        if item.estimated_duration_minutes:
            line += f" | {item.estimated_duration_minutes} min"
    else:
        line += " (Activity)"
        if item.category:
            line += f" | {item.category}"
        if item.time_of_day and item.time_of_day != "any":
            line += f" | Best: {item.time_of_day}"
        if item.rating:
            line += f" | ⭐{item.rating}"
        if item.indoor_outdoor:
            line += f" | {item.indoor_outdoor}"
        if item.estimated_duration_minutes:
            line += f" | {item.estimated_duration_minutes} min"

    line += f"\n  {item.description}"
    return line


def build_itinerary_prompt(
    preferences: TravelPreferences, travel_data: list[TravelDataItem]
) -> str:
    if travel_data:
        data_lines = "\n".join(_format_item_for_prompt(item) for item in travel_data)
    else:
        data_lines = "No travel data found."

    from datetime import date, timedelta

    start = date.fromisoformat(preferences.start_date)
    end = date.fromisoformat(preferences.end_date)
    num_days = (end - start).days + 1
    # Spelling the dates out gives the model a checklist to work through. Given
    # only a start/end and per-destination allocations it tends to return one
    # destination's worth of days and stop.
    required_dates = "\n".join(
        f"  {offset + 1}. {(start + timedelta(days=offset)).isoformat()}"
        for offset in range(num_days)
    )
    interests_str = (
        ", ".join(preferences.interests)
        if preferences.interests
        else "general sightseeing"
    )

    destinations_str = "; ".join(
        f"{destination['city'] + ', ' if destination.get('city') else ''}"
        f"{destination['country']} ({destination['days']} days)"
        for destination in preferences.destinations
    )

    return f"""You are a professional travel itinerary planner. Create a detailed, realistic, and engaging day-by-day itinerary.

TRIP DETAILS:
- Destinations and allocated days: {destinations_str}
- Start Date: {preferences.start_date}
- End Date: {preferences.end_date}
- Interests: {interests_str}
- Total Budget: {preferences.budget}

THE TRIP IS {num_days} DAYS LONG. Return exactly {num_days} day objects, one for
each date below, in this order. The per-destination day counts above say how to
split these {num_days} days between destinations - they are not the length of
the trip.

{required_dates}

AVAILABLE ATTRACTIONS, ACTIVITIES & RESTAURANTS:
{data_lines}

YOUR RESPONSIBILITIES:

1. ACTIVITY SEQUENCING:
   - Arrange activities chronologically throughout each day
   - Start early (6:00 AM - 8:00 AM)
   - End with dinner or evening activity (6:00 PM - 8:00 PM)
   - No overlapping times
   - Leave 30-60 minute travel buffers between distant locations

2. USE PROVIDED DATA:
   - Use estimated_duration_minutes from data
   - Respect time_of_day recommendations for activities (morning/afternoon/evening)
   - Use ratings to prioritize quality attractions
   - Use price_range for restaurants and budget_level for activities

3. CATEGORIZE ACTIVITIES:
   - For activities: Use provided category tags or split "/" delimited categories
   - For meals: Categorize as "food"
   - Add 2-3 relevant tags per activity
   - Examples: ["Museum", "Art", "Walking"], ["Restaurant", "Dinner"], ["Cafe", "Brunch"]

4. COST ESTIMATION:
   - For restaurants: Use price_range directly (e.g., "€12-€30", "$15-$40")
   - For activities: Estimate reasonable costs (e.g., "Free", "$10-$25", "€8-€15")
   - Distribute costs across budget
   - Note: Prices in provided data vary by currency/region

5. LOCATION SPECIFICITY:
   - Use specific neighborhoods: "Asakusa, Tokyo" not "Tokyo"
   - Group nearby activities to minimize travel
   - Vary locations daily

6. RECOMMENDATIONS:
   - Write 1-2 engaging sentences
   - Include practical tips or best times to visit
   - Match interests provided
   - Keep descriptions concise

7. TIME FORMAT:
   - Use 12-hour format with AM/PM (e.g., "09:30 AM", "06:00 PM")

RESPONSE FORMAT (JSON ONLY):
{{
  "days": [
    {{
      "date": "YYYY-MM-DD",
      "activities": [
        {{
          "time": "HH:MM AM/PM",
          "duration_minutes": integer,
          "activity": "activity name",
          "category": "culture/food/shopping/adventure/nightlife/nature",
          "tags": ["tag1", "tag2", "tag3"],
          "location": "specific location, neighborhood, city",
          "recommendation": "engaging 1-2 sentence description",
          "estimated_cost": "Free / €XX / $XX / other currency"
        }}
      ]
    }}
  ]
}}

CRITICAL REQUIREMENTS:
- Generate exactly {num_days} days - one per date listed above, none missing.
  Do not stop early, do not merge days, do not summarise or abbreviate any day.
- Each day: 3-5 activities (mix of attractions, meals, experiences)
- Dates match trip dates ({preferences.start_date} to {preferences.end_date})
- Times in chronological order, no overlaps
- All locations are real places in the selected destinations: {destinations_str}
- Return ONLY JSON, nothing else"""


def build_missing_days_prompt(
    preferences: TravelPreferences,
    travel_data: list[TravelDataItem],
    planned_so_far: Itinerary,
    missing_dates: list[str],
) -> str:
    """Ask for just the days that came back missing from a first attempt.

    Asked for a long trip in one go the model tends to answer with only the
    first few days. It handles a short, explicit list of dates reliably, so the
    gaps are filled in a second pass instead.
    """
    destinations_str = "; ".join(
        f"{destination['city'] + ', ' if destination.get('city') else ''}"
        f"{destination['country']} ({destination['days']} days)"
        for destination in preferences.destinations
    )
    dates_list = "\n".join(f"  - {value}" for value in missing_dates)

    return f"""You are a professional travel itinerary planner. A trip is partly planned and
some days are still missing. Plan ONLY the missing days.

TRIP DETAILS:
- Destinations and allocated days: {destinations_str}
- Full trip: {preferences.start_date} to {preferences.end_date}
- Interests: {", ".join(preferences.interests) or "general sightseeing"}
- Total Budget: {preferences.budget}

AVAILABLE ATTRACTIONS, ACTIVITIES & RESTAURANTS:
{_format_travel_data(travel_data)}

ALREADY PLANNED (do not repeat these activities or locations):
{planned_so_far.model_dump_json(indent=2)}

MISSING DATES - return exactly one day object for each, in this order:
{dates_list}

RULES:
- Return exactly {len(missing_dates)} day objects, one per missing date above.
- Do not return any date that is already planned.
- Every day MUST contain 3-5 fully filled-in activities. A day with an empty
  activities list is not acceptable - plan each one properly.
- Activities run chronologically, starting 6:00-8:00 AM and ending with an
  evening meal or activity, times in "HH:MM AM/PM" format.
- Each activity needs a real location, a 1-2 sentence recommendation, 2-3 tags,
  a duration in minutes and an estimated cost.
- Keep each destination's allocated days contiguous where the already-planned
  days allow it.
- All locations are real places in the selected destinations: {destinations_str}"""


def _format_travel_data(travel_data: list[TravelDataItem]) -> str:
    """Format travel data for regeneration prompts"""
    data_lines = "\n".join(
        f"- {item.name}: {item.description}"
        + (f" (Category: {item.category})" if hasattr(item, "category") else "")
        + (f" (Cuisines: {item.cuisines})" if hasattr(item, "cuisines") else "")
        for item in travel_data
    )
    return data_lines or "No specific travel data was found for this destination."


def build_regenerate_itinerary_prompt(
    existing_itinerary: Itinerary,
    user_query: str,
    travel_data: list[TravelDataItem],
) -> str:
    return f"""You are a travel planning assistant. A user already has the itinerary below and wants
it changed. Update the itinerary to satisfy their request.

Current itinerary (JSON):
{existing_itinerary.model_dump_json(indent=2)}

User's requested change:
"{user_query}"

Available travel data (ground your changes in these real options where relevant; do not
invent places that are not in this list or already in the current itinerary):
{_format_travel_data(travel_data)}

Rules:
- Apply the user's requested change.
- Keep the same number of days as the current itinerary unless the request explicitly asks
  to add or remove days.
- Keep everything the user did not ask to change as close to the original as possible.
- Every activity's location/recommendation must come from the available travel data or the
  current itinerary, not be invented.
- Respect actual price ranges and duration estimates from the data.

Return the full updated itinerary as JSON matching this exact structure:
{{
  "days": [
    {{
      "date": "YYYY-MM-DD",
      "activities": [
        {{
          "time": "HH:MM AM/PM",
          "duration_minutes": 60,
          "activity": "string",
          "category": "culture/food/shopping/adventure/nightlife/nature",
          "tags": ["tag1", "tag2"],
          "location": "string",
          "recommendation": "string",
          "estimated_cost": "Free / €XX / $XX"
        }}
      ]
    }}
  ]
}}

Only return valid JSON, no extra commentary."""


def build_regenerate_day_prompt(
    existing_itinerary: Itinerary,
    day_number: int,
    user_query: str,
    travel_data: list[TravelDataItem],
) -> str:
    day_index = day_number - 1
    target_day = (
        existing_itinerary.days[day_index]
        if 0 <= day_index < len(existing_itinerary.days)
        else None
    )
    target_day_json = target_day.model_dump_json(indent=2) if target_day else "null"

    return f"""You are a travel planning assistant. A user has a multi-day itinerary and wants ONLY
day {day_number} changed. Every other day must stay exactly as it is.

Full current itinerary (for context, so you don't repeat places already used elsewhere or
create scheduling conflicts):
{existing_itinerary.model_dump_json(indent=2)}

The day to change (day {day_number}):
{target_day_json}

User's requested change for this day:
"{user_query}"

Available travel data (ground your changes in these real options where relevant; do not
invent places that are not in this list or already in the current itinerary):
{_format_travel_data(travel_data)}

Rules:
- Only regenerate day {day_number}. Do not repeat or return the other days.
- Apply the user's requested change to that day.
- Avoid duplicating activities/locations already used on other days unless the user asked for that.
- Every activity's location/recommendation must come from the available travel data or the
  current itinerary, not be invented.
- Respect actual price ranges and duration estimates from the data.

Return ONLY the updated day as JSON matching this exact structure:
{{
  "date": "YYYY-MM-DD",
  "activities": [
    {{
      "time": "HH:MM AM/PM",
      "duration_minutes": 60,
      "activity": "string",
      "category": "culture/food/shopping/adventure/nightlife/nature",
      "tags": ["tag1", "tag2"],
      "location": "string",
      "recommendation": "string",
      "estimated_cost": "Free / €XX / $XX"
    }}
  ]
}}

Only return valid JSON, no extra commentary."""


def build_regenerate_activity_prompt(
    existing_itinerary: Itinerary,
    day_number: int,
    activity_index: int,
    user_query: str,
    travel_data: list[TravelDataItem],
) -> str:
    day_index = day_number - 1
    target_day = (
        existing_itinerary.days[day_index]
        if 0 <= day_index < len(existing_itinerary.days)
        else None
    )
    target_day_json = target_day.model_dump_json(indent=2) if target_day else "null"

    target_activity = (
        target_day.activities[activity_index]
        if target_day and 0 <= activity_index < len(target_day.activities)
        else None
    )
    target_activity_json = (
        target_activity.model_dump_json(indent=2) if target_activity else "null"
    )

    return f"""You are a travel planning assistant. A user has a multi-day itinerary and wants ONLY
a single activity changed. Every other activity, on this day and on every other day, must stay
exactly as it is.

Full current itinerary (for context, so you don't repeat places already used elsewhere or
create scheduling conflicts):
{existing_itinerary.model_dump_json(indent=2)}

The day containing the activity (day {day_number}):
{target_day_json}

The activity to replace:
{target_activity_json}

User's requested change for this activity:
"{user_query}"

Available travel data (ground your changes in these real options where relevant; do not
invent places that are not in this list or already in the current itinerary):
{_format_travel_data(travel_data)}

Rules:
- Return exactly one replacement activity. Do not return the day or the itinerary.
- Apply the user's requested change to that activity.
- Keep the replacement geographically and chronologically sensible next to the activities
  before and after it on day {day_number}.
- Stay close to the original time and duration unless the user asked to change them.
- Avoid duplicating activities/locations already used elsewhere in the itinerary unless the
  user asked for that.
- The location/recommendation must come from the available travel data or the current
  itinerary, not be invented.

Return ONLY the replacement activity as JSON matching this exact structure:
{{
  "time": "HH:MM AM/PM",
  "duration_minutes": 60,
  "activity": "string",
  "category": "culture/food/shopping/adventure/nightlife/nature",
  "tags": ["tag1", "tag2"],
  "location": "string",
  "recommendation": "string",
  "estimated_cost": "Free / $XX / ¥XXX"
}}

Only return valid JSON, no extra commentary."""
