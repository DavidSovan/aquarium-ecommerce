from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from config.database import get_db
from models.order import Order
from models.user import User
from schemas.order import OrderResponse, OrderItemResponse
from dependencies.auth import get_current_user, require_role
from services.payment_service import process_payment_check, regenerate_payment_qr
from services.khqr import _generate_qr_image_base64


def _ensure_utc(dt):
    """Stamp UTC on naive datetimes so JSON includes '+00:00'."""
    if isinstance(dt, datetime) and dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


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


@router.post("/{order_id}/retry-payment")
def retry_payment(
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

    if order.payment_method != "ONLINE_PAYMENT":
        raise HTTPException(status_code=400, detail="Not an online payment order")

    result = regenerate_payment_qr(order, db)
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["detail"])

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

    qr_image = None
    if order.payment_qr:
        qr_image = _generate_qr_image_base64(order.payment_qr)

    return {
        "payment_status": order.payment_status,
        "payment_method": order.payment_method,
        "payment_reference": order.payment_reference,
        "payment_qr": order.payment_qr,
        "qr_image_base64": qr_image,
        "khqr_md5": order.khqr_md5,
        "payment_expires_at": _ensure_utc(order.payment_expires_at),
        "paid_at": _ensure_utc(order.paid_at),
        "payment_failure_reason": order.payment_failure_reason,
    }
