from sqlalchemy.orm import Session

from app.models.interest_models import Interest
from app.schemas.interest import InterestCreate, InterestUpdate


def create_interest(
    db: Session,
    interest: InterestCreate,
) -> Interest:
    db_interest = Interest(
        name=interest.name,
    )
    db.add(db_interest)
    db.commit()
    db.refresh(db_interest)
    return db_interest


def get_interest(
    db: Session,
    interest_id: int,
) -> Interest | None:
    return db.query(Interest).filter(Interest.id == interest_id).first()


def list_interests(
    db: Session,
) -> list[Interest]:
    return db.query(Interest).all()


def update_interest(
    db: Session,
    interest_id: int,
    interest: InterestUpdate,
) -> Interest | None:
    db_interest = get_interest(db, interest_id)
    if db_interest is None:
        return None

    if interest.name is not None:
        db_interest.name = interest.name

    db.commit()
    db.refresh(db_interest)
    return db_interest


def delete_interest(
    db: Session,
    interest_id: int,
) -> bool:
    db_interest = get_interest(db, interest_id)
    if db_interest is None:
        return False

    db.delete(db_interest)
    db.commit()
    return True