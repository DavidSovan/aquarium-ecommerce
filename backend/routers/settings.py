from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from config.database import get_db
from models.setting import Setting
from models.branding import BrandingSettings
from models.user import User
from schemas.setting import (
    SettingCreate,
    SettingUpdate,
    SettingResponse,
    HomepageSettingsResponse,
    HomepageSettingsUpdate,
)
from dependencies.auth import require_role
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/settings", tags=["settings"])
public_router = APIRouter(tags=["settings"])
homepage_router = APIRouter(prefix="/settings/homepage", tags=["settings"])

PUBLIC_KEYS = {"store_name", "store_email", "homepage_video_enabled", "homepage_video_url", "enable_delivery_scheduling"}

HOMEPAGE_VIDEO_ENABLED_KEY = "homepage_video_enabled"
HOMEPAGE_VIDEO_URL_KEY = "homepage_video_url"


class PublicSettingsResponse(BaseModel):
    store_name: str = "Aquarium Store"
    store_email: str = ""
    store_logo: str | None = None
    background_video_enabled: bool = False
    background_video_url: str | None = None
    enable_delivery_scheduling: bool = False


@public_router.get("/settings/public", response_model=PublicSettingsResponse)
def get_public_settings(response: Response, db: Session = Depends(get_db)):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    settings = db.query(Setting).filter(Setting.key.in_(PUBLIC_KEYS)).all()
    result = {}
    for s in settings:
        result[s.key] = s.value or ""

    enabled_raw = result.get("homepage_video_enabled", "false")
    video_url = result.get("homepage_video_url") or None
    if video_url == "":
        video_url = None

    branding = db.query(BrandingSettings).first()
    store_logo = branding.store_logo if branding else None

    delivery_enabled_raw = result.get("enable_delivery_scheduling", "false")
    return PublicSettingsResponse(
        store_name=result.get("store_name", "Aquarium Store"),
        store_email=result.get("store_email", ""),
        store_logo=store_logo,
        background_video_enabled=enabled_raw.lower() == "true",
        background_video_url=video_url,
        enable_delivery_scheduling=delivery_enabled_raw.lower() == "true",
    )


@router.get("", response_model=List[SettingResponse])
def list_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    settings = db.query(Setting).order_by(Setting.key).all()
    return settings


# ---------------------------------------------------------------------------
# Homepage settings — dedicated endpoints
# ---------------------------------------------------------------------------

def _upsert_setting(db: Session, key: str, value: str, description: str) -> None:
    """Insert or update a single setting row."""
    setting = db.query(Setting).filter(Setting.key == key).first()
    if setting:
        setting.value = value
    else:
        setting = Setting(key=key, value=value, description=description)
        db.add(setting)


@homepage_router.get("", response_model=HomepageSettingsResponse)
def get_homepage_settings(response: Response, db: Session = Depends(get_db)):
    """Get homepage video settings (public, no auth required)."""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    keys = {HOMEPAGE_VIDEO_ENABLED_KEY, HOMEPAGE_VIDEO_URL_KEY}
    rows = db.query(Setting).filter(Setting.key.in_(keys)).all()
    result = {r.key: r.value for r in rows}

    enabled_raw = result.get(HOMEPAGE_VIDEO_ENABLED_KEY, "false") or "false"
    video_url = result.get(HOMEPAGE_VIDEO_URL_KEY) or None
    if video_url == "":
        video_url = None

    return HomepageSettingsResponse(
        background_video_enabled=enabled_raw.lower() == "true",
        background_video_url=video_url,
    )


@homepage_router.put("", response_model=HomepageSettingsResponse)
def update_homepage_settings(
    data: HomepageSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    """Update homepage video settings. Admin only."""
    enabled_value = "true" if data.background_video_enabled else "false"
    url_value = data.background_video_url or ""

    _upsert_setting(
        db,
        HOMEPAGE_VIDEO_ENABLED_KEY,
        enabled_value,
        "Enable background video on storefront homepage",
    )
    _upsert_setting(
        db,
        HOMEPAGE_VIDEO_URL_KEY,
        url_value,
        "Direct MP4 URL for homepage background video",
    )
    db.commit()

    return HomepageSettingsResponse(
        background_video_enabled=data.background_video_enabled,
        background_video_url=data.background_video_url,
    )


@router.get("/{key}", response_model=SettingResponse)
def get_setting(
    key: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    setting = db.query(Setting).filter(Setting.key == key).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    return setting


@router.post("", response_model=SettingResponse, status_code=201)
def create_setting(
    data: SettingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    existing = db.query(Setting).filter(Setting.key == data.key).first()
    if existing:
        raise HTTPException(status_code=400, detail="Setting key already exists")

    setting = Setting(**data.model_dump())
    db.add(setting)
    db.commit()
    db.refresh(setting)
    return setting


@router.put("/{key}", response_model=SettingResponse)
def update_setting(
    key: str,
    data: SettingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    setting = db.query(Setting).filter(Setting.key == key).first()
    if not setting:
        setting = Setting(key=key, value=data.value or "", description=data.description)
        db.add(setting)
        db.commit()
        db.refresh(setting)
        return setting

    if data.value is not None:
        setting.value = data.value
    if data.description is not None:
        setting.description = data.description

    db.commit()
    db.refresh(setting)
    return setting


@router.delete("/{key}")
def delete_setting(
    key: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    setting = db.query(Setting).filter(Setting.key == key).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")

    db.delete(setting)
    db.commit()
    return {"message": "Setting deleted successfully"}
