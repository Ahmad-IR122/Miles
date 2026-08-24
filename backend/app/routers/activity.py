from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db import get_db
from app.models import User
from app.schemas import (
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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    created = activity_service.create_activity(
        db,
        itinerary_day_id,
        current_user.id,
        activity,
    )

    if created is None:
        raise HTTPException(
            status_code=404,
            detail=f"itinerary day {itinerary_day_id} not found",
        )

    return created


@router.get(
    "/itinerary-days/{itinerary_day_id}",
    response_model=list[ActivityResponse],
)
def list_activities(
    itinerary_day_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    activities = activity_service.list_activities(
        db,
        itinerary_day_id,
        current_user.id,
    )

    if activities is None:
        raise HTTPException(
            status_code=404,
            detail=f"itinerary day {itinerary_day_id} not found",
        )

    return activities


@router.get(
    "/{activity_id}",
    response_model=ActivityResponse,
)
def get_activity(
    activity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    activity = activity_service.get_activity(
        db,
        activity_id,
        current_user.id,
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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    updated_activity = activity_service.update_activity(
        db,
        activity_id,
        current_user.id,
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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deleted = activity_service.delete_activity(
        db,
        activity_id,
        current_user.id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Activity not found",
        )
