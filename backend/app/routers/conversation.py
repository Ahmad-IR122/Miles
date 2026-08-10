import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.db import get_db
from app.schemas.conversation import (
    ConversationResponse,
    MessageCreate,
    MessageResponse,
)
from app.services import conversation_service

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.post("", response_model=ConversationResponse, status_code=201)
def create_conversation(db: Session = Depends(get_db)):
    return conversation_service.create_conversation(db)


@router.get("", response_model=list[ConversationResponse])
def list_conversations(db: Session = Depends(get_db)):
    return conversation_service.list_conversations(db)


@router.get("/{conversation_id}", response_model=ConversationResponse)
def get_conversation(conversation_id: uuid.UUID, db: Session = Depends(get_db)):
    conversation = conversation_service.get_conversation(db, conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.post(
    "/{conversation_id}/messages", response_model=MessageResponse, status_code=201
)
def add_message(
    conversation_id: uuid.UUID,
    message: MessageCreate,
    db: Session = Depends(get_db),
):
    new_message = conversation_service.add_message(db, conversation_id, message)
    if new_message is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return new_message


@router.delete("/{conversation_id}", status_code=204)
def delete_conversation(conversation_id: uuid.UUID, db: Session = Depends(get_db)):
    deleted = conversation_service.delete_conversation(db, conversation_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Conversation not found")