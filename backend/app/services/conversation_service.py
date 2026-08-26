import uuid

from sqlalchemy.orm import Session

from app.models import Conversation, Message
from app.schemas import MessageCreate


def create_conversation(db: Session, user_id: int) -> Conversation:
    conversation = Conversation(user_id=user_id)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


def list_conversations(db: Session, user_id: int) -> list[Conversation]:
    return (
        db.query(Conversation)
        .filter(Conversation.user_id == user_id)
        .order_by(Conversation.created_at.desc())
        .all()
    )


def get_conversation(
    db: Session, conversation_id: uuid.UUID, user_id: int
) -> Conversation | None:
    return (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.user_id == user_id)
        .one_or_none()
    )


def add_message(
    db: Session, conversation_id: uuid.UUID, user_id: int, message: MessageCreate
) -> Message | None:
    conversation = get_conversation(db, conversation_id, user_id)
    if conversation is None:
        return None

    new_message = Message(
        conversation_id=conversation_id,
        user_query=message.user_query,
        answer=message.answer,
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return new_message


def delete_conversation(db: Session, conversation_id: uuid.UUID, user_id: int) -> bool:
    conversation = get_conversation(db, conversation_id, user_id)
    if conversation is None:
        return False

    db.delete(conversation)
    db.commit()
    return True
