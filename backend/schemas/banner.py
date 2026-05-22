from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class BannerCreate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    image_url: str
    link_url: Optional[str] = None
    position: Optional[str] = "hero"
    sort_order: Optional[int] = 0
    is_active: Optional[bool] = True


class BannerUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    image_url: Optional[str] = None
    link_url: Optional[str] = None
    position: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class BannerResponse(BaseModel):
    id: int
    title: Optional[str] = None
    subtitle: Optional[str] = None
    image_url: str
    link_url: Optional[str] = None
    position: str
    sort_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
