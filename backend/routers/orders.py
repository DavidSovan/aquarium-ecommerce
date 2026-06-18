from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from config.database import get_db
from models.order import Order, OrderItem
from models.product import Product
from models.user import User
from schemas.order import (
    OrderResponse,
    OrderListResponse,
    UpdateOrderStatusRequest,
    CancelOrderResponse,
    OrderItemResponse,
    AssignDriverRequest,
)
from dependencies.auth import get_current_user, require_role
from services.telegram_service import send_telegram_message, format_order_cancelled_notification, format_order_status_notification, format_order_status_for_customer, format_driver_assigned_notification
from websocket.connection_manager import manager
from websocket.events import build_order_status_event, build_driver_assigned_event

router = APIRouter(prefix="/orders", tags=["orders"])

VALID_ORDER_STATUSES = {"pending", "processing", "shipped", "delivered", "cancelled"}
VALID_PAYMENT_STATUSES = {"pending", "paid", "failed", "refunded"}
VALID_PAYMENT_METHODS = {"COD", "ONLINE_PAYMENT"}


@router.get("", response_model=OrderListResponse)
def list_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search by order number"),
    status: Optional[str] = Query(None, description="Filter by order status"),
    payment_status: Optional[str] = Query(None, description="Filter by payment status"),
    payment_method: Optional[str] = Query(None, description="Filter by payment method"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Order)

    if current_user.role not in ("admin", "staff"):
        if current_user.role == "driver":
            query = query.filter(Order.driver_id == current_user.id)
        else:
            query = query.filter(Order.user_id == current_user.id)

    if search:
        query = query.filter(Order.order_number.ilike(f"%{search}%"))
    if status:
        query = query.filter(Order.order_status == status)
    if payment_status:
        query = query.filter(Order.payment_status == payment_status)
    if payment_method:
        query = query.filter(Order.payment_method == payment_method)

    total = query.count()
    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

    user_ids = set(o.user_id for o in orders)
    users = {u.id: u for u in db.query(User).filter(User.id.in_(user_ids)).all()} if user_ids else {}

    return OrderListResponse(
        total=total,
        items=[_order_to_response(order, users.get(order.user_id)) for order in orders]
    )


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if order_id.isdigit():
        order = db.query(Order).filter(Order.id == int(order_id)).first()
    else:
        order = db.query(Order).filter(Order.order_number == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")
    
    if order.user_id != current_user.id and current_user.role not in ("admin", "staff") and order.driver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
    customer = db.query(User).filter(User.id == order.user_id).first()
    return _order_to_response(order, customer)

@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: str,
    data: UpdateOrderStatusRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    if order_id.isdigit():
        order = db.query(Order).filter(Order.id == int(order_id)).first()
    else:
        order = db.query(Order).filter(Order.order_number == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")

    old_status = order.order_status
    if data.order_status:
        if data.order_status not in VALID_ORDER_STATUSES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid order status. Valid statuses: {', '.join(VALID_ORDER_STATUSES)}"
            )
        order.order_status = data.order_status

    if data.payment_status:
        if data.payment_status not in VALID_PAYMENT_STATUSES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid payment status. Valid statuses: {', '.join(VALID_PAYMENT_STATUSES)}"
            )
        order.payment_status = data.payment_status

    if data.order_status or data.payment_status:
        order.is_new = False

    db.commit()
    db.refresh(order)

    customer = db.query(User).filter(User.id == order.user_id).first()
    if data.order_status and data.order_status != old_status:
        msg = format_order_status_notification(order, old_status, customer or current_user)
        background_tasks.add_task(send_telegram_message, msg)
        event = build_order_status_event(order.id, order.order_number, old_status, order.order_status, order.payment_status)
    background_tasks.add_task(manager.broadcast_to_user, str(order.user_id), event)
    background_tasks.add_task(manager.broadcast_to_admins, event)
    if order.driver_id:
        background_tasks.add_task(manager.broadcast_to_user, str(order.driver_id), event)

    if customer and customer.telegram_chat_id:
            user_msg = format_order_status_for_customer(order, old_status)
            background_tasks.add_task(send_telegram_message, user_msg, customer.telegram_chat_id)

    return _order_to_response(order, customer)

@router.delete("/{order_id}", response_model=CancelOrderResponse)
def cancel_order(
    order_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if order_id.isdigit():
        order = db.query(Order).filter(Order.id == int(order_id)).first()
    else:
        order = db.query(Order).filter(Order.order_number == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")

    if order.user_id != current_user.id and current_user.role not in ("admin", "staff"):
        raise HTTPException(status_code=403, detail="Not authorized to cancel this order")

    if order.order_status == "cancelled":
        raise HTTPException(status_code=400, detail="Order is already cancelled")

    if order.order_status in ("shipped", "delivered"):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel order with status '{order.order_status}'"
        )

    old_status = order.order_status
    refunded_stock = {}
    items_snapshot = []
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.stock_quantity += item.quantity
            refunded_stock[item.product_name] = item.quantity
        items_snapshot.append({
            "product_name": item.product_name,
            "quantity": item.quantity,
            "total_price": item.total_price,
        })

    order.order_status = "cancelled"
    if order.payment_status == "paid":
        order.payment_status = "refunded"

    db.commit()

    customer = db.query(User).filter(User.id == order.user_id).first()
    msg = format_order_cancelled_notification(order, items_snapshot, customer or current_user)
    background_tasks.add_task(send_telegram_message, msg)
    event = build_order_status_event(order.id, order.order_number, old_status, order.order_status, order.payment_status)
    background_tasks.add_task(manager.broadcast_to_user, str(order.user_id), event)
    background_tasks.add_task(manager.broadcast_to_admins, event)

    if customer and customer.telegram_chat_id:
        user_msg = format_order_status_for_customer(order, old_status)
        background_tasks.add_task(send_telegram_message, user_msg, customer.telegram_chat_id)

    return CancelOrderResponse(
        message="Order cancelled successfully",
        order_id=order.id,
        refunded_stock=refunded_stock
    )


@router.post("/{order_id}/confirm-delivery", response_model=OrderResponse)
def confirm_delivery(
    order_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if order_id.isdigit():
        order = db.query(Order).filter(Order.id == int(order_id)).first()
    else:
        order = db.query(Order).filter(Order.order_number == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")

    if order.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to confirm this order. It belongs to another user."
        )

    if order.order_status == "delivered":
        customer = db.query(User).filter(User.id == order.user_id).first()
        return _order_to_response(order, customer)

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
    if order.driver_id:
        background_tasks.add_task(manager.broadcast_to_user, str(order.driver_id), event)

    if customer and customer.telegram_chat_id:
        user_msg = format_order_status_for_customer(order, old_status)
        background_tasks.add_task(send_telegram_message, user_msg, customer.telegram_chat_id)

    return _order_to_response(order, customer)


@router.put("/{order_id}/assign-driver", response_model=OrderResponse)
def assign_driver(
    order_id: str,
    data: AssignDriverRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    if order_id.isdigit():
        order = db.query(Order).filter(Order.id == int(order_id)).first()
    else:
        order = db.query(Order).filter(Order.order_number == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")

    if order.order_status not in ("processing", "shipped"):
        raise HTTPException(
            status_code=400,
            detail="Can only assign driver to orders with status 'processing' or 'shipped'"
        )

    driver = db.query(User).filter(User.id == data.driver_id, User.role == "driver", User.is_active == True).first()
    if not driver:
        raise HTTPException(status_code=400, detail="Driver not found or inactive")

    old_driver_id = order.driver_id
    order.driver_id = driver.id
    db.commit()
    db.refresh(order)

    customer = db.query(User).filter(User.id == order.user_id).first()
    if customer and customer.telegram_chat_id:
        msg = format_driver_assigned_notification(order, driver)
        background_tasks.add_task(send_telegram_message, msg, customer.telegram_chat_id)

    driver_name = ' '.join(p for p in [driver.first_name, driver.last_name] if p) or driver.email
    event = build_driver_assigned_event(
        order_id=order.id,
        order_number=order.order_number,
        driver_id=driver.id,
        driver_name=driver_name,
        customer_name=customer.first_name or customer.email if customer else None,
        total=order.total,
        created_at=order.created_at,
    )
    background_tasks.add_task(manager.broadcast_to_user, driver.id, event)
    background_tasks.add_task(manager.broadcast_to_admins, event)

    return _order_to_response(order, customer)


def _order_to_response(order: Order, user: Optional[User] = None) -> OrderResponse:
    customer_name = None
    if user:
        first = (user.first_name or "").strip()
        last = (user.last_name or "").strip()
        customer_name = f"{first} {last}".strip() if first or last else user.email
    return OrderResponse(
        id=order.id,
        order_number=order.order_number,
        user_id=order.user_id,
        is_new=bool(order.is_new),
        customer_email=user.email if user else None,
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
        shipping_address_snapshot=order.shipping_address_snapshot,
        billing_address_id=order.billing_address_id,
        notes=order.notes,
        preferred_delivery_date=order.preferred_delivery_date,
        delivery_slot_id=order.delivery_slot_id,
        delivery_slot_name=order.delivery_slot.name if order.delivery_slot else None,
        driver_id=order.driver_id,
        driver_name=f"{order.driver.first_name} {order.driver.last_name}".strip() if order.driver else None,
        payment_qr=order.payment_qr,
        qr_image_base64=None,
        khqr_md5=order.khqr_md5,
        payment_expires_at=order.payment_expires_at,
        bakong_account_id=order.bakong_account_id,
        payment_reference=order.payment_reference,
        paid_at=order.paid_at,
        payment_failure_reason=order.payment_failure_reason,
        created_at=order.created_at,
        updated_at=order.updated_at,
    )
