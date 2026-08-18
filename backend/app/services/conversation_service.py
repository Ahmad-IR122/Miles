import uuid

from sqlalchemy.orm import Session

from app.models import Conversation, Message
from app.schemas import MessageCreate


def create_conversation(db: Session) -> Conversation:
    conversation = Conversation()
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


def list_conversations(db: Session) -> list[Conversation]:
    return db.query(Conversation).order_by(Conversation.created_at.desc()).all()


def get_conversation(db: Session, conversation_id: uuid.UUID) -> Conversation | None:
    return db.get(Conversation, conversation_id)


def add_message(
    db: Session, conversation_id: uuid.UUID, message: MessageCreate
) -> Message | None:
    conversation = db.get(Conversation, conversation_id)
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


def delete_conversation(db: Session, conversation_id: uuid.UUID) -> bool:
    conversation = db.get(Conversation, conversation_id)
    if conversation is None:
        return False

    db.delete(conversation)
    db.commit()
    return True
