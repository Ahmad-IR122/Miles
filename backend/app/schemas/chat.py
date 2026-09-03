import uuid

from pydantic import BaseModel, Field


class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    conversation_id: uuid.UUID | None = None
    trip_id: int | None = None
    
    history: list["ChatHistoryTurn"] | None = Field(default=None, max_length=6)


class ChatHistoryTurn(BaseModel):
    user_query: str = Field(..., max_length=1000)
    answer: str = Field(..., max_length=4000)


class ChatMessageResponse(BaseModel):
    reply: str
    conversation_id: uuid.UUID