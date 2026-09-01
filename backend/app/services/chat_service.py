import uuid

from sqlalchemy.orm import Session

from app.models import (
    Activity,
    Interest,
    Itinerary,
    ItineraryDay,
    Trip,
    TripInterest,
    TripPreference,
    User,
)
from app.schemas import MessageCreate
from app.services.ai_client import post
from app.services.conversation_service import (
    add_message,
    create_conversation,
    get_conversation,
)


def get_active_trip_detail(db: Session, trip_id: int, user_id: int) -> dict:
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user_id).one()

    days = (
        db.query(ItineraryDay)
        .join(Itinerary, Itinerary.id == ItineraryDay.itinerary_id)
        .filter(Itinerary.trip_id == trip_id)
        .order_by(ItineraryDay.day_number)
        .all()
    )
    day_details = []
    for d in days:
        activities = (
            db.query(Activity)
            .filter(Activity.itinerary_day_id == d.id)
            .order_by(Activity.activity_order)
            .all()
        )
        day_details.append({
            "day_number": d.day_number,
            "title": d.title,
            "activities": [
                {
                    "name": a.name,
                    "time": a.start_time.strftime("%H:%M") if a.start_time else None,
                }
                for a in activities
            ],
        })

    interests = (
        db.query(Interest.name)
        .join(TripInterest, TripInterest.interest_id == Interest.id)
        .filter(TripInterest.trip_id == trip_id)
        .all()
    )

    preferences = (
        db.query(TripPreference)
        .filter(TripPreference.trip_id == trip_id)
        .one_or_none()
    )

    return {
        "destinations": trip.destinations,
        "dates": f"{trip.start_date}–{trip.end_date}",
        "status": trip.trip_status,
        "budget": f"{trip.budget} {trip.currency}" if trip.budget else None,
        "travelers_count": trip.travelers_count,
        "interests": [i.name for i in interests],
        "preferences": {
            "travel_style": preferences.travel_style,
            "budget_level": preferences.budget_level,
            "food_preference": preferences.food_preference,
            "accommodation_type": preferences.accommodation_type,
            "transportation_pref": preferences.transportation_pref,
        } if preferences else None,
        "days": day_details,
    }


def build_user_context(db: Session, user_id: int, trip_id: int | None = None) -> dict:
    user = db.query(User).filter(User.id == user_id).one()
    trips = db.query(Trip).filter(Trip.user_id == user_id).all()

    context = {
        "name": f"{user.first_name} {user.last_name}",
        "trips": [
            {
                "destinations": t.destinations,
                "dates": f"{t.start_date}–{t.end_date}",
                "status": t.trip_status,
                "budget": f"{t.budget} {t.currency}" if t.budget else None,
                "travelers_count": t.travelers_count,
            }
            for t in trips
        ],
    }
    if trip_id:
        context["active_trip"] = get_active_trip_detail(db, trip_id, user_id)
    return context


def get_milo_reply(
    db: Session,
    user_id: int,
    message: str,
    conversation_id: uuid.UUID | None = None,
    trip_id: int | None = None,
) -> dict:
    conversation = (
        get_conversation(db, conversation_id, user_id) if conversation_id else None
    )
    if conversation is None:
        conversation = create_conversation(db, user_id)

    recent = conversation.messages[-3:]
    history = [{"user_query": m.user_query, "answer": m.answer} for m in recent]
    user_context = build_user_context(db, user_id, trip_id)

    raw = post(
        "/chat/message",
        {
            "message": message,
            "history": history,
            "user_context": user_context,
        },
    )
    reply = raw["reply"]

    add_message(
        db,
        conversation.id,
        user_id,
        MessageCreate(user_query=message, answer=reply),
    )
    return {"reply": reply, "conversation_id": conversation.id}