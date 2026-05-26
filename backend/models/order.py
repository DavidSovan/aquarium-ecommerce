from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from config.database import Base
import uuid


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, nullable=False, index=True)
    user_id = Column(String(36), nullable=False, index=True)
    order_status = Column(String(50), default="pending", nullable=False)
    payment_status = Column(String(50), default="pending", nullable=False)
    subtotal = Column(Float, default=0, nullable=False)
    shipping = Column(Float, default=0, nullable=False)
    discount = Column(Float, default=0, nullable=False)
    coupon_code = Column(String(50), nullable=True)
    coupon_discount = Column(Float, default=0, nullable=False)
    total = Column(Float, default=0, nullable=False)
    shipping_address_id = Column(Integer, ForeignKey("addresses.id"), nullable=True)
    billing_address_id = Column(Integer, ForeignKey("addresses.id"), nullable=True)
    is_new = Column(Integer, default=1, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    shipping_address = relationship("Address", foreign_keys=[shipping_address_id])
    billing_address = relationship("Address", foreign_keys=[billing_address_id])

    __table_args__ = (
        Index("idx_orders_user_id", "user_id"),
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    product_name = Column(String(255), nullable=False)
    product_sku = Column(String(100), nullable=True)
    quantity = Column(Integer, default=1, nullable=False)
    unit_price = Column(Float, default=0, nullable=False)
    total_price = Column(Float, default=0, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")

    __table_args__ = (
        Index("idx_order_items_order_id", "order_id"),
    )
