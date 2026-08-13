import logging

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from svix.webhooks import Webhook, WebhookVerificationError

from app.core.config import settings
from app.db.db import get_db
from app.services import user_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/clerk")
async def clerk_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    headers = dict(request.headers)

    wh = Webhook(settings.CLERK_WEBHOOK_SECRET)
    try:
        event = wh.verify(payload, headers)
    except WebhookVerificationError as error:
        raise HTTPException(
            status_code=400, detail="Invalid webhook signature"
        ) from error

    event_type = event.get("type")

    if event_type == "user.created":
        _handle_user_created(db, event["data"])
    else:
        logger.info("Ignoring unhandled Clerk webhook event: %s", event_type)

    return {"status": "ok"}


def _handle_user_created(db: Session, data: dict) -> None:
    auth_provider_id = data.get("id")

    existing = user_service.get_user_by_auth_provider_id(db, auth_provider_id)
    if existing:
        logger.info(
            "User %s already exists, skipping duplicate webhook", auth_provider_id
        )
        return

    user = user_service.create_user_from_clerk(db, data)
    logger.info("Created local user %s for Clerk user %s", user.id, auth_provider_id)