import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from config.database import get_db
from models.wishlist import Wishlist, WishlistItem
from models.product import Product
from schemas.wishlist import (
    AddWishlistItemRequest,
    WishlistItemResponse,
    WishlistResponse,
    ProductRef,
)

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
def get_wishlist(wishlist_id: str = Query(...), db: Session = Depends(get_db)):
    wl = get_wishlist_or_404(db, wishlist_id)
    return build_wishlist_response(wl)


@router.post("", response_model=WishlistResponse, status_code=201)
def add_wishlist_item(data: AddWishlistItemRequest, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if data.wishlist_id:
        wl = get_wishlist_or_404(db, data.wishlist_id)
    else:
        wl = Wishlist(id=str(uuid.uuid4()))
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


@router.delete("/{product_id}", response_model=WishlistResponse)
def remove_wishlist_item(product_id: int, wishlist_id: str = Query(...), db: Session = Depends(get_db)):
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
