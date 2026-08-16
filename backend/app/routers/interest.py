from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.db import get_db
from app.schemas.interest import (
    InterestCreate,
    InterestResponse,
    InterestUpdate,
)
from app.services import interest_service

router = APIRouter(prefix="/interests", tags=["interests"])


@router.post(
    "",
    response_model=InterestResponse,
    status_code=201,
)
def create_interest(
    interest: InterestCreate,
    db: Session = Depends(get_db),
):
    return interest_service.create_interest(
        db,
        interest,
    )


@router.get(
    "",
    response_model=list[InterestResponse],
)
def list_interests(
    db: Session = Depends(get_db),
):
    return interest_service.list_interests(db)


@router.get(
    "/{interest_id}",
    response_model=InterestResponse,
)
def get_interest(
    interest_id: int,
    db: Session = Depends(get_db),
):
    interest = interest_service.get_interest(
        db,
        interest_id,
    )

    if interest is None:
        raise HTTPException(
            status_code=404,
            detail="Interest not found",
        )

    return interest


@router.patch(
    "/{interest_id}",
    response_model=InterestResponse,
)
def update_interest(
    interest_id: int,
    interest: InterestUpdate,
    db: Session = Depends(get_db),
):
    updated_interest = interest_service.update_interest(
        db,
        interest_id,
        interest,
    )

    if updated_interest is None:
        raise HTTPException(
            status_code=404,
            detail="Interest not found",
        )

    return updated_interest


@router.delete(
    "/{interest_id}",
    status_code=204,
)
def delete_interest(
    interest_id: int,
    db: Session = Depends(get_db),
):
    deleted = interest_service.delete_interest(
        db,
        interest_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Interest not found",
        )