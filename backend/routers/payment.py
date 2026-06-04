from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from config.database import get_db
from models.order import Order
from models.user import User
from schemas.order import OrderResponse, OrderItemResponse
from dependencies.auth import get_current_user, require_role
from services.payment_service import process_payment_check

router = APIRouter(prefix="/orders", tags=["payment"])


@router.post("/{order_id}/check-payment")
def check_payment(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if order_id.isdigit():
        order = db.query(Order).filter(Order.id == int(order_id)).first()
    else:
        order = db.query(Order).filter(Order.order_number == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.user_id != current_user.id and current_user.role not in ("admin", "staff"):
        raise HTTPException(status_code=403, detail="Not authorized")

    result = process_payment_check(order.id, db)
    return result


@router.get("/{order_id}/payment-status")
def get_payment_status(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if order_id.isdigit():
        order = db.query(Order).filter(Order.id == int(order_id)).first()
    else:
        order = db.query(Order).filter(Order.order_number == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.user_id != current_user.id and current_user.role not in ("admin", "staff"):
        raise HTTPException(status_code=403, detail="Not authorized")

    return {
        "payment_status": order.payment_status,
        "payment_method": order.payment_method,
        "payment_reference": order.payment_reference,
        "payment_qr": order.payment_qr,
        "khqr_md5": order.khqr_md5,
        "payment_expires_at": order.payment_expires_at,
        "paid_at": order.paid_at,
        "payment_failure_reason": order.payment_failure_reason,
    }
