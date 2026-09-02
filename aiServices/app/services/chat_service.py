from app.clients import get_client
from app.config import settings
from app.prompts.milo_prompt import build_milo_prompt


def get_milo_reply(message: str, history: list[dict], user_context: dict) -> str:
    prompt = build_milo_prompt(message, history, user_context)
    client = get_client()
    response = client.responses.create(
        model=settings.AZURE_OPENAI_DEPLOYMENT,
        input=prompt,
    )
    return response.output_text