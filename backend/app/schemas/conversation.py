import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class MessageCreate(BaseModel):
    role: str = Field(..., min_length=1, max_length=20)
    content: str = Field(..., min_length=1)


class MessageResponse(BaseModel):
    id: uuid.UUID
    role: str
    content: str
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