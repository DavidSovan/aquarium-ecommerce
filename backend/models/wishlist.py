from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import relationship
from config.database import Base


class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    items = relationship("WishlistItem", back_populates="wishlist", cascade="all, delete-orphan", order_by="WishlistItem.id")


class WishlistItem(Base):
    __tablename__ = "wishlist_items"

    id = Column(Integer, primary_key=True, index=True)
    wishlist_id = Column(String(36), ForeignKey("wishlists.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    added_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    wishlist = relationship("Wishlist", back_populates="items")
    product = relationship("Product", lazy="joined")

    __table_args__ = (
        Index("idx_wishlist_items_wishlist_id", "wishlist_id"),
        Index("idx_wishlist_items_product_id", "product_id"),
        UniqueConstraint("wishlist_id", "product_id", name="uq_wishlist_product"),
    )
