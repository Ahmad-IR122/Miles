from fastapi import APIRouter

from app.models.chat import ChatMessageRequest
from app.services.chat_service import get_milo_reply

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/message")
def chat_message(request: ChatMessageRequest):
    reply = get_milo_reply(request.message, request.history, request.user_context)
    return {"reply": reply}

