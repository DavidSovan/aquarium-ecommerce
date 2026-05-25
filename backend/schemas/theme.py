from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ThemeSettingsBase(BaseModel):
    name: str = "Default Theme"
    is_active: bool = False
    is_dark_mode: bool = False
    preview_image: Optional[str] = None
    primary_color: str = "#2563eb"
    secondary_color: str = "#4f46e5"
    accent_color: str = "#38bdf8"
    background_color: str = "#f9fafb"
    surface_color: str = "#ffffff"
    header_color: str = "#0c1445"
    footer_color: str = "#0c1445"
    text_primary_color: str = "#111827"
    text_secondary_color: str = "#6b7280"
    button_bg_color: str = "#2563eb"
    button_text_color: str = "#ffffff"
    success_color: str = "#10b981"
    warning_color: str = "#f59e0b"
    error_color: str = "#ef4444"
    border_color: str = "#e5e7eb"
    font_family: str = "Inter, system-ui, sans-serif"
    heading_font_size: str = "2.5rem"
    body_font_size: str = "1rem"
    font_weight: str = "400"
    line_height: str = "1.6"
    container_width: str = "1280px"
    grid_columns: int = 4
    card_style: str = "rounded-xl"
    border_radius: str = "0.75rem"
    box_shadow: str = "0 1px 3px rgba(0,0,0,0.1)"
    section_spacing: str = "4rem"
    header_height: str = "4rem"
    footer_height: str = "auto"
    button_border_radius: str = "0.5rem"
    button_padding: str = "0.75rem 1.5rem"
    button_hover_color: str = "#1d4ed8"
    button_hover_animation: str = "scale"
    button_shadow: str = "0 4px 6px rgba(0,0,0,0.1)"


class ThemeSettingsResponse(ThemeSettingsBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ThemeSettingsUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None
    is_dark_mode: Optional[bool] = None
    preview_image: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    accent_color: Optional[str] = None
    background_color: Optional[str] = None
    surface_color: Optional[str] = None
    header_color: Optional[str] = None
    footer_color: Optional[str] = None
    text_primary_color: Optional[str] = None
    text_secondary_color: Optional[str] = None
    button_bg_color: Optional[str] = None
    button_text_color: Optional[str] = None
    success_color: Optional[str] = None
    warning_color: Optional[str] = None
    error_color: Optional[str] = None
    border_color: Optional[str] = None
    font_family: Optional[str] = None
    heading_font_size: Optional[str] = None
    body_font_size: Optional[str] = None
    font_weight: Optional[str] = None
    line_height: Optional[str] = None
    container_width: Optional[str] = None
    grid_columns: Optional[int] = None
    card_style: Optional[str] = None
    border_radius: Optional[str] = None
    box_shadow: Optional[str] = None
    section_spacing: Optional[str] = None
    header_height: Optional[str] = None
    footer_height: Optional[str] = None
    button_border_radius: Optional[str] = None
    button_padding: Optional[str] = None
    button_hover_color: Optional[str] = None
    button_hover_animation: Optional[str] = None
    button_shadow: Optional[str] = None


class ThemeCSSResponse(BaseModel):
    css_variables: dict
    font_family: str
    container_width: str
    grid_columns: int
    is_dark_mode: bool
