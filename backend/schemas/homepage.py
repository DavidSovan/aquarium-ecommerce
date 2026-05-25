from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any


class HomepageSectionBase(BaseModel):
    section_type: str = "hero"
    sort_order: int = 0
    is_active: bool = True
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    hero_cta_text: Optional[str] = None
    hero_cta_url: Optional[str] = None
    hero_bg_image: Optional[str] = None
    hero_bg_video_url: Optional[str] = None
    hero_overlay_color: Optional[str] = "#0c1445"
    hero_overlay_opacity: Optional[float] = 0.6
    hero_text_color: Optional[str] = "#ffffff"
    hero_badge_text: Optional[str] = None
    bg_type: Optional[str] = "color"
    bg_color: Optional[str] = None
    bg_image: Optional[str] = None
    bg_video_url: Optional[str] = None
    content: Optional[Any] = None


class HomepageSectionResponse(HomepageSectionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class HomepageSectionUpdate(BaseModel):
    section_type: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    hero_cta_text: Optional[str] = None
    hero_cta_url: Optional[str] = None
    hero_bg_image: Optional[str] = None
    hero_bg_video_url: Optional[str] = None
    hero_overlay_color: Optional[str] = None
    hero_overlay_opacity: Optional[float] = None
    hero_text_color: Optional[str] = None
    hero_badge_text: Optional[str] = None
    bg_type: Optional[str] = None
    bg_color: Optional[str] = None
    bg_image: Optional[str] = None
    bg_video_url: Optional[str] = None
    content: Optional[Any] = None


class HomepageReorder(BaseModel):
    id: int
    sort_order: int


class HomepageFullResponse(BaseModel):
    sections: list[HomepageSectionResponse]
    branding: Optional[dict] = None
    theme_css: Optional[dict] = None
