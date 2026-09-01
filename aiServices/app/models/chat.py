from pydantic import BaseModel, Field


class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    history: list[dict] = Field(default_factory=list)
    user_context: dict = Field(default_factory=dict)


class ChatMessageResponse(BaseModel):
    reply: str