from app.models import Itinerary, TravelDataItem, TravelPreferences


def _is_restaurant(item: TravelDataItem) -> bool:
    """Distinguish between activity and restaurant items."""
    return item.type.lower() == "restaurant"


def _format_item_for_prompt(item: TravelDataItem) -> str:
    """Format one retrieved activity or restaurant for the prompt."""

    line = f"- {item.name}"

    if _is_restaurant(item):
        line += " (Restaurant)"

        if item.cuisines:
            line += f" | {item.cuisines}"

        if item.price_range:
            line += f" | {item.price_range}"

        if item.rating:
            line += f" | {item.rating}"

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
            line += f" | {item.rating}"

        if item.indoor_outdoor:
            line += f" | {item.indoor_outdoor}"

        if item.estimated_duration_minutes:
            line += f" | {item.estimated_duration_minutes} min"

    line += f"\n  {item.description}"

    return line


def _describe_travelers(
    preferences: TravelPreferences,
) -> tuple[str, str]:
    """Summarize traveler composition and planning implications."""

    adults = preferences.adults
    children = preferences.children

    travelers_str = f"{adults} adult(s)" + (
        f", {children} child(ren)"
        if children
        else ""
    )

    if children:
        instruction = (
            "This group includes children: prioritize family- or "
            "child-friendly attractions and activities, avoid anything "
            "age- or risk-inappropriate for children, and account for "
            "child pricing where applicable."
        )
    else:
        instruction = (
            "This is an adults-only group; no child-specific adjustments "
            "are required."
        )

    return travelers_str, instruction


def _build_destination_day_plan(
    preferences: TravelPreferences,
) -> list[tuple[str, str]]:
    """Assign each trip date to its resolved destination."""

    from datetime import date, timedelta

    start = date.fromisoformat(preferences.start_date)
    end = date.fromisoformat(preferences.end_date)

    trip_dates = [
        (start + timedelta(days=offset)).isoformat()
        for offset in range((end - start).days + 1)
    ]

    total_allocated_days = sum(
        int(destination["days"])
        for destination in preferences.destinations
    )

    if total_allocated_days != len(trip_dates):
        raise ValueError(
            "Destination day allocation does not match total trip length: "
            f"{total_allocated_days} allocated vs "
            f"{len(trip_dates)} trip days."
        )

    plan: list[tuple[str, str]] = []
    date_index = 0

    for destination in preferences.destinations:
        destination_name = (
            f"{destination['city']}, {destination['country']}"
            if destination.get("city")
            else destination["country"]
        )

        for _ in range(int(destination["days"])):
            plan.append(
                (
                    trip_dates[date_index],
                    destination_name,
                )
            )
            date_index += 1

    return plan


def build_itinerary_prompt(
    preferences: TravelPreferences,
    travel_data: list[TravelDataItem],
) -> str:
    from datetime import date

    start = date.fromisoformat(preferences.start_date)
    end = date.fromisoformat(preferences.end_date)

    num_days = (end - start).days + 1

    if travel_data:
        data_lines = "\n".join(
            _format_item_for_prompt(item)
            for item in travel_data
        )

        data_source_instruction = (
            "The list above contains real retrieved results for this trip. "
            "Treat it as a starting point, not the complete itinerary. "
            "Prioritize these entries when they genuinely fit, then use "
            "your own knowledge of real existing attractions, activities, "
            "and restaurants to fill remaining itinerary slots. "
            "Never invent places that do not exist."
        )

    else:
        data_lines = (
            "No search/dataset results were found for this destination."
        )

        data_source_instruction = (
            "No dataset results were available for this destination. "
            "Use your own knowledge to recommend real existing "
            "attractions, activities, and restaurants. "
            "Never invent places that do not exist."
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

    travelers_str, traveler_instruction = _describe_travelers(
        preferences
    )

    additional_notes_line = (
        f"- Additional Notes From Traveler: "
        f"{preferences.additional_notes}\n"
        if preferences.additional_notes
        else ""
    )

    destination_day_plan = "\n".join(
        f"- {trip_date}: {destination}"
        for trip_date, destination
        in _build_destination_day_plan(preferences)
    )

    return f"""You are a professional travel itinerary planner. Create a detailed, realistic, and engaging day-by-day itinerary.

TRIP DETAILS:
- Destinations and allocated days: {destinations_str}
- Start Date: {preferences.start_date}
- End Date: {preferences.end_date}
- Number of Days: {num_days}
- Travelers: {travelers_str}
- Interests / Activities Requested: {interests_str}
- Total Budget: {preferences.budget}{f" ({preferences.budget_level} budget tier)" if preferences.budget_level else ""}
{additional_notes_line}

INTEREST PRIORITY:
- Every item in Interests / Activities Requested is a genuine traveler preference.
- This includes custom interests typed manually by the traveler.
- If a traveler entered a specific interest such as fishing, photography,
  food, art, or hiking, meaningfully incorporate relevant activities into
  the itinerary instead of treating the interest as optional.
- Do not silently drop custom interests.

ADDITIONAL NOTES PRIORITY:
- Additional Notes From Traveler are direct traveler instructions.
- Follow them whenever they apply.
- Treat free-text notes as binding traveler requirements.
- If Additional Notes conflict with a generic planning preference below,
  the traveler's Additional Notes take priority.

REQUIRED DAY-BY-DAY DESTINATION PLAN:
{destination_day_plan}

DESTINATION PLAN RULES:
- The date-to-destination mapping above is final.
- Plan every date primarily in its assigned destination.
- Do not redistribute days between destinations.
- Travel between destinations may be included when necessary, but it must not
  change the destination assigned to that date.
- Travel may count as one scheduled block, but it must not replace the entire
  day.
- Include meals and destination activities around a transfer whenever
  realistically possible.
- Even on a travel day, never return only 1-2 scheduled blocks.

AVAILABLE ATTRACTIONS, ACTIVITIES & RESTAURANTS:
{data_lines}

YOUR RESPONSIBILITIES:

1. DATA SOURCE:
   - {data_source_instruction}

2. DAILY STRUCTURE AND ACTIVITY SEQUENCING:
   - Build each normal itinerary day around this consistent structure:
     1. Breakfast
     2. One meaningful morning activity or attraction
     3. Lunch
     4. One meaningful afternoon activity or attraction
     5. Dinner or an evening meal/activity
   - Aim for 5 scheduled blocks on a normal full day.
   - Breakfast, lunch, and dinner count as itinerary activity entries and
     should normally use category "food".
   - The morning and afternoon activity blocks should reflect the traveler's
     interests whenever relevant.
   - Do not create a day containing only meals.
   - Do not create a day containing only one attraction plus a meal.
   - Every generated day must contain between 3 and 5 scheduled blocks.
   - Use fewer than 5 blocks only when genuinely justified, such as a long
     transfer, arrival/departure timing, or a traveler instruction requesting
     a relaxed schedule.
   - Arrange all blocks chronologically.
   - Breakfast should normally occur around 7:00 AM - 9:00 AM unless the
     traveler's Additional Notes specify otherwise.
   - Lunch should normally occur around 12:00 PM - 2:00 PM.
   - Dinner should normally occur around 6:00 PM - 8:00 PM unless the
     traveler's Additional Notes specify otherwise.
   - No overlapping times.
   - Leave realistic travel time between locations.
   - Group nearby activities whenever possible.
   - Prefer not to repeat restaurants, cafes, or activities across the trip
     unless the traveler explicitly requests a repeat.

3. SEASON & WEATHER:
   - The trip runs from {preferences.start_date} to {preferences.end_date}.
   - Infer the local season for each destination from these dates.
   - Remember that southern-hemisphere destinations have opposite seasons.
   - Prefer weather-appropriate activities.
   - Use indoor/outdoor information when available.
   - If retrieved data does not contain a suitable weather-appropriate
     option, use a real alternative appropriate for the destination and
     season.

4. TRAVELERS:
   - {traveler_instruction}

5. USE PROVIDED DATA:
   - Use estimated_duration_minutes when available.
   - Respect time_of_day recommendations.
   - Use ratings to prioritize quality attractions and restaurants.
   - Use restaurant price ranges and activity budget levels when available.

6. CATEGORIZE ACTIVITIES:
   - For non-meal activities, use relevant categories and tags.
   - For meals, use category "food".
   - Add 2-3 useful tags per activity.
   - Examples:
     ["Museum", "Art", "Walking"]
     ["Restaurant", "Dinner"]
     ["Cafe", "Breakfast"]

7. COST ESTIMATION:
   - The selected budget represents both the maximum amount the travel group
     should spend and the expected spending level and quality of the trip.
   - Do NOT treat the budget only as an upper limit.
   - Estimate costs for the ENTIRE travel group, including all adults and
     children, not for one traveler.
   - The itinerary should make meaningful use of the available budget.
   - Aim for total estimated itinerary spending across all days to use
     approximately 85-100% of the available budget when realistic.
   - Never exceed the selected total budget.
   - Do not deliberately keep spending far below the budget when appropriate
     higher-quality options are available.

   - Budget behavior:
     * LOW BUDGET:
       Prioritize free attractions, inexpensive activities, affordable
       restaurants, public transportation, and good-value experiences.
       Avoid unnecessary premium experiences.

     * MODERATE BUDGET:
       Balance affordable options with paid attractions, good restaurants,
       tours, and occasional upgraded experiences.

     * HIGH BUDGET:
       Do not default to the cheapest options.
       Prefer premium attractions, highly rated restaurants, upgraded tours,
       unique experiences, and better transportation where appropriate.

     * VERY HIGH / LUXURY NUMERIC BUDGET:
       When the numeric budget is substantially higher than basic trip costs,
       actively use the additional spending capacity to improve the travel
       experience instead of returning an unnecessarily inexpensive itinerary.

   - Include a realistic estimated_cost for every activity and meal.
   - estimated_cost represents the estimated price for the entire traveler
     group for that activity.
   - Return estimated_cost as one best-estimate amount, not a price range.
   - Keep the combined activity estimates within the user's total budget.

   - Keep all price estimates realistic for the destination.

8. LOCATION SPECIFICITY:
   - Use specific neighborhoods when possible:
     "Asakusa, Tokyo" rather than only "Tokyo".
   - Group nearby activities to reduce unnecessary travel.
   - Vary locations throughout the trip.

9. RECOMMENDATIONS:
   - Write 1-2 engaging sentences.
   - Include practical tips or useful timing information.
   - Match the traveler's interests.
   - Keep descriptions concise.

10. TIME FORMAT:
   - Use 12-hour format with AM/PM.
   - Example: "09:30 AM", "06:00 PM".

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
          "estimated_cost": "$25"
        }}
      ]
    }}
  ]
}}

CRITICAL REQUIREMENTS:
- Generate exactly {num_days} days.
- Follow the REQUIRED DAY-BY-DAY DESTINATION PLAN exactly.
- A normal full day should aim for 5 scheduled blocks:
  breakfast, morning activity, lunch, afternoon activity, and dinner/evening.
- Every day must contain between 3 and 5 scheduled blocks.
- Never produce a day containing only 1-2 scheduled activities.
- Meals count as scheduled activity blocks.
- Dates must match the trip dates:
  {preferences.start_date} through {preferences.end_date}.
- Times must be chronological with no overlaps.
- All locations must be real places in the selected destinations:
  {destinations_str}
- Prefer not to repeat restaurants, cafes, or activities across the trip.
- Every activity must include one realistic estimated_cost amount for the full traveler group, not a range.
- The combined activity estimates across the trip must stay within the user's selected total budget.
- The complete itinerary should meaningfully use the available budget rather
  than defaulting to unnecessarily cheap options.
- Return ONLY JSON and nothing else."""


def build_missing_days_prompt(
    preferences: TravelPreferences,
    travel_data: list[TravelDataItem],
    planned_so_far: Itinerary,
    missing_dates: list[str],
) -> str:
    """Ask only for missing or incomplete dates."""

    full_plan = dict(
        _build_destination_day_plan(preferences)
    )

    missing_plan = "\n".join(
        f"- {trip_date}: {full_plan[trip_date]}"
        for trip_date in missing_dates
    )

    missing_dates_str = ", ".join(missing_dates)

    additional_notes_line = (
        f"Additional Notes From Traveler: "
        f"{preferences.additional_notes}"
        if preferences.additional_notes
        else "Additional Notes From Traveler: None"
    )

    return f"""You are completing missing or incomplete days in an existing travel itinerary.

Missing or incomplete dates:
{missing_dates_str}

REQUIRED DESTINATION FOR EACH DATE:
{missing_plan}

{additional_notes_line}

Already planned itinerary:
{planned_so_far.model_dump_json(indent=2)}

Available travel data:
{_format_travel_data(travel_data)}

Rules:
- Return ONLY the dates listed above.
- Return one complete day for every requested date.
- Every returned day must contain between 3 and 5 scheduled blocks.
- Aim for this normal daily structure:
  1. Breakfast
  2. Morning activity
  3. Lunch
  4. Afternoon activity
  5. Dinner/evening
- Breakfast, lunch, and dinner count as activity blocks.
- Use fewer than 5 blocks only when genuinely justified by travel timing,
  arrival/departure timing, or the traveler's instructions.
- Never return a day with only 1-2 scheduled blocks.
- If travel between destinations occurs, travel may count as one block but
  must not replace the complete day.
- Every activity must include one realistic estimated_cost amount for the full traveler group, not a range.
- Prefer not to repeat restaurants, cafes, or activities.
- Follow the required destination for every date exactly.
- Do not redistribute destination days.
- Respect the traveler's Additional Notes.
- Keep activities chronological and geographically realistic.
- Use real places only.
- Return ONLY valid JSON with no extra commentary."""


def _format_travel_data(
    travel_data: list[TravelDataItem],
) -> str:
    """Format travel data for regeneration prompts."""

    data_lines = "\n".join(
        f"- {item.name}: {item.description}"
        + (
            f" (Category: {item.category})"
            if item.category
            else ""
        )
        + (
            f" (Cuisines: {item.cuisines})"
            if item.cuisines
            else ""
        )
        for item in travel_data
    )

    return (
        data_lines
        or "No specific travel data was found for this destination."
    )


def _regenerate_preference_context(preferences: TravelPreferences) -> str:
    """Traveler-preference preamble shared by the regenerate prompts.

    Mirrors the additional-notes / traveler-composition / interest handling
    from build_itinerary_prompt so a regeneration honors the same traveler
    constraints the first pass did. The destination-day plan is deliberately
    left out — it only applies to first-pass multi-day generation.
    """
    travelers_str, traveler_instruction = _describe_travelers(preferences)

    interests_str = (
        ", ".join(preferences.interests)
        if preferences.interests
        else "general sightseeing"
    )

    lines = [
        f"- Travelers: {travelers_str}",
        f"- Interests / Activities Requested: {interests_str}",
    ]

    if preferences.additional_notes:
        lines.append(
            f"- Additional Notes From Traveler: {preferences.additional_notes}"
        )

    lines += [
        "",
        "TRAVELERS:",
        f"- {traveler_instruction}",
        "",
        "INTEREST PRIORITY:",
        "- Every requested interest is a genuine traveler preference, including",
        "  custom interests typed manually by the traveler.",
        "- Keep relevant interests represented in the result; do not silently",
        "  drop them.",
    ]

    if preferences.additional_notes:
        lines += [
            "",
            "ADDITIONAL NOTES PRIORITY:",
            "- Additional Notes From Traveler are direct traveler instructions.",
            "- Treat free-text notes as binding traveler requirements and follow",
            "  them whenever they apply.",
            "- If Additional Notes conflict with another instruction here, the",
            "  traveler's Additional Notes take priority.",
        ]

    return "\n".join(lines)


def build_regenerate_itinerary_prompt(
    existing_itinerary: Itinerary,
    user_query: str,
    travel_data: list[TravelDataItem],
    preferences: TravelPreferences,
) -> str:
    return f"""You are a travel planning assistant. A user already has the itinerary below and wants
it changed. Update the itinerary to satisfy their request.

TRAVELER PREFERENCES (carried over from the original trip — keep honoring them):
{_regenerate_preference_context(preferences)}

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
- Every day in the itinerary must contain between 4 and 5 activities. A day with only 1-3 activities is not accepted, and days must not exceed 5 activities.
- Expand sparse days so the itinerary meets the minimum activity requirement, but do not exceed the 5-activity maximum.
- Maintain a realistic daily structure: breakfast, 1-2 activities, lunch, 1-2 activities, dinner.
- Keep the itinerary within the user's budget. Include a realistic estimated_cost for every
  activity for the full traveler group.
- Use one best-estimate amount for estimated_cost, not a price range.
- Avoid inflated activity estimates. Choose destinations and activities that fit the user's
  selected spending range.
- Prefer not to repeat restaurants, cafes, or activities across the trip.
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
          "estimated_cost": "$25"
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
    preferences: TravelPreferences,
) -> str:
    day_index = day_number - 1

    target_day = (
        existing_itinerary.days[day_index]
        if 0 <= day_index < len(existing_itinerary.days)
        else None
    )

    target_day_json = (
        target_day.model_dump_json(indent=2)
        if target_day
        else "null"
    )

    return f"""You are a travel planning assistant. A user has a multi-day itinerary and wants ONLY
day {day_number} changed. Every other day must stay exactly as it is.

TRAVELER PREFERENCES (carried over from the original trip — keep honoring them):
{_regenerate_preference_context(preferences)}

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
- This day must contain between 4 and 5 activities. A day with only 1-3 activities is not accepted, and it must not exceed 5 activities.
- If the current day is too sparse, expand it with realistic meals/attractions/experiences until it reaches 4-5 activities, but do not exceed 5.
- Maintain a realistic day structure: breakfast, 1-2 activities, lunch, 1-2 activities, dinner.
- Include a realistic estimated_cost for every activity for the full traveler group, and keep
  the combined estimates appropriate for the user's total trip budget.
- Use one best-estimate amount for estimated_cost, not a price range.
- Avoid duplicating activities/locations already used on other days unless the user asked for that.
- Prefer not to repeat restaurants, cafes, or activities across the trip.
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
      "estimated_cost": "$25"
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
    preferences: TravelPreferences,
) -> str:
    day_index = day_number - 1

    target_day = (
        existing_itinerary.days[day_index]
        if 0 <= day_index < len(existing_itinerary.days)
        else None
    )

    target_day_json = (
        target_day.model_dump_json(indent=2)
        if target_day
        else "null"
    )

    target_activity = (
        target_day.activities[activity_index]
        if target_day
        and 0 <= activity_index < len(target_day.activities)
        else None
    )

    target_activity_json = (
        target_activity.model_dump_json(indent=2)
        if target_activity
        else "null"
    )

    return f"""You are a travel planning assistant. A user has a multi-day itinerary and wants ONLY
a single activity changed. Every other activity, on this day and on every other day, must stay
exactly as it is.

TRAVELER PREFERENCES (carried over from the original trip — keep honoring them):
{_regenerate_preference_context(preferences)}

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
- Include a realistic estimated_cost for the full traveler group.
- Use one best-estimate amount for estimated_cost, not a price range.

Return ONLY the replacement activity as JSON matching this exact structure:
{{
  "time": "HH:MM AM/PM",
  "duration_minutes": 60,
  "activity": "string",
  "category": "culture/food/shopping/adventure/nightlife/nature",
  "tags": ["tag1", "tag2"],
  "location": "string",
  "recommendation": "string",
  "estimated_cost": "$25"
}}

Only return valid JSON, no extra commentary."""
