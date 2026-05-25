from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, JSON
from config.database import Base


class HomepageSection(Base):
    __tablename__ = "homepage_sections"

    id = Column(Integer, primary_key=True, index=True)
    section_type = Column(String(50), nullable=False, index=True)
    sort_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    hero_title = Column(String(500), nullable=True)
    hero_subtitle = Column(Text, nullable=True)
    hero_cta_text = Column(String(255), nullable=True)
    hero_cta_url = Column(String(500), nullable=True)
    hero_bg_image = Column(String(500), nullable=True)
    hero_bg_video_url = Column(String(500), nullable=True)
    hero_overlay_color = Column(String(7), default="#0c1445", nullable=True)
    hero_overlay_opacity = Column(Float, default=0.6, nullable=True)
    hero_text_color = Column(String(7), default="#ffffff", nullable=True)
    hero_badge_text = Column(String(255), nullable=True)

    bg_type = Column(String(50), default="color", nullable=True)
    bg_color = Column(String(7), nullable=True)
    bg_image = Column(String(500), nullable=True)
    bg_video_url = Column(String(500), nullable=True)

    content = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc), nullable=False)
