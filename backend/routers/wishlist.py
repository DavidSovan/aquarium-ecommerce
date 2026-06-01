import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from config.database import get_db
from models.wishlist import Wishlist, WishlistItem
from models.product import Product
from models.user import User
from schemas.wishlist import (
    AddWishlistItemRequest,
    MergeWishlistRequest,
    WishlistItemResponse,
    WishlistResponse,
    ProductRef,
)
from dependencies.auth import get_current_user, get_optional_user
from typing import Optional

router = APIRouter(prefix="/wishlist", tags=["wishlist"])


def get_wishlist_or_404(db: Session, wishlist_id: str) -> Wishlist:
    wl = db.query(Wishlist).filter(Wishlist.id == wishlist_id).first()
    if not wl:
        raise HTTPException(status_code=404, detail="Wishlist not found")
    return wl


def build_wishlist_response(wl: Wishlist) -> WishlistResponse:
    items = []
    for item in wl.items:
        p = item.product
        items.append(WishlistItemResponse(
            id=item.id,
            product_id=item.product_id,
            product=ProductRef(
                id=p.id, name=p.name, slug=p.slug,
                price=p.price, discount_price=p.discount_price,
                thumbnail=p.thumbnail, stock_quantity=p.stock_quantity,
            ) if p else None,
            added_at=item.added_at,
        ))
    return WishlistResponse(id=wl.id, items=items)


@router.get("", response_model=WishlistResponse)
def get_wishlist(
    wishlist_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    if current_user:
        wl = db.query(Wishlist).filter(Wishlist.user_id == current_user.id).first()
        if wl:
            return build_wishlist_response(wl)

    if wishlist_id:
        wl = db.query(Wishlist).filter(Wishlist.id == wishlist_id).first()
        if wl:
            return build_wishlist_response(wl)

    return WishlistResponse(id="", items=[])


@router.post("", response_model=WishlistResponse, status_code=201)
def add_wishlist_item(
    data: AddWishlistItemRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    wl = None
    if current_user:
        wl = db.query(Wishlist).filter(Wishlist.user_id == current_user.id).first()

    if not wl and data.wishlist_id:
        wl = db.query(Wishlist).filter(Wishlist.id == data.wishlist_id).first()

    if not wl:
        wl = Wishlist(id=str(uuid.uuid4()), user_id=current_user.id if current_user else None)
        db.add(wl)
        db.flush()

    existing = db.query(WishlistItem).filter(
        WishlistItem.wishlist_id == wl.id,
        WishlistItem.product_id == data.product_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Product already in wishlist")

    item = WishlistItem(wishlist_id=wl.id, product_id=data.product_id)
    db.add(item)
    db.commit()
    db.refresh(wl)
    return build_wishlist_response(wl)


@router.post("/merge", response_model=WishlistResponse)
def merge_wishlist(
    data: MergeWishlistRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    guest_wl = db.query(Wishlist).filter(Wishlist.id == data.guest_wishlist_id).first()
    if not guest_wl:
        raise HTTPException(status_code=404, detail="Guest wishlist not found")

    user_wl = db.query(Wishlist).filter(Wishlist.user_id == current_user.id).first()
    if not user_wl:
        guest_wl.user_id = current_user.id
        db.commit()
        db.refresh(guest_wl)
        return build_wishlist_response(guest_wl)

    for guest_item in guest_wl.items:
        existing = db.query(WishlistItem).filter(
            WishlistItem.wishlist_id == user_wl.id,
            WishlistItem.product_id == guest_item.product_id,
        ).first()
        if not existing:
            guest_item.wishlist_id = user_wl.id
        else:
            db.delete(guest_item)

    db.delete(guest_wl)
    db.commit()
    db.refresh(user_wl)
    return build_wishlist_response(user_wl)


@router.delete("/{product_id}", response_model=WishlistResponse)
def remove_wishlist_item(
    product_id: int,
    wishlist_id: str = Query(...),
    db: Session = Depends(get_db),
):
    wl = get_wishlist_or_404(db, wishlist_id)

    item = db.query(WishlistItem).filter(
        WishlistItem.wishlist_id == wl.id,
        WishlistItem.product_id == product_id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Wishlist item not found")

    db.delete(item)
    db.commit()
    db.refresh(wl)
    return build_wishlist_response(wl)
