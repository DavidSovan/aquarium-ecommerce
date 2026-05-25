from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from config.database import get_db
from models.homepage import HomepageSection
from models.branding import BrandingSettings
from models.user import User
from schemas.homepage import (
    HomepageSectionResponse,
    HomepageSectionUpdate,
    HomepageSectionBase,
    HomepageReorder,
    HomepageFullResponse,
)
from dependencies.auth import require_role
from typing import List

router = APIRouter(prefix="/homepage", tags=["homepage"])


@router.get("", response_model=HomepageFullResponse)
def get_full_homepage(response: Response, db: Session = Depends(get_db)):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    sections = (
        db.query(HomepageSection)
        .filter(HomepageSection.is_active == True)
        .order_by(HomepageSection.sort_order)
        .all()
    )
    branding = db.query(BrandingSettings).first()
    branding_dict = None
    if branding:
        branding_dict = {
            "store_name": branding.store_name,
            "store_logo": branding.store_logo,
            "copyright_text": branding.copyright_text,
            "contact_email": branding.contact_email,
            "contact_phone": branding.contact_phone,
            "contact_address": branding.contact_address,
        }

    return HomepageFullResponse(
        sections=[HomepageSectionResponse.model_validate(s) for s in sections],
        branding=branding_dict,
    )


@router.get("/admin", response_model=List[HomepageSectionResponse])
def list_homepage_sections(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    return (
        db.query(HomepageSection)
        .order_by(HomepageSection.sort_order)
        .all()
    )


@router.post("", response_model=HomepageSectionResponse, status_code=201)
def create_homepage_section(
    data: HomepageSectionBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    section = HomepageSection(**data.model_dump())
    db.add(section)
    db.commit()
    db.refresh(section)
    return section


@router.put("/{section_id}", response_model=HomepageSectionResponse)
def update_homepage_section(
    section_id: int,
    data: HomepageSectionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    section = db.query(HomepageSection).filter(HomepageSection.id == section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(section, key, value)

    db.commit()
    db.refresh(section)
    return section


@router.delete("/{section_id}")
def delete_homepage_section(
    section_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    section = db.query(HomepageSection).filter(HomepageSection.id == section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    db.delete(section)
    db.commit()
    return {"message": "Section deleted successfully"}


@router.put("/reorder/all", response_model=List[HomepageSectionResponse])
def reorder_homepage_sections(
    data: List[HomepageReorder],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    ids = [item.id for item in data]
    sections = db.query(HomepageSection).filter(HomepageSection.id.in_(ids)).all()
    section_map = {s.id: s for s in sections}

    for item in data:
        if item.id in section_map:
            section_map[item.id].sort_order = item.sort_order

    db.commit()
    for s in sections:
        db.refresh(s)
    return sorted(sections, key=lambda s: s.sort_order)
