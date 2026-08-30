from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import JSON, Date, DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.models.conversation_models import Conversation

if TYPE_CHECKING:
    from app.models.conversation_models import Conversation
    from app.models.itinerary_models import Itinerary
    from app.models.trip_preference_models import TripPreference
    from app.models.user_models import User


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    destinations: Mapped[list[dict]] = mapped_column(
        JSON,
        nullable=False,
    )

    start_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    end_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    budget: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )

    currency: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        default="USD",
    )

    travelers_count: Mapped[int] = mapped_column(
        nullable=False,
        default=1,
    )

    trip_status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="planning",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="trips",
    )

    preferences: Mapped[list["TripPreference"]] = relationship(
        "TripPreference",
        back_populates="trip",
        cascade="all, delete-orphan",
    )

    conversations: Mapped[list["Conversation"]] = relationship(
        back_populates="trip",
        cascade="all, delete-orphan",
    )
    itineraries: Mapped[list["Itinerary"]] = relationship(
        back_populates="trip",
        cascade="all, delete-orphan",
    )
