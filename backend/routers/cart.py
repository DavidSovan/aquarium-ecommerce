import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from config.database import get_db
from models.cart import Cart, CartItem
from models.product import Product
from models.product_option import ProductOption, ProductOptionValue
from models.user import User
from schemas.cart import (
    AddItemRequest,
    UpdateItemRequest,
    MergeCartRequest,
    CartItemResponse,
    CartResponse,
    ProductRef,
)
from dependencies.auth import get_optional_user, get_current_user
from typing import Optional
import json

router = APIRouter(prefix="/cart", tags=["cart"])


def get_cart_or_404(db: Session, cart_id: str) -> Cart:
    cart = db.query(Cart).filter(Cart.id == cart_id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    return cart


def calculate_customization_price(product: Product, customizations: list | None, db: Session = None) -> tuple[float, dict]:
    if not customizations:
        return 0.0, {}

    modifiers_total = 0.0
    breakdown = {}

    for sel in customizations:
        option_id = sel.get("option_id") if isinstance(sel, dict) else sel.option_id
        value_id = sel.get("value_id") if isinstance(sel, dict) else sel.value_id

        if value_id and db is not None:
            val = (
                db.query(ProductOptionValue)
                .join(ProductOption)
                .filter(
                    ProductOptionValue.id == value_id,
                    ProductOptionValue.option_id == option_id,
                    ProductOption.product_id == product.id,
                )
                .first()
            )
            if val:
                modifiers_total += val.price_modifier
                option_name = val.option.name if val.option else f"Option {option_id}"
                breakdown[option_name] = val.price_modifier

    return modifiers_total, breakdown


def validate_customizations(db: Session, product: Product, customizations: list | None):
    """Validate required options and value existence for a customizable product."""
    if not product.is_customizable:
        if customizations:
            raise HTTPException(400, "This product does not support customizations")
        return

    if not customizations:
        options = db.query(ProductOption).filter(
            ProductOption.product_id == product.id,
            ProductOption.is_required == True,
        ).all()
        if options:
            required_names = [o.name for o in options]
            raise HTTPException(
                400,
                f"Required option(s) not provided: {', '.join(required_names)}"
            )
        return

    product_options = {
        o.id: o for o in db.query(ProductOption).filter(
            ProductOption.product_id == product.id
        ).all()
    }

    provided_option_ids = set()
    for sel in customizations:
        option_id = sel.get("option_id") if isinstance(sel, dict) else sel.option_id
        value_id = sel.get("value_id") if isinstance(sel, dict) else sel.value_id
        value_text = sel.get("value_text") if isinstance(sel, dict) else sel.value_text

        option = product_options.get(option_id)
        if not option:
            raise HTTPException(400, f"Option ID {option_id} does not belong to this product")

        provided_option_ids.add(option_id)

        if option.type == "dropdown" or option.type == "color":
            if not value_id:
                raise HTTPException(400, f"Value ID is required for option '{option.name}'")
            val = db.query(ProductOptionValue).filter(
                ProductOptionValue.id == value_id,
                ProductOptionValue.option_id == option_id,
            ).first()
            if not val:
                raise HTTPException(400, f"Invalid value for option '{option.name}'")

        elif option.type == "dimensions":
            if not value_id:
                raise HTTPException(400, f"Value ID is required for option '{option.name}'")

        elif option.type == "text":
            if not value_text or not value_text.strip():
                raise HTTPException(400, f"Text value is required for option '{option.name}'")

    required = [o for o in product_options.values() if o.is_required]
    for req in required:
        if req.id not in provided_option_ids:
            raise HTTPException(400, f"Required option '{req.name}' is missing")


def build_cart_response(cart: Cart, db: Session = None) -> CartResponse:
    items = []
    for item in cart.items:
        product = item.product
        unit_price = product.discount_price if product and product.discount_price else (product.price if product else 0)
        modifier, _ = calculate_customization_price(product, item.customizations, db)
        effective_unit_price = round(unit_price + modifier, 2)
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
                is_customizable=product.is_customizable,
            ) if product else None,
            quantity=item.quantity,
            customizations=item.customizations,
            unit_price=effective_unit_price,
            total_price=round(effective_unit_price * item.quantity, 2),
        ))
    return CartResponse(
        id=cart.id,
        items=items,
        subtotal=round(sum(i.total_price for i in items), 2),
        total_items=sum(i.quantity for i in items),
    )


@router.get("", response_model=CartResponse)
def get_cart(
    cart_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    if current_user:
        cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
        if cart:
            return build_cart_response(cart, db)

    if cart_id:
        cart = get_cart_or_404(db, cart_id)
        return build_cart_response(cart, db)

    return CartResponse(id="", items=[], subtotal=0, total_items=0)


def _serialize_customizations(customizations):
    if customizations is None:
        return None
    serialized = []
    for c in customizations:
        if isinstance(c, dict):
            serialized.append(c)
        else:
            serialized.append({
                "option_id": c.option_id,
                "value_id": c.value_id,
                "value_text": c.value_text,
            })
    return serialized


@router.post("/items", response_model=CartResponse, status_code=201)
def add_item(
    data: AddItemRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.stock_quantity < data.quantity:
        raise HTTPException(status_code=400, detail=f"Insufficient stock. Only {product.stock_quantity} available.")

    validate_customizations(db, product, data.customizations)

    cart = None
    if current_user:
        cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()

    if not cart and data.cart_id:
        cart = db.query(Cart).filter(Cart.id == data.cart_id).first()

    if not cart:
        cart = Cart(id=str(uuid.uuid4()), user_id=current_user.id if current_user else None)
        db.add(cart)
        db.flush()

    customizations = _serialize_customizations(data.customizations)
    customizations_json = json.dumps(customizations, sort_keys=True) if customizations else None

    existing_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == data.product_id,
    ).first()

    if customizations_json:
        items_with_same_customizations = db.query(CartItem).filter(
            CartItem.cart_id == cart.id,
            CartItem.product_id == data.product_id,
        ).all()
        existing_item = None
        for ci in items_with_same_customizations:
            ci_json = json.dumps(ci.customizations, sort_keys=True) if ci.customizations else None
            if ci_json == customizations_json:
                existing_item = ci
                break

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
            customizations=customizations,
        )
        db.add(item)

    db.commit()
    db.refresh(cart)
    return build_cart_response(cart, db)


@router.post("/merge", response_model=CartResponse)
def merge_cart(
    data: MergeCartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    guest_cart = db.query(Cart).filter(Cart.id == data.guest_cart_id).first()
    if not guest_cart:
        raise HTTPException(status_code=404, detail="Guest cart not found")

    user_cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not user_cart:
        guest_cart.user_id = current_user.id
        db.commit()
        db.refresh(guest_cart)
        return build_cart_response(guest_cart, db)

    for guest_item in guest_cart.items:
        guest_cust_json = json.dumps(guest_item.customizations, sort_keys=True) if guest_item.customizations else None

        existing_item = None
        items_with_same_product = db.query(CartItem).filter(
            CartItem.cart_id == user_cart.id,
            CartItem.product_id == guest_item.product_id,
        ).all()
        for ci in items_with_same_product:
            ci_json = json.dumps(ci.customizations, sort_keys=True) if ci.customizations else None
            if ci_json == guest_cust_json:
                existing_item = ci
                break

        if existing_item:
            existing_item.quantity += guest_item.quantity
            db.delete(guest_item)
        else:
            guest_item.cart_id = user_cart.id

    db.delete(guest_cart)
    db.commit()
    db.refresh(user_cart)
    return build_cart_response(user_cart, db)


@router.put("/items/{item_id}", response_model=CartResponse)
def update_item(
    item_id: int,
    data: UpdateItemRequest,
    db: Session = Depends(get_db),
):
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
    return build_cart_response(cart, db)


@router.delete("/items/{item_id}", response_model=CartResponse)
def remove_item(
    item_id: int,
    cart_id: str = Query(...),
    db: Session = Depends(get_db),
):
    cart = get_cart_or_404(db, cart_id)

    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(item)
    db.commit()
    db.refresh(cart)
    return build_cart_response(cart, db)


@router.delete("/clear", response_model=CartResponse)
def clear_cart(
    cart_id: str = Query(...),
    db: Session = Depends(get_db),
):
    cart = get_cart_or_404(db, cart_id)

    for item in cart.items:
        db.delete(item)
    db.commit()
    db.refresh(cart)
    return build_cart_response(cart, db)
