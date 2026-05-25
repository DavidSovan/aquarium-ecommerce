from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime
from config.database import Base


class BrandingSettings(Base):
    __tablename__ = "branding_settings"

    id = Column(Integer, primary_key=True, index=True)
    store_name = Column(String(255), default="Aquarium Store", nullable=False)
    store_logo = Column(String(500), nullable=True)
    favicon = Column(String(500), nullable=True)
    footer_logo = Column(String(500), nullable=True)
    copyright_text = Column(String(500), default="All rights reserved.", nullable=False)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    contact_address = Column(Text, nullable=True)
    social_facebook = Column(String(500), nullable=True)
    social_twitter = Column(String(500), nullable=True)
    social_instagram = Column(String(500), nullable=True)
    social_youtube = Column(String(500), nullable=True)
    social_linkedin = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc), nullable=False)
