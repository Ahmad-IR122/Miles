from sqlalchemy.orm import Session

from app.models.user_models import User


def get_user_by_auth_provider_id(db: Session, auth_provider_id: str) -> User | None:
    return db.query(User).filter(User.auth_provider_id == auth_provider_id).first()


def create_user_from_clerk(db: Session, data: dict) -> User:
    email_addresses = data.get("email_addresses") or []
    primary_email_id = data.get("primary_email_address_id")

    email = None
    for entry in email_addresses:
        if entry.get("id") == primary_email_id:
            email = entry.get("email_address")
            break
    if email is None and email_addresses:
        email = email_addresses[0].get("email_address")

    user = User(
        first_name=data.get("first_name") or "",
        last_name=data.get("last_name") or "",
        email=email,
        auth_provider_id=data.get("id"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user