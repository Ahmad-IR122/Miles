from datetime import date as DateType
from typing import TYPE_CHECKING

from sqlalchemy import Date, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

if TYPE_CHECKING: 
    from app.models.activity_models import Activity
    from app.models.itinerary_models import Itinerary
 
 
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
 
    date: Mapped[DateType] = mapped_column( 
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
 
    activities: Mapped[list["Activity"]] = relationship( 
        back_populates="itinerary_day", 
        cascade="all, delete-orphan", 
    )
