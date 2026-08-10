from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.db import Base

if TYPE_CHECKING:
    from app.models.trip import Trip

class TripPreference(Base):
    __tablename__ = "trip_preferences"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    trip_id: Mapped[int] = mapped_column(
        ForeignKey("trips.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    travel_style: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    budget_level: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    food_preference: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    accommodation_type: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    transportation_preference: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    trips: Mapped[list["Trip"]] = relationship(
      "Trip",
      back_populates="user",
      cascade="all, delete-orphan",
  )