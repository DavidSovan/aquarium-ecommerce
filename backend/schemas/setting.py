from pydantic import BaseModel, Field, ConfigDict, field_validator, HttpUrl
from typing import Optional, List
from datetime import datetime


class SettingCreate(BaseModel):
    key: str
    value: str
    description: Optional[str] = None


class SettingUpdate(BaseModel):
    value: Optional[str] = None
    description: Optional[str] = None


class SettingResponse(BaseModel):
    id: int
    key: str
    value: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HomepageSettingsUpdate(BaseModel):
    background_video_enabled: bool = False
    background_video_url: Optional[str] = None

    @field_validator('background_video_url')
    @classmethod
    def validate_video_url(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v.strip() == '':
            return None
        v = v.strip()
        if len(v) > 1000:
            raise ValueError('Video URL must not exceed 1000 characters')
        if not (v.startswith('http://') or v.startswith('https://')):
            raise ValueError('Video URL must start with http:// or https://')
        for ch in ('<', '>', '"'):
            if ch in v:
                raise ValueError('Video URL contains invalid characters')
        return v


class HomepageSettingsResponse(BaseModel):
    background_video_enabled: bool
    background_video_url: Optional[str] = None
