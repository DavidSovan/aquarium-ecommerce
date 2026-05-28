from datetime import datetime, timezone
from typing import Optional

STATUS_LABELS = {
    "pending": "Pending",
    "processing": "Processing",
    "shipped": "Shipped",
    "delivered": "Delivered",
    "cancelled": "Cancelled",
}


def build_order_status_event(
    order_id: int,
    order_number: str,
    previous_status: Optional[str],
    current_status: str,
    payment_status: Optional[str] = None,
) -> dict:
    previous_label = STATUS_LABELS.get(previous_status, previous_status or "")
    current_label = STATUS_LABELS.get(current_status, current_status)
    message = (
        f"Order {order_number} updated from {previous_label} to {current_label}"
        if previous_status
        else f"Order {order_number} updated to {current_label}"
    )

    return {
        "event": "order_status_updated",
        "order_id": order_id,
        "order_number": order_number,
        "previous_status": previous_status,
        "current_status": current_status,
        "payment_status": payment_status,
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "message": message,
    }


def build_new_order_event(
    order_id: int,
    order_number: str,
    customer_name: Optional[str],
    total: float,
    created_at: datetime,
) -> dict:
    return {
        "event": "new_order",
        "order_id": order_id,
        "order_number": order_number,
        "customer_name": customer_name,
        "total": total,
        "created_at": created_at.isoformat() if hasattr(created_at, 'isoformat') else str(created_at),
    }
