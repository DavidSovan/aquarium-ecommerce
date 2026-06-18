from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from config.database import get_db
from models.cart import Cart, CartItem
from models.order import Order, OrderItem
from models.product import Product
from models.product_option import ProductOptionValue
from models.address import Address
from models.user import User
from models.coupon import Coupon
from models.delivery_slot import DeliverySlot, DeliverySlotBooking
from models.setting import Setting
from schemas.order import (
    CheckoutRequest,
    OrderItemResponse,
    OrderResponse,
)
from dependencies.auth import get_current_user, require_role
from services.telegram_service import send_telegram_message, format_order_notification, format_order_confirmation
from services.payment_service import generate_order_khqr
from websocket.connection_manager import manager
from websocket.events import build_new_order_event
from datetime import datetime, timezone, date
import uuid

router = APIRouter(prefix="/checkout", tags=["checkout"])


def generate_order_number():
    return f"ORD-{uuid.uuid4().hex[:12].upper()}"


@router.post("", response_model=OrderResponse)
def checkout(
    data: CheckoutRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("customer", "staff", "admin")),
):
    cart = db.query(Cart).filter(Cart.id == data.cart_id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    cart_items = db.query(CartItem).filter(CartItem.cart_id == cart.id).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    shipping_addr = db.query(Address).filter(Address.id == data.shipping_address_id).first()
    if not shipping_addr:
        raise HTTPException(status_code=404, detail="Shipping address not found")
    if shipping_addr.user_id != current_user.id and current_user.role not in ("admin", "staff"):
        raise HTTPException(status_code=403, detail="Not authorized to use this address")

    if data.billing_address_id:
        billing_addr = db.query(Address).filter(Address.id == data.billing_address_id).first()
        if not billing_addr:
            raise HTTPException(status_code=404, detail="Billing address not found")
        if billing_addr.user_id != current_user.id and current_user.role not in ("admin", "staff"):
            raise HTTPException(status_code=403, detail="Not authorized to use this billing address")

    delivery_scheduling_enabled = db.query(Setting).filter(
        Setting.key == "enable_delivery_scheduling", Setting.value == "true"
    ).first() is not None

    delivery_slot = None
    if delivery_scheduling_enabled and (data.preferred_delivery_date or data.delivery_slot_id):
        if not data.preferred_delivery_date:
            raise HTTPException(status_code=400, detail="Delivery date is required when scheduling a delivery")
        if not data.delivery_slot_id:
            raise HTTPException(status_code=400, detail="Delivery slot is required when scheduling a delivery")

        try:
            delivery_date = date.fromisoformat(data.preferred_delivery_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid delivery date format. Use YYYY-MM-DD")

        if delivery_date <= date.today():
            raise HTTPException(status_code=400, detail="Delivery date must be in the future")

        delivery_slot = db.query(DeliverySlot).filter(
            DeliverySlot.id == data.delivery_slot_id,
            DeliverySlot.is_active == True,
        ).first()
        if not delivery_slot:
            raise HTTPException(status_code=400, detail="Selected delivery slot is not available or inactive")

        booking_count = db.query(DeliverySlotBooking).filter(
            DeliverySlotBooking.slot_id == delivery_slot.id,
            DeliverySlotBooking.delivery_date == delivery_date,
        ).count()
        if booking_count >= delivery_slot.max_capacity:
            raise HTTPException(status_code=400, detail="Selected delivery slot is fully booked for this date")

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

        modifier = 0.0
        if cart_item.customizations:
            for sel in cart_item.customizations:
                val_id = sel.get("value_id")
                if val_id:
                    val = db.query(ProductOptionValue).filter(ProductOptionValue.id == val_id).first()
                    if val:
                        modifier += val.price_modifier

        effective_unit_price = round(unit_price + modifier, 2)
        total_price = round(effective_unit_price * cart_item.quantity, 2)
        original_total = round(original_price * cart_item.quantity, 2)

        subtotal += total_price
        total_original += original_total

        order_items_data.append({
            "product_id": product.id,
            "product_name": product.name,
            "product_sku": product.sku,
            "quantity": cart_item.quantity,
            "unit_price": effective_unit_price,
            "total_price": total_price,
            "customizations": cart_item.customizations,
        })
    subtotal = round(subtotal, 2)
    discount = round(total_original - subtotal, 2)
    shipping = 0.0

    coupon_code = None
    coupon_discount = 0.0
    if data.coupon_code:
        coupon = db.query(Coupon).filter(Coupon.code == data.coupon_code).first()
        if not coupon:
            raise HTTPException(status_code=400, detail="Invalid coupon code")

        if not coupon.is_active:
            raise HTTPException(status_code=400, detail="Coupon is no longer active")

        now = datetime.now(timezone.utc)
        if coupon.starts_at and coupon.starts_at > now:
            raise HTTPException(status_code=400, detail="Coupon is not yet valid")

        if coupon.expires_at and coupon.expires_at < now:
            raise HTTPException(status_code=400, detail="Coupon has expired")

        if coupon.max_uses > 0 and coupon.used_count >= coupon.max_uses:
            raise HTTPException(status_code=400, detail="Coupon usage limit reached")

        if subtotal < coupon.min_order_amount:
            raise HTTPException(
                status_code=400,
                detail=f"Minimum order amount of ${coupon.min_order_amount:.2f} not met"
            )

        if coupon.discount_type == "percentage":
            coupon_discount = round(subtotal * coupon.discount_value / 100, 2)
        else:
            coupon_discount = coupon.discount_value

        coupon_code = coupon.code
        coupon.used_count += 1

    total = round(subtotal + shipping - coupon_discount, 2)

    payment_method = getattr(data, 'payment_method', 'COD') or 'COD'
    payment_status = "pending" if payment_method == "ONLINE_PAYMENT" else "pending"

    delivery_date_val = None
    if delivery_scheduling_enabled and data.preferred_delivery_date:
        delivery_date_val = date.fromisoformat(data.preferred_delivery_date)

    shipping_address_snapshot = {
        "full_name": shipping_addr.full_name,
        "phone": shipping_addr.phone,
        "country": shipping_addr.country,
        "city": shipping_addr.city,
        "district": shipping_addr.district,
        "address_line": shipping_addr.address_line,
        "postal_code": shipping_addr.postal_code,
        "latitude": shipping_addr.latitude,
        "longitude": shipping_addr.longitude
    }

    order = Order(
        order_number=generate_order_number(),
        user_id=current_user.id,
        order_status="pending",
        payment_method=payment_method,
        payment_status=payment_status,
        subtotal=subtotal,
        shipping=shipping,
        discount=discount,
        coupon_code=coupon_code,
        coupon_discount=coupon_discount,
        total=total,
        shipping_address_id=data.shipping_address_id,
        billing_address_id=data.billing_address_id or data.shipping_address_id,
        shipping_address_snapshot=shipping_address_snapshot,
        notes=data.notes,
        preferred_delivery_date=delivery_date_val,
        delivery_slot_id=data.delivery_slot_id if delivery_scheduling_enabled else None,
    )
    db.add(order)
    db.flush()

    if delivery_scheduling_enabled and delivery_slot and delivery_date_val:
        booking = DeliverySlotBooking(
            slot_id=delivery_slot.id,
            order_id=order.id,
            delivery_date=delivery_date_val,
        )
        db.add(booking)

    qr_image_base64 = None
    if payment_method == "ONLINE_PAYMENT":
        khqr_result = generate_order_khqr(order)
        order.bakong_account_id = khqr_result["bakong_account_id"]
        order.khqr_md5 = khqr_result["md5"]
        order.payment_qr = khqr_result["qr_string"]
        order.payment_expires_at = khqr_result["expires_at"]
        qr_image_base64 = khqr_result["qr_image_base64"]

    for item_data in order_items_data:
        cust = item_data.pop("customizations", None)
        order_item = OrderItem(order_id=order.id, **item_data, customizations=cust)
        db.add(order_item)

        product = db.query(Product).filter(Product.id == item_data["product_id"]).first()
        product.stock_quantity -= item_data["quantity"]

    for cart_item in cart_items:
        db.delete(cart_item)
    db.delete(cart)

    db.commit()
    db.refresh(order)

    customer = current_user
    shipping_addr = db.query(Address).filter(Address.id == order.shipping_address_id).first()
    msg = format_order_notification(order, order.items, customer, shipping_addr)
    background_tasks.add_task(send_telegram_message, msg)

    if customer.telegram_chat_id:
        user_msg = format_order_confirmation(order, order.items, customer)
        background_tasks.add_task(send_telegram_message, user_msg, customer.telegram_chat_id)

    first = (customer.first_name or "").strip()
    last = (customer.last_name or "").strip()
    customer_name = f"{first} {last}".strip() if first or last else customer.email
    new_order_event = build_new_order_event(
        order_id=order.id,
        order_number=order.order_number,
        customer_name=customer_name,
        total=order.total,
        created_at=order.created_at,
    )
    background_tasks.add_task(manager.broadcast_to_admins, new_order_event)

    return OrderResponse(
        id=order.id,
        order_number=order.order_number,
        user_id=order.user_id,
        order_status=order.order_status,
        payment_method=order.payment_method,
        payment_status=order.payment_status,
        subtotal=order.subtotal,
        shipping=order.shipping,
        discount=order.discount,
        coupon_code=order.coupon_code,
        coupon_discount=order.coupon_discount,
        total=order.total,
        items=[OrderItemResponse(
            id=item.id,
            product_id=item.product_id,
            product_name=item.product_name,
            product_sku=item.product_sku,
            quantity=item.quantity,
            unit_price=item.unit_price,
            total_price=item.total_price,
            customizations=item.customizations,
        ) for item in order.items],
        shipping_address_id=order.shipping_address_id,
        billing_address_id=order.billing_address_id,
        shipping_address_snapshot=order.shipping_address_snapshot,
        notes=order.notes,
        preferred_delivery_date=order.preferred_delivery_date,
        delivery_slot_id=order.delivery_slot_id,
        delivery_slot_name=order.delivery_slot.name if order.delivery_slot else None,
        payment_qr=order.payment_qr,
        qr_image_base64=qr_image_base64,
        khqr_md5=order.khqr_md5,
        payment_expires_at=order.payment_expires_at,
        bakong_account_id=order.bakong_account_id,
        payment_reference=order.payment_reference,
        paid_at=order.paid_at,
        payment_failure_reason=order.payment_failure_reason,
        created_at=order.created_at,
        updated_at=order.updated_at,
    )
