import logging
import os
import httpx

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")


def send_telegram_message(message: str) -> None:
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        logger.warning("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set, skipping notification")
        return

    logger.info("Sending Telegram notification...")
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "HTML",
    }

    try:
        with httpx.Client(timeout=10) as client:
            response = client.post(url, json=payload)
            response.raise_for_status()
        logger.info(f"Telegram notification sent (status {response.status_code})")
    except Exception as e:
        logger.error(f"Failed to send Telegram notification: {e}")


def format_order_notification(order, order_items, customer, shipping_address) -> str:
    lines = [
        "<b>🛒 New Order Received!</b>",
        "",
        f"<b>Order:</b> {order.order_number}",
        f"<b>Customer:</b> {' '.join(p for p in [customer.first_name, customer.last_name] if p) or 'N/A'}",
        f"<b>Phone:</b> {shipping_address.phone}",
        f"<b>Payment:</b> {order.payment_status}",
        "",
    ]

    lines.append("<b>Shipping Address:</b>")
    addr_parts = [
        shipping_address.address_line,
        shipping_address.district,
        shipping_address.city,
        shipping_address.country,
        shipping_address.postal_code,
    ]
    lines.append(", ".join(p for p in addr_parts if p))
    lines.append("")

    lines.append("<b>Products:</b>")
    for item in order_items:
        lines.append(
            f"  • {item.product_name} × {item.quantity} — "
            f"${item.total_price:.2f}"
        )

    if order.coupon_code:
        lines.append(f"<b>Coupon:</b> {order.coupon_code} (-${order.coupon_discount:.2f})")

    lines.append("")
    lines.append(f"<b>Total:</b> ${order.total:.2f}")

    return "\n".join(lines)


def format_order_cancelled_notification(order, items_snapshot, customer) -> str:
    lines = [
        "<b>❌ Order Cancelled!</b>",
        "",
        f"<b>Order:</b> {order.order_number}",
        f"<b>Customer:</b> {' '.join(p for p in [customer.first_name, customer.last_name] if p) or 'N/A'}",
        f"<b>Payment:</b> {order.payment_status}",
        "",
        "<b>Cancelled Items:</b>",
    ]

    for item in items_snapshot:
        lines.append(
            f"  • {item['product_name']} × {item['quantity']} — "
            f"${item['total_price']:.2f}"
        )

    if order.coupon_code:
        lines.append(f"<b>Coupon:</b> {order.coupon_code} (-${order.coupon_discount:.2f})")

    lines.append("")
    lines.append(f"<b>Refund Total:</b> ${order.total:.2f}")

    return "\n".join(lines)
