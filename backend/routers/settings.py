from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from config.database import get_db
from models.setting import Setting
from models.user import User
from schemas.setting import (
    SettingCreate,
    SettingUpdate,
    SettingResponse,
)
from dependencies.auth import require_role
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/settings", tags=["settings"])
public_router = APIRouter(tags=["settings"])

PUBLIC_KEYS = {"store_name", "store_email"}


class PublicSettingsResponse(BaseModel):
    store_name: str = "Aquarium Store"
    store_email: str = ""


@public_router.get("/settings/public", response_model=PublicSettingsResponse)
def get_public_settings(response: Response, db: Session = Depends(get_db)):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    settings = db.query(Setting).filter(Setting.key.in_(PUBLIC_KEYS)).all()
    result = {}
    for s in settings:
        result[s.key] = s.value or ""
    return PublicSettingsResponse(**result)


@router.get("", response_model=List[SettingResponse])
def list_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    settings = db.query(Setting).order_by(Setting.key).all()
    return settings


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
        raise HTTPException(status_code=404, detail="Setting not found")

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
