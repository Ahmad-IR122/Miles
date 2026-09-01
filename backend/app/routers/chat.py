from fastapi import APIRouter, Depends, HTTPException
from httpx import HTTPError
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db import get_db
from app.models import User
from app.schemas.chat import ChatMessageRequest, ChatMessageResponse
from app.services.chat_service import get_milo_reply

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/message", response_model=ChatMessageResponse)
def chat_message(
    request: ChatMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ChatMessageResponse:
    try:
        result = get_milo_reply(
            db=db,
            user_id=current_user.id,
            message=request.message,
            conversation_id=request.conversation_id,
            trip_id=request.trip_id,
        )
    except HTTPError:
        raise HTTPException(
            status_code=502, detail="Chat assistant is currently unavailable."
        )
    return ChatMessageResponse(
    reply=result["reply"],
    conversation_id=result["conversation_id"],
)