from app.clients.azure_openai import get_client
from app.config.config import settings
from app.models.travel import TravelPreferences, TravelDataItem, Itinerary
from app.prompts.itinerary_prompt import build_itinerary_prompt

client = get_client()

from pydantic import ValidationError

def generate_itinerary(preferences: TravelPreferences, travel_data: list[TravelDataItem]) -> Itinerary:
    prompt = build_itinerary_prompt(preferences, travel_data)

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

    try:
        return Itinerary.model_validate_json(output_text)
    except ValidationError as e:
        raise ValueError(f"LLM returned an itinerary that didn't match the expected format: {e}")
