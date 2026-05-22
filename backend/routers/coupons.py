from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timezone
from config.database import get_db
from models.coupon import Coupon
from models.user import User
from schemas.coupon import (
    CouponCreate,
    CouponUpdate,
    CouponResponse,
    ValidateCouponRequest,
    ValidateCouponResponse,
)
from dependencies.auth import require_role

router = APIRouter(prefix="/coupons", tags=["coupons"])


@router.get("", response_model=list[CouponResponse])
def list_coupons(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    coupons = db.query(Coupon).order_by(Coupon.created_at.desc()).offset(skip).limit(limit).all()
    return coupons


@router.get("/{coupon_id}", response_model=CouponResponse)
def get_coupon(
    coupon_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return coupon


@router.post("", response_model=CouponResponse, status_code=201)
def create_coupon(
    data: CouponCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    existing = db.query(Coupon).filter(Coupon.code == data.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists")

    coupon = Coupon(**data.model_dump())
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return coupon


@router.put("/{coupon_id}", response_model=CouponResponse)
def update_coupon(
    coupon_id: int,
    data: CouponUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(coupon, key, value)

    db.commit()
    db.refresh(coupon)
    return coupon


@router.delete("/{coupon_id}")
def delete_coupon(
    coupon_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")

    db.delete(coupon)
    db.commit()
    return {"message": "Coupon deleted successfully"}


@router.post("/validate", response_model=ValidateCouponResponse)
def validate_coupon(
    data: ValidateCouponRequest,
    db: Session = Depends(get_db),
):
    coupon = db.query(Coupon).filter(Coupon.code == data.code).first()
    if not coupon:
        return ValidateCouponResponse(valid=False, message="Coupon not found")

    if not coupon.is_active:
        return ValidateCouponResponse(valid=False, message="Coupon is inactive")

    now = datetime.now(timezone.utc)
    if coupon.starts_at and coupon.starts_at > now:
        return ValidateCouponResponse(valid=False, message="Coupon is not yet valid")

    if coupon.expires_at and coupon.expires_at < now:
        return ValidateCouponResponse(valid=False, message="Coupon has expired")

    if coupon.max_uses > 0 and coupon.used_count >= coupon.max_uses:
        return ValidateCouponResponse(valid=False, message="Coupon has reached max uses")

    if data.order_amount < coupon.min_order_amount:
        return ValidateCouponResponse(
            valid=False,
            message=f"Minimum order amount is ${coupon.min_order_amount:.2f}",
        )

    if coupon.discount_type == "percentage":
        discount = round(data.order_amount * coupon.discount_value / 100, 2)
    else:
        discount = coupon.discount_value

    return ValidateCouponResponse(
        valid=True,
        coupon=CouponResponse.model_validate(coupon),
        discount_amount=discount,
        message="Coupon applied successfully",
    )
