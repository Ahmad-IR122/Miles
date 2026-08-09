from app.models.travel import TravelPreferences, TravelDataItem


def build_itinerary_prompt(preferences: TravelPreferences, travel_data: list[TravelDataItem]) -> str:
    data_lines = "\n".join(
        f"- {item.name} ({item.type}): {item.description}"
        for item in travel_data
    )
    if not data_lines:
        data_lines = "No specific travel data was found for this destination."

    return f"""You are a travel planning assistant. Create a day-by-day itinerary based on the following.

User preferences:
- Destination: {preferences.destination}
- Dates: {preferences.start_date} to {preferences.end_date}
- Interests: {", ".join(preferences.interests)}
- Budget: {preferences.budget}

Available travel data:
{data_lines}

Return the itinerary as JSON matching this exact structure:
{{
  "days": [
    {{
      "date": "YYYY-MM-DD",
      "activities": [
        {{
          "time": "HH:MM",
          "duration_minutes": 60,
          "activity": "string",
          "location": "string",
          "recommendation": "string"
        }}
      ]
    }}
  ]
}}

Only return valid JSON, no extra commentary."""
