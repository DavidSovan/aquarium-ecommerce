from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Index, Float
from config.database import Base


class Address(Base):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(36), nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    country = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    district = Column(String(100), nullable=True)
    address_line = Column(Text, nullable=False)
    postal_code = Column(String(20), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_default = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        Index("idx_addresses_user_id", "user_id"),
    )
