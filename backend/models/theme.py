from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, JSON
from config.database import Base


class ThemeSettings(Base):
    __tablename__ = "theme_settings"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), default="Default Theme", nullable=False)
    is_active = Column(Boolean, default=False, nullable=False)
    is_dark_mode = Column(Boolean, default=False, nullable=False)

    primary_color = Column(String(7), default="#2563eb", nullable=False)
    secondary_color = Column(String(7), default="#4f46e5", nullable=False)
    accent_color = Column(String(7), default="#38bdf8", nullable=False)
    background_color = Column(String(7), default="#f9fafb", nullable=False)
    surface_color = Column(String(7), default="#ffffff", nullable=False)
    header_color = Column(String(7), default="#0c1445", nullable=False)
    footer_color = Column(String(7), default="#0c1445", nullable=False)
    text_primary_color = Column(String(7), default="#111827", nullable=False)
    text_secondary_color = Column(String(7), default="#6b7280", nullable=False)
    button_bg_color = Column(String(7), default="#2563eb", nullable=False)
    button_text_color = Column(String(7), default="#ffffff", nullable=False)
    success_color = Column(String(7), default="#10b981", nullable=False)
    warning_color = Column(String(7), default="#f59e0b", nullable=False)
    error_color = Column(String(7), default="#ef4444", nullable=False)
    border_color = Column(String(7), default="#e5e7eb", nullable=False)

    font_family = Column(String(255), default="Inter, system-ui, sans-serif", nullable=False)
    heading_font_size = Column(String(20), default="2.5rem", nullable=False)
    body_font_size = Column(String(20), default="1rem", nullable=False)
    font_weight = Column(String(10), default="400", nullable=False)
    line_height = Column(String(10), default="1.6", nullable=False)

    container_width = Column(String(20), default="1280px", nullable=False)
    grid_columns = Column(Integer, default=4, nullable=False)
    card_style = Column(String(50), default="rounded-xl", nullable=False)
    border_radius = Column(String(20), default="0.75rem", nullable=False)
    box_shadow = Column(String(100), default="0 1px 3px rgba(0,0,0,0.1)", nullable=False)
    section_spacing = Column(String(20), default="4rem", nullable=False)
    header_height = Column(String(20), default="4rem", nullable=False)
    footer_height = Column(String(20), default="auto", nullable=False)

    button_border_radius = Column(String(20), default="0.5rem", nullable=False)
    button_padding = Column(String(20), default="0.75rem 1.5rem", nullable=False)
    button_hover_color = Column(String(7), default="#1d4ed8", nullable=False)
    button_hover_animation = Column(String(50), default="scale", nullable=False)
    button_shadow = Column(String(100), default="0 4px 6px rgba(0,0,0,0.1)", nullable=False)

    preview_image = Column(String(500), nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc), nullable=False)
