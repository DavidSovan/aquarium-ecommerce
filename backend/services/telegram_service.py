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


def _format_delivery_info(order) -> str:
    parts = []
    if order.preferred_delivery_date:
        parts.append(f"📅 {order.preferred_delivery_date}")
    if order.delivery_slot:
        parts.append(f"🕐 {order.delivery_slot.name} ({order.delivery_slot.start_time.strftime('%H:%M')} - {order.delivery_slot.end_time.strftime('%H:%M')})")
    return "\n".join(parts) if parts else ""


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

    delivery_info = _format_delivery_info(order)
    if delivery_info:
        lines.append("")
        lines.append("<b>Delivery Schedule:</b>")
        lines.append(delivery_info)

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

    delivery_info = _format_delivery_info(order)
    if delivery_info:
        lines.append("<b>Delivery Schedule:</b>")
        lines.append(delivery_info)
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

    delivery_info = _format_delivery_info(order)
    if delivery_info:
        lines.append("")
        lines.append("<b>Delivery Schedule:</b>")
        lines.append(delivery_info)

    lines.append("")
    lines.append(f"<b>Total:</b> ${order.total:.2f}")

    return "\n".join(lines)


def format_driver_assigned_notification(order, driver) -> str:
    driver_name = ' '.join(p for p in [driver.first_name, driver.last_name] if p) or driver.email
    lines = [
        "<b>🚚 Driver Assigned!</b>",
        "",
        f"<b>Order:</b> {order.order_number}",
        f"<b>Driver:</b> {driver_name}",
        "",
        "Your order has been assigned to a delivery driver.",
        "They will deliver your order soon.",
    ]

    if order.preferred_delivery_date:
        lines.append("")
        lines.append(f"<b>Scheduled Delivery:</b> {order.preferred_delivery_date}")
        if order.delivery_slot:
            lines.append(f"<b>Slot:</b> {order.delivery_slot.name} ({order.delivery_slot.start_time.strftime('%H:%M')} - {order.delivery_slot.end_time.strftime('%H:%M')})")

    return "\n".join(lines)


def format_payment_success_notification(order) -> str:
    lines = [
        "<b>✅ Payment Received!</b>",
        "",
        f"<b>Order:</b> {order.order_number}",
        f"<b>Amount:</b> ${order.total:.2f}",
        f"<b>Status:</b> Paid",
    ]
    if order.payment_reference:
        lines.append(f"<b>Reference:</b> {order.payment_reference}")
    return "\n".join(lines)


def format_payment_failed_notification(order, reason: str) -> str:
    lines = [
        "<b>❌ Payment Failed</b>",
        "",
        f"<b>Order:</b> {order.order_number}",
        f"<b>Amount:</b> ${order.total:.2f}",
        f"<b>Reason:</b> {reason}",
    ]
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

    delivery_info = _format_delivery_info(order)
    if delivery_info:
        lines.append("")
        lines.append("<b>Delivery Schedule:</b>")
        lines.append(delivery_info)

    lines.append("")
    lines.append(f"<b>Total:</b> ${order.total:.2f}")

    return "\n".join(lines)
