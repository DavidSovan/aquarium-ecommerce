from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from config.database import get_db
from models.cart import Cart, CartItem
from models.order import Order, OrderItem
from models.product import Product
from models.address import Address
from schemas.order import (
    CheckoutRequest,
    OrderItemResponse,
    OrderResponse,
)
import uuid

router = APIRouter(prefix="/checkout", tags=["checkout"])


def generate_order_number():
    return f"ORD-{uuid.uuid4().hex[:12].upper()}"


@router.post("", response_model=OrderResponse)
def checkout(data: CheckoutRequest, db: Session = Depends(get_db)):
    cart = db.query(Cart).filter(Cart.id == data.cart_id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    cart_items = db.query(CartItem).filter(CartItem.cart_id == cart.id).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    shipping_addr = db.query(Address).filter(Address.id == data.shipping_address_id).first()
    if not shipping_addr:
        raise HTTPException(status_code=404, detail="Shipping address not found")

    if data.billing_address_id:
        billing_addr = db.query(Address).filter(Address.id == data.billing_address_id).first()
        if not billing_addr:
            raise HTTPException(status_code=404, detail="Billing address not found")

    order_items_data = []
    subtotal = 0.0
    total_original = 0.0

    for cart_item in cart_items:
        product = db.query(Product).filter(Product.id == cart_item.product_id).first()
        if not product:
            raise HTTPException(status_code=400, detail=f"Product {cart_item.product_id} no longer exists")

        if product.stock_quantity < cart_item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.stock_quantity}, requested: {cart_item.quantity}"
            )

        unit_price = product.discount_price if product.discount_price else product.price
        original_price = product.price
        total_price = round(unit_price * cart_item.quantity, 2)
        original_total = round(original_price * cart_item.quantity, 2)

        subtotal += total_price
        total_original += original_total

        order_items_data.append({
            "product_id": product.id,
            "product_name": product.name,
            "product_sku": product.sku,
            "quantity": cart_item.quantity,
            "unit_price": unit_price,
            "total_price": total_price,
        })

    subtotal = round(subtotal, 2)
    discount = round(total_original - subtotal, 2)
    shipping = 0.0
    total = round(subtotal + shipping, 2)

    order = Order(
        order_number=generate_order_number(),
        user_id=data.user_id,
        order_status="pending",
        payment_status="pending",
        subtotal=subtotal,
        shipping=shipping,
        discount=discount,
        total=total,
        shipping_address_id=data.shipping_address_id,
        billing_address_id=data.billing_address_id or data.shipping_address_id,
        notes=data.notes,
    )
    db.add(order)
    db.flush()

    for item_data in order_items_data:
        order_item = OrderItem(order_id=order.id, **item_data)
        db.add(order_item)

        product = db.query(Product).filter(Product.id == item_data["product_id"]).first()
        product.stock_quantity -= item_data["quantity"]

    for cart_item in cart_items:
        db.delete(cart_item)
    db.delete(cart)

    db.commit()
    db.refresh(order)

    return OrderResponse(
        id=order.id,
        order_number=order.order_number,
        user_id=order.user_id,
        order_status=order.order_status,
        payment_status=order.payment_status,
        subtotal=order.subtotal,
        shipping=order.shipping,
        discount=order.discount,
        total=order.total,
        items=[OrderItemResponse(
            id=item.id,
            product_id=item.product_id,
            product_name=item.product_name,
            product_sku=item.product_sku,
            quantity=item.quantity,
            unit_price=item.unit_price,
            total_price=item.total_price,
        ) for item in order.items],
        shipping_address_id=order.shipping_address_id,
        billing_address_id=order.billing_address_id,
        notes=order.notes,
        created_at=order.created_at,
        updated_at=order.updated_at,
    )

