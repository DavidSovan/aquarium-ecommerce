import logging
import os
import httpx

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
TELEGRAM_BOT_USERNAME = os.getenv("TELEGRAM_BOT_USERNAME")


def send_telegram_message(message: str, chat_id: str = None) -> None:
    if not TELEGRAM_BOT_TOKEN:
        logger.warning("TELEGRAM_BOT_TOKEN not set, skipping notification")
        return

    target_chat_id = chat_id or TELEGRAM_CHAT_ID
    if not target_chat_id:
        logger.warning("No chat_id provided and TELEGRAM_CHAT_ID not set, skipping notification")
        return

    logger.info(f"Sending Telegram notification to chat {target_chat_id}...")
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": target_chat_id,
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


def set_webhook(webhook_url: str) -> bool:
    if not TELEGRAM_BOT_TOKEN:
        logger.warning("TELEGRAM_BOT_TOKEN not set, cannot set webhook")
        return False

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setWebhook"
    payload = {"url": webhook_url}

    try:
        with httpx.Client(timeout=10) as client:
            response = client.post(url, json=payload)
            data = response.json()
            if data.get("ok"):
                logger.info(f"Telegram webhook set to {webhook_url}")
                return True
            else:
                logger.error(f"Failed to set webhook: {data}")
                return False
    except Exception as e:
        logger.error(f"Failed to set webhook: {e}")
        return False


def format_order_confirmation(order, order_items, customer) -> str:
    lines = [
        "<b>🎉 Order Confirmed!</b>",
        "",
        f"<b>Order:</b> {order.order_number}",
        f"<b>Status:</b> {order.order_status}",
        f"<b>Payment:</b> {order.payment_status}",
        "",
        "<b>Items:</b>",
    ]

    for item in order_items:
        lines.append(
            f"  • {item.product_name} × {item.quantity} — "
            f"${item.total_price:.2f}"
        )

    if order.coupon_code:
        lines.append(f"<b>Coupon:</b> {order.coupon_code} (-${order.coupon_discount:.2f})")

    lines.append("")
    lines.append(f"<b>Total:</b> ${order.total:.2f}")
    lines.append("")
    lines.append("We'll notify you when your order status changes.")

    return "\n".join(lines)


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


def format_order_status_notification(order, old_status, customer) -> str:
    emoji = {"processing": "✅", "shipped": "🚚", "delivered": "📦", "cancelled": "❌"}.get(
        order.order_status, "📋"
    )
    lines = [
        f"{emoji} <b>Order Status Updated</b>",
        "",
        f"<b>Order:</b> {order.order_number}",
        f"<b>Customer:</b> {' '.join(p for p in [customer.first_name, customer.last_name] if p) or 'N/A'}",
        f"<b>Status:</b> {old_status} → {order.order_status}",
        f"<b>Payment:</b> {order.payment_status}",
    ]

    if order.order_status == "processing":
        lines.append("")
        lines.append("Your order has been confirmed and is being processed.")

    lines.append("")
    lines.append(f"<b>Total:</b> ${order.total:.2f}")

    return "\n".join(lines)


def format_order_status_for_customer(order, old_status) -> str:
    emoji = {"pending": "⏳", "processing": "✅", "shipped": "🚚", "delivered": "📦", "cancelled": "❌"}.get(
        order.order_status, "📋"
    )
    lines = [
        f"{emoji} <b>Order Update</b>",
        "",
        f"<b>Order:</b> {order.order_number}",
        f"<b>Status:</b> {old_status} → {order.order_status}",
        f"<b>Payment:</b> {order.payment_status}",
    ]

    if order.order_status == "shipped":
        lines.append("")
        lines.append("Your order is on its way!")
    elif order.order_status == "delivered":
        lines.append("")
        lines.append("Your order has been delivered. Enjoy!")
    elif order.order_status == "cancelled":
        lines.append("")
        lines.append("Your order has been cancelled. If you paid, a refund has been issued.")
    elif order.order_status == "processing":
        lines.append("")
        lines.append("Your order is being processed.")

    lines.append("")
    lines.append(f"<b>Total:</b> ${order.total:.2f}")

    return "\n".join(lines)
