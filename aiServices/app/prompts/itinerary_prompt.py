from app.models.travel import Itinerary, TravelDataItem, TravelPreferences


def build_itinerary_prompt(preferences: TravelPreferences, travel_data: list[TravelDataItem]) -> str:
    if travel_data:
        data_lines = "\n".join(
            f"- {item.name} ({item.type})"
            + (f" | {item.estimated_duration_minutes} min" if item.estimated_duration_minutes else "")
            + (f" | Best: {item.time_of_day}" if item.time_of_day else "")
            + (f" | ⭐{item.rating}" if item.rating else "")
            + (f" | Category: {item.category}" if item.category else "")
            + (f" | {item.price_range}" if item.price_range else "")
            + (f" | {item.cuisines}" if item.cuisines else "")
            + f"\n  {item.description}"
            for item in travel_data
        )
    else:
        data_lines = "No travel data found."

    from datetime import datetime
    start = datetime.strptime(preferences.start_date, "%Y-%m-%d")
    end = datetime.strptime(preferences.end_date, "%Y-%m-%d")
    num_days = (end - start).days + 1
    interests_str = ", ".join(preferences.interests) if preferences.interests else "general sightseeing"

    return f"""You are a professional travel itinerary planner. Create a detailed, realistic, and engaging day-by-day itinerary.

TRIP DETAILS:
- Destination: {preferences.destination}
- Start Date: {preferences.start_date}
- End Date: {preferences.end_date}
- Number of Days: {num_days}
- Interests: {interests_str}
- Total Budget: {preferences.budget}

AVAILABLE ATTRACTIONS & ACTIVITIES:
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
   - Respect time_of_day recommendations
   - Use ratings to prioritize quality attractions
   - Use price_range and budget_level for cost estimates

3. CATEGORIZE ACTIVITIES:
   - Assign primary category: "culture" / "food" / "shopping" / "adventure" / "nightlife" / "nature"
   - Add 2-3 relevant tags per activity
   - Examples: ["Sightseeing", "Walking"], ["Dining", "Restaurant"], ["Market", "Food"]

4. COST ESTIMATION:
   - For restaurants: Use price_range (e.g., "¥1000-¥1500", "$50-$100")
   - For activities: Use budget_level formatted as price (e.g., "Free", "$15-$30")
   - Distribute costs across budget

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
          "estimated_cost": "Free / $XX / ¥XXX"
        }}
      ]
    }}
  ]
}}

CRITICAL REQUIREMENTS:
- Generate exactly {num_days} days
- Each day: 3-5 activities
- Dates match trip dates ({preferences.start_date} to {preferences.end_date})
- Times in chronological order, no overlaps
- All locations are real places in {preferences.destination}
- Return ONLY JSON, nothing else"""


def _format_travel_data(travel_data: list[TravelDataItem]) -> str:
    data_lines = "\n".join(
        f"- {item.name} ({item.type}): {item.description}"
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
          "estimated_cost": "Free / $XX / ¥XXX"
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
    target_day = existing_itinerary.days[day_index] if 0 <= day_index < len(existing_itinerary.days) else None
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
      "estimated_cost": "Free / $XX / ¥XXX"
    }}
  ]
}}

Only return valid JSON, no extra commentary."""
