import logging
import os
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from models.order import Order
from models.user import User
from services.khqr import generate_khqr
from services.bakong_service import check_transaction_by_md5
from websocket.connection_manager import manager
from websocket.events import build_payment_event
from services.telegram_service import (
    format_payment_success_notification,
    format_payment_failed_notification,
    send_telegram_message,
)

logger = logging.getLogger(__name__)

BAKONG_ACCOUNT_ID = os.getenv("BAKONG_ACCOUNT_ID", "sovan_david@bkt")


def generate_order_khqr(order: Order) -> dict:
    result = generate_khqr(
        bakong_account_id=BAKONG_ACCOUNT_ID,
        amount=order.total,
        merchant_name="Fashion Store",
        bill_number=order.order_number,
    )
    return result


def regenerate_payment_qr(order: Order, db: Session) -> dict:
    if order.payment_status == "paid":
        return {"status": "error", "detail": "Payment already completed"}

    if order.payment_status not in ("failed", "pending"):
        return {"status": "error", "detail": "Cannot regenerate QR for this order"}

    try:
        khqr_result = generate_order_khqr(order)
    except Exception as e:
        logger.error(f"Failed to generate QR for order {order.id}: {e}")
        return {"status": "error", "detail": f"Failed to generate QR: {e}"}

    order.payment_status = "pending"
    order.payment_failure_reason = None
    order.bakong_account_id = khqr_result["bakong_account_id"]
    order.khqr_md5 = khqr_result["md5"]
    order.payment_qr = khqr_result["qr_string"]
    order.payment_expires_at = khqr_result["expires_at"]
    db.commit()
    db.refresh(order)

    return {
        "status": "ok",
        "payment_qr": order.payment_qr,
        "qr_image_base64": khqr_result["qr_image_base64"],
        "khqr_md5": order.khqr_md5,
        "payment_expires_at": order.payment_expires_at,
        "bakong_account_id": order.bakong_account_id,
    }


def process_payment_check(order_id: int, db: Session) -> dict:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        return {"status": "error", "detail": "Order not found"}

    if order.payment_status == "paid":
        return {"status": "paid", "detail": "Payment already completed"}

    if order.payment_status == "failed":
        return {"status": "failed", "detail": "Payment previously failed"}

    now = datetime.now(timezone.utc)

    payment_expires_at = order.payment_expires_at
    if payment_expires_at is not None and payment_expires_at.tzinfo is None:
        payment_expires_at = payment_expires_at.replace(tzinfo=timezone.utc)

    if payment_expires_at and now > payment_expires_at:
        if order.payment_status not in ("paid", "failed"):
            _fail_payment(order, "QR code expired", db)
        return {"status": "failed", "detail": "QR code expired"}

    if not order.khqr_md5:
        return {"status": "pending", "detail": "No QR generated for this order"}

    bakong_resp = check_transaction_by_md5(md5=order.khqr_md5, amount=order.total)

    response_code = bakong_resp.get("responseCode")
    error_code = bakong_resp.get("errorCode")

    if response_code == 0:
        _succeed_payment(order, bakong_resp, db)
        return {"status": "paid", "detail": "Payment confirmed", "transaction": bakong_resp}

    if error_code not in (None, 1):
        _fail_payment(order, bakong_resp.get("errorMessage", "Bakong verification failed"), db)
        return {"status": "failed", "detail": bakong_resp.get("errorMessage", "Payment verification failed")}

    return {"status": "pending", "detail": "Awaiting payment"}


def _succeed_payment(order: Order, bakong_resp: dict, db: Session) -> None:
    now = datetime.now(timezone.utc)
    order.payment_status = "paid"
    order.order_status = "processing"
    order.paid_at = now
    order.payment_reference = str(bakong_resp.get("id", ""))
    db.commit()

    try:
        customer = db.query(User).filter(User.id == order.user_id).first()
        msg = format_payment_success_notification(order)
        send_telegram_message(msg)

        if customer and customer.telegram_chat_id:
            user_msg = f"Your payment for order {order.order_number} has been confirmed!"
            send_telegram_message(user_msg, customer.telegram_chat_id)

        event = build_payment_event(
            order_id=order.id,
            order_number=order.order_number,
            status="paid",
        )
        manager.broadcast_to_user(str(order.user_id), event)
        manager.broadcast_to_admins(event)
    except Exception as e:
        logger.error(f"Payment success notification error: {e}")


def _fail_payment(order: Order, reason: str, db: Session) -> None:
    order.payment_status = "failed"
    order.payment_failure_reason = reason
    db.commit()

    try:
        customer = db.query(User).filter(User.id == order.user_id).first()
        msg = format_payment_failed_notification(order, reason)
        send_telegram_message(msg)

        if customer and customer.telegram_chat_id:
            user_msg = f"Payment for order {order.order_number} failed: {reason}"
            send_telegram_message(user_msg, customer.telegram_chat_id)

        event = build_payment_event(
            order_id=order.id,
            order_number=order.order_number,
            status="failed",
            reason=reason,
        )
        manager.broadcast_to_user(str(order.user_id), event)
        manager.broadcast_to_admins(event)
    except Exception as e:
        logger.error(f"Payment failure notification error: {e}")
