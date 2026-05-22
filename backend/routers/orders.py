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
)
from dependencies.auth import get_current_user, require_role
from services.telegram_service import send_telegram_message, format_order_cancelled_notification

router = APIRouter(prefix="/orders", tags=["orders"])

VALID_ORDER_STATUSES = {"pending", "processing", "shipped", "delivered", "cancelled"}
VALID_PAYMENT_STATUSES = {"pending", "paid", "failed", "refunded"}


@router.get("", response_model=OrderListResponse)
def list_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role in ("admin", "staff"):
        total = db.query(Order).count()
        orders = db.query(Order).order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    else:
        total = db.query(Order).filter(Order.user_id == current_user.id).count()
        orders = db.query(Order).filter(
            Order.user_id == current_user.id
        ).order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

    return OrderListResponse(
        total=total,
        items=[_order_to_response(order) for order in orders]
    )


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user.id and current_user.role not in ("admin", "staff"):
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
    return _order_to_response(order)


@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    data: UpdateOrderStatusRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

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

    db.commit()
    db.refresh(order)
    return _order_to_response(order)


@router.delete("/{order_id}", response_model=CancelOrderResponse)
def cancel_order(
    order_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.user_id != current_user.id and current_user.role not in ("admin", "staff"):
        raise HTTPException(status_code=403, detail="Not authorized to cancel this order")

    if order.order_status == "cancelled":
        raise HTTPException(status_code=400, detail="Order is already cancelled")

    if order.order_status in ("shipped", "delivered"):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel order with status '{order.order_status}'"
        )

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

    return CancelOrderResponse(
        message="Order cancelled successfully",
        order_id=order.id,
        refunded_stock=refunded_stock
    )


def _order_to_response(order: Order) -> OrderResponse:
    return OrderResponse(
        id=order.id,
        order_number=order.order_number,
        user_id=order.user_id,
        order_status=order.order_status,
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
        ) for item in order.items],
        shipping_address_id=order.shipping_address_id,
        billing_address_id=order.billing_address_id,
        notes=order.notes,
        created_at=order.created_at,
        updated_at=order.updated_at,
    )
