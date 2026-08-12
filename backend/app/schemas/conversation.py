import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class MessageCreate(BaseModel):
    user_query: str = Field(..., min_length=1)
    answer: str = Field(..., min_length=1)


class MessageResponse(BaseModel):
    id: uuid.UUID
    user_query: str
    answer: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationCreate(BaseModel):
    pass


class ConversationResponse(BaseModel):
    id: uuid.UUID
    created_at: datetime
    messages: list[MessageResponse] = []

    model_config = {"from_attributes": True}


class ConversationUpdate(BaseModel):
    pass
