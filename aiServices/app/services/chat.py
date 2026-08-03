from app.clients.azure_openai import get_client
from app.config.config import settings


client = get_client()


def ask(prompt: str) -> str:
    response = client.responses.create(
        model=settings.AZURE_OPENAI_DEPLOYMENT,
        input=prompt,
    )
    return response.output_text
