import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from config.database import get_db
from models.cart import Cart, CartItem
from models.product import Product
from schemas.cart import (
    AddItemRequest,
    UpdateItemRequest,
    CartItemResponse,
    CartResponse,
    ProductRef,
)
from typing import List

router = APIRouter(prefix="/cart", tags=["cart"])


def get_cart_or_404(db: Session, cart_id: str) -> Cart:
    cart = db.query(Cart).filter(Cart.id == cart_id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    return cart


def build_cart_response(cart: Cart) -> CartResponse:
    items = []
    for item in cart.items:
        product = item.product
        unit_price = product.discount_price if product and product.discount_price else (product.price if product else 0)
        items.append(CartItemResponse(
            id=item.id,
            product_id=item.product_id,
            product=ProductRef(
                id=product.id,
                name=product.name,
                slug=product.slug,
                price=product.price,
                discount_price=product.discount_price,
                thumbnail=product.thumbnail,
                stock_quantity=product.stock_quantity,
            ) if product else None,
            quantity=item.quantity,
            unit_price=unit_price,
            total_price=round(unit_price * item.quantity, 2),
        ))
    return CartResponse(
        id=cart.id,
        items=items,
        subtotal=round(sum(i.total_price for i in items), 2),
        total_items=sum(i.quantity for i in items),
    )


@router.get("", response_model=CartResponse)
def get_cart(cart_id: str = Query(...), db: Session = Depends(get_db)):
    cart = get_cart_or_404(db, cart_id)
    return build_cart_response(cart)


@router.post("/items", response_model=CartResponse, status_code=201)
def add_item(data: AddItemRequest, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.stock_quantity < data.quantity:
        raise HTTPException(status_code=400, detail=f"Insufficient stock. Only {product.stock_quantity} available.")

    if data.cart_id:
        cart = get_cart_or_404(db, data.cart_id)
    else:
        cart = Cart(id=str(uuid.uuid4()))
        db.add(cart)
        db.flush()

    existing_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == data.product_id,
    ).first()

    if existing_item:
        new_qty = existing_item.quantity + data.quantity
        if new_qty > product.stock_quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock. Only {product.stock_quantity} available.")
        existing_item.quantity = new_qty
    else:
        item = CartItem(
            cart_id=cart.id,
            product_id=data.product_id,
            quantity=data.quantity,
        )
        db.add(item)

    db.commit()
    db.refresh(cart)
    return build_cart_response(cart)


@router.put("/items/{item_id}", response_model=CartResponse)
def update_item(item_id: int, data: UpdateItemRequest, db: Session = Depends(get_db)):
    cart = get_cart_or_404(db, data.cart_id)

    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    product = item.product
    if data.quantity > product.stock_quantity:
        raise HTTPException(status_code=400, detail=f"Insufficient stock. Only {product.stock_quantity} available.")

    item.quantity = data.quantity
    db.commit()
    db.refresh(cart)
    return build_cart_response(cart)


@router.delete("/items/{item_id}", response_model=CartResponse)
def remove_item(item_id: int, cart_id: str = Query(...), db: Session = Depends(get_db)):
    cart = get_cart_or_404(db, cart_id)

    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(item)
    db.commit()
    db.refresh(cart)
    return build_cart_response(cart)


@router.delete("/clear", response_model=CartResponse)
def clear_cart(cart_id: str = Query(...), db: Session = Depends(get_db)):
    cart = get_cart_or_404(db, cart_id)

    for item in cart.items:
        db.delete(item)
    db.commit()
    db.refresh(cart)
    return build_cart_response(cart)
