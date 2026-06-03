from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Index
from config.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    role = Column(String(20), nullable=False, default="customer")
    is_active = Column(Boolean, default=True)
    telegram_chat_id = Column(String(50), nullable=True)
    telegram_link_token = Column(String(100), nullable=True, index=True)
    telegram_link_token_expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc), nullable=False)
