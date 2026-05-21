from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Index, Enum
from sqlalchemy.orm import relationship
from config.database import Base
import enum


class AdjustmentType(str, enum.Enum):
    INCREASE = "increase"
    DECREASE = "decrease"
    CORRECTION = "correction"
    INITIAL = "initial"


class InventoryLog(Base):
    __tablename__ = "inventory_logs"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    adjustment_type = Column(String(50), nullable=False)
    quantity_change = Column(Integer, nullable=False)
    quantity_before = Column(Integer, nullable=False)
    quantity_after = Column(Integer, nullable=False)
    reason = Column(Text, nullable=True)
    adjusted_by = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    product = relationship("Product")

    __table_args__ = (
        Index("idx_inventory_logs_product_id", "product_id"),
        Index("idx_inventory_logs_created_at", "created_at"),
    )
