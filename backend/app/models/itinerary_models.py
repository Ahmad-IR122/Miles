from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.db import Base

if TYPE_CHECKING:
    from app.models.itinerary_day import itinerary_day
    from app.models.trip import Trip


class Itinerary(Base):
    __tablename__ = "itineraries"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    trip_id: Mapped[int] = mapped_column(
        ForeignKey("trips.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    version: Mapped[int] = mapped_column(
        default=1,
        nullable=False,
    )

    generated_by: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
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

    trip: Mapped["Trip"] = relationship(
        back_populates="itineraries",
    )

    days: Mapped[list["itinerary_day"]] = relationship(
        back_populates="itinerary",
        cascade="all, delete-orphan",
    )
