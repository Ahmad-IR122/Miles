from sqlalchemy.orm import Session

from app.models import User


def get_user_by_auth_provider_id(db: Session, auth_provider_id: str) -> User | None:
    return db.query(User).filter(User.auth_provider_id == auth_provider_id).first()

def extract_primary_email(data: dict) -> str | None:
    email_addresses = data.get("email_addresses") or []
    primary_email_id = data.get("primary_email_address_id")

    for entry in email_addresses:
        if entry.get("id") == primary_email_id:
            return entry.get("email_address")
    if email_addresses:
        return email_addresses[0].get("email_address")
    return None

def create_user_from_clerk(db: Session, data: dict) -> User:
    user = User(
        first_name=data.get("first_name") or "",
        last_name=data.get("last_name") or "",
        email=extract_primary_email(data),
        auth_provider_id=data.get("id"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def update_user_from_clerk(db: Session, user: User, data: dict) -> User:
    email = extract_primary_email(data)

    user.first_name = data.get("first_name") or ""
    user.last_name = data.get("last_name") or ""
    if email is not None:
        user.email = email

    db.commit()
    db.refresh(user)
    return user

def delete_user_by_auth_provider_id(db: Session, auth_provider_id: str) -> bool:
    user = get_user_by_auth_provider_id(db, auth_provider_id)
    if user is None:
        return False

    db.delete(user)
    db.commit()
    return True