from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from config.database import get_db
from models.order import Order
from models.user import User
from models.address import Address
from schemas.order import (
    OrderResponse,
    OrderListResponse,
    OrderItemResponse,
)
from dependencies.auth import get_current_user, require_role
from services.telegram_service import send_telegram_message, format_order_status_for_customer
from websocket.connection_manager import manager
from websocket.events import build_order_status_event, build_driver_assigned_event
from datetime import datetime, timezone

router = APIRouter(prefix="/driver", tags=["driver"])


@router.get("/orders", response_model=OrderListResponse)
def driver_list_orders(
    skip: int = 0,
    limit: int = 20,
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("driver")),
):
    query = db.query(Order).filter(Order.driver_id == current_user.id)

    if status:
        query = query.filter(Order.order_status == status)

    total = query.count()
    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

    return OrderListResponse(
        total=total,
        items=[_driver_order_response(order, db) for order in orders]
    )


@router.get("/orders/{order_id}", response_model=OrderResponse)
def driver_get_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("driver")),
):
    if order_id.isdigit():
        order = db.query(Order).filter(Order.id == int(order_id)).first()
    else:
        order = db.query(Order).filter(Order.order_number == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")

    if order.driver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this order")

    customer = db.query(User).filter(User.id == order.user_id).first()
    return _driver_order_response(order, db, customer)


@router.post("/orders/{order_id}/confirm-delivery", response_model=OrderResponse)
def driver_confirm_delivery(
    order_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("driver")),
):
    if order_id.isdigit():
        order = db.query(Order).filter(Order.id == int(order_id)).first()
    else:
        order = db.query(Order).filter(Order.order_number == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")

    if order.driver_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="This order is not assigned to you"
        )

    if order.order_status != "shipped":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot confirm delivery for order in '{order.order_status}' status. It must be 'shipped'."
        )

    old_status = order.order_status
    order.order_status = "delivered"
    if order.payment_status == "pending":
        order.payment_status = "paid"

    db.commit()
    db.refresh(order)

    customer = db.query(User).filter(User.id == order.user_id).first()
    event = build_order_status_event(order.id, order.order_number, old_status, order.order_status, order.payment_status)
    background_tasks.add_task(manager.broadcast_to_user, str(order.user_id), event)
    background_tasks.add_task(manager.broadcast_to_admins, event)
    background_tasks.add_task(manager.broadcast_to_user, str(current_user.id), event)

    if customer and customer.telegram_chat_id:
        user_msg = format_order_status_for_customer(order, old_status)
        background_tasks.add_task(send_telegram_message, user_msg, customer.telegram_chat_id)

    return _driver_order_response(order, db, customer)


def _driver_order_response(order: Order, db: Session, customer: User = None) -> OrderResponse:
    if not customer:
        customer = db.query(User).filter(User.id == order.user_id).first()

    customer_name = None
    if customer:
        first = (customer.first_name or "").strip()
        last = (customer.last_name or "").strip()
        customer_name = f"{first} {last}".strip() if first or last else customer.email

    return OrderResponse(
        id=order.id,
        order_number=order.order_number,
        user_id=order.user_id,
        is_new=bool(order.is_new),
        customer_email=customer.email if customer else None,
        customer_name=customer_name,
        order_status=order.order_status,
        payment_method=order.payment_method or "COD",
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
        notes=order.notes,
        preferred_delivery_date=order.preferred_delivery_date,
        delivery_slot_id=order.delivery_slot_id,
        delivery_slot_name=order.delivery_slot.name if order.delivery_slot else None,
        driver_id=order.driver_id,
        driver_name=f"{customer.first_name} {customer.last_name}".strip() if customer else None,
        payment_qr=order.payment_qr,
        khqr_md5=order.khqr_md5,
        payment_expires_at=order.payment_expires_at,
        bakong_account_id=order.bakong_account_id,
        payment_reference=order.payment_reference,
        paid_at=order.paid_at,
        payment_failure_reason=order.payment_failure_reason,
        created_at=order.created_at,
        updated_at=order.updated_at,
    )
