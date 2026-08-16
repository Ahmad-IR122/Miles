from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.db import get_db
from app.schemas.activity import (
    ActivityCreate,
    ActivityResponse,
    ActivityUpdate,
)
from app.services import activity_service

router = APIRouter(prefix="/activities", tags=["activities"])


@router.post(
    "/itinerary-days/{itinerary_day_id}",
    response_model=ActivityResponse,
    status_code=201,
)
def create_activity(
    itinerary_day_id: int,
    activity: ActivityCreate,
    db: Session = Depends(get_db),
):
    return activity_service.create_activity(
        db,
        itinerary_day_id,
        activity,
    )


@router.get(
    "/itinerary-days/{itinerary_day_id}",
    response_model=list[ActivityResponse],
)
def list_activities(
    itinerary_day_id: int,
    db: Session = Depends(get_db),
):
    return activity_service.list_activities(
        db,
        itinerary_day_id,
    )


@router.get(
    "/{activity_id}",
    response_model=ActivityResponse,
)
def get_activity(
    activity_id: int,
    db: Session = Depends(get_db),
):
    activity = activity_service.get_activity(
        db,
        activity_id,
    )

    if activity is None:
        raise HTTPException(
            status_code=404,
            detail="Activity not found",
        )

    return activity


@router.patch(
    "/{activity_id}",
    response_model=ActivityResponse,
)
def update_activity(
    activity_id: int,
    activity: ActivityUpdate,
    db: Session = Depends(get_db),
):
    updated_activity = activity_service.update_activity(
        db,
        activity_id,
        activity,
    )

    if updated_activity is None:
        raise HTTPException(
            status_code=404,
            detail="Activity not found",
        )

    return updated_activity


@router.delete(
    "/{activity_id}",
    status_code=204,
)
def delete_activity(
    activity_id: int,
    db: Session = Depends(get_db),
):
    deleted = activity_service.delete_activity(
        db,
        activity_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Activity not found",
        )
