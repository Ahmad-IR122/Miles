from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Date, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.db import Base

if TYPE_CHECKING:
    from app.models.itinerary import Itinerary


class ItineraryDay(Base):
    __tablename__ = "itinerary_days"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    itinerary_id: Mapped[int] = mapped_column(
        ForeignKey("itineraries.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    day_number: Mapped[int] = mapped_column(
        nullable=False,
    )

    date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    title: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    summary: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    itinerary: Mapped["Itinerary"] = relationship(
        back_populates="days",
    )