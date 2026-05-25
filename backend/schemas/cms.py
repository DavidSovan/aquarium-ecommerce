from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any


class CMSBlockBase(BaseModel):
    title: str
    slug: str
    block_type: str = "text"
    content: Optional[Any] = None
    sort_order: int = 0
    is_active: bool = True
    publish_at: Optional[datetime] = None
    unpublish_at: Optional[datetime] = None


class CMSBlockCreate(CMSBlockBase):
    pass


class CMSBlockUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    block_type: Optional[str] = None
    content: Optional[Any] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None
    publish_at: Optional[datetime] = None
    unpublish_at: Optional[datetime] = None


class CMSBlockResponse(CMSBlockBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CMSBlockReorder(BaseModel):
    id: int
    sort_order: int
