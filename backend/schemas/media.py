from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from models.media import MediaType


class MediaLibraryBase(BaseModel):
    filename: str
    original_name: str
    url: str
    media_type: MediaType = MediaType.IMAGE
    mime_type: Optional[str] = None
    file_size: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    alt_text: Optional[str] = None
    folder: str = "/"


class MediaLibraryCreate(BaseModel):
    url: str
    media_type: MediaType = MediaType.IMAGE
    mime_type: Optional[str] = None
    file_size: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    alt_text: Optional[str] = None
    folder: str = "/"


class MediaLibraryUpdate(BaseModel):
    alt_text: Optional[str] = None
    folder: Optional[str] = None


class MediaLibraryResponse(MediaLibraryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
