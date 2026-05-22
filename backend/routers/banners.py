from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from config.database import get_db
from models.banner import Banner
from models.user import User
from schemas.banner import (
    BannerCreate,
    BannerUpdate,
    BannerResponse,
)
from dependencies.auth import require_role

router = APIRouter(prefix="/banners", tags=["banners"])


@router.get("", response_model=list[BannerResponse])
def list_banners(db: Session = Depends(get_db)):
    banners = db.query(Banner).order_by(Banner.sort_order).all()
    return banners


@router.get("/active", response_model=list[BannerResponse])
def list_active_banners(db: Session = Depends(get_db)):
    banners = db.query(Banner).filter(
        Banner.is_active == True
    ).order_by(Banner.sort_order).all()
    return banners


@router.get("/{banner_id}", response_model=BannerResponse)
def get_banner(
    banner_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    return banner


@router.post("", response_model=BannerResponse, status_code=201)
def create_banner(
    data: BannerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    banner = Banner(**data.model_dump())
    db.add(banner)
    db.commit()
    db.refresh(banner)
    return banner


@router.put("/{banner_id}", response_model=BannerResponse)
def update_banner(
    banner_id: int,
    data: BannerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(banner, key, value)

    db.commit()
    db.refresh(banner)
    return banner


@router.delete("/{banner_id}")
def delete_banner(
    banner_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")

    db.delete(banner)
    db.commit()
    return {"message": "Banner deleted successfully"}
