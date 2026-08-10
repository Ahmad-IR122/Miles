from app.models.travel import TravelPreferences, TravelDataItem


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