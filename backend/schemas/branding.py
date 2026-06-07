from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class BrandingSettingsBase(BaseModel):
    store_name: str = "Fashion Store"
    store_logo: Optional[str] = None
    favicon: Optional[str] = None
    footer_logo: Optional[str] = None
    copyright_text: str = "All rights reserved."
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_address: Optional[str] = None
    social_facebook: Optional[str] = None
    social_twitter: Optional[str] = None
    social_instagram: Optional[str] = None
    social_youtube: Optional[str] = None
    social_linkedin: Optional[str] = None


class BrandingSettingsResponse(BrandingSettingsBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BrandingSettingsUpdate(BaseModel):
    store_name: Optional[str] = None
    store_logo: Optional[str] = None
    favicon: Optional[str] = None
    footer_logo: Optional[str] = None
    copyright_text: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_address: Optional[str] = None
    social_facebook: Optional[str] = None
    social_twitter: Optional[str] = None
    social_instagram: Optional[str] = None
    social_youtube: Optional[str] = None
    social_linkedin: Optional[str] = None
