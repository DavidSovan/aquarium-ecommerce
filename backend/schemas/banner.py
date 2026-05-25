from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class BannerCreate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    video_type: Optional[str] = None
    button_text: Optional[str] = None
    button_link: Optional[str] = None
    position: Optional[str] = "hero"
    sort_order: Optional[int] = 0
    is_active: Optional[bool] = True
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class BannerUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    video_type: Optional[str] = None
    button_text: Optional[str] = None
    button_link: Optional[str] = None
    position: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class BannerResponse(BaseModel):
    id: int
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    video_type: Optional[str] = None
    button_text: Optional[str] = None
    button_link: Optional[str] = None
    position: str
    sort_order: int
    is_active: bool
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
