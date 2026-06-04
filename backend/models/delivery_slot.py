from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Time, Boolean, DateTime, ForeignKey, Date, UniqueConstraint
from sqlalchemy.orm import relationship
from config.database import Base


class DeliverySlot(Base):
    __tablename__ = "delivery_slots"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    max_capacity = Column(Integer, default=10, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    bookings = relationship("DeliverySlotBooking", back_populates="slot", cascade="all, delete-orphan")


class DeliverySlotBooking(Base):
    __tablename__ = "delivery_slot_bookings"

    id = Column(Integer, primary_key=True, index=True)
    slot_id = Column(Integer, ForeignKey("delivery_slots.id", ondelete="CASCADE"), nullable=False, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, unique=True)
    delivery_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    slot = relationship("DeliverySlot", back_populates="bookings")
    order = relationship("Order", back_populates="delivery_booking")

    __table_args__ = (
        UniqueConstraint("slot_id", "delivery_date", "order_id", name="uq_slot_date_order"),
    )
