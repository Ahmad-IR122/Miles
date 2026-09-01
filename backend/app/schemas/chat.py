import uuid

from pydantic import BaseModel, Field


class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    conversation_id: uuid.UUID | None = None
    trip_id: int | None = None


class ChatMessageResponse(BaseModel):
    reply: str
    conversation_id: uuid.UUID