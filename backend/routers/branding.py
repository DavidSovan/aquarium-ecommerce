from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from config.database import get_db
from models.branding import BrandingSettings
from models.user import User
from schemas.branding import BrandingSettingsResponse, BrandingSettingsUpdate
from dependencies.auth import require_role

router = APIRouter(prefix="/settings/branding", tags=["branding"])
public_router = APIRouter(tags=["branding"])


@public_router.get("/settings/branding/public")
def get_public_branding(response: Response, db: Session = Depends(get_db)):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    branding = db.query(BrandingSettings).first()
    if not branding:
        branding = BrandingSettings(store_name="Aquarium Store")
        db.add(branding)
        db.commit()
        db.refresh(branding)
    return {
        "store_name": branding.store_name,
        "store_logo": branding.store_logo,
        "favicon": branding.favicon,
        "footer_logo": branding.footer_logo,
        "copyright_text": branding.copyright_text,
        "contact_email": branding.contact_email,
        "contact_phone": branding.contact_phone,
        "contact_address": branding.contact_address,
        "social_facebook": branding.social_facebook,
        "social_twitter": branding.social_twitter,
        "social_instagram": branding.social_instagram,
        "social_youtube": branding.social_youtube,
        "social_linkedin": branding.social_linkedin,
    }


@router.get("", response_model=BrandingSettingsResponse)
def get_branding(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    branding = db.query(BrandingSettings).first()
    if not branding:
        branding = BrandingSettings(store_name="Aquarium Store")
        db.add(branding)
        db.commit()
        db.refresh(branding)
    return branding


@router.put("", response_model=BrandingSettingsResponse)
def update_branding(
    data: BrandingSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    branding = db.query(BrandingSettings).first()
    if not branding:
        branding = BrandingSettings(store_name="Aquarium Store")
        db.add(branding)
        db.commit()
        db.refresh(branding)

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(branding, key, value)

    db.commit()
    db.refresh(branding)
    return branding
