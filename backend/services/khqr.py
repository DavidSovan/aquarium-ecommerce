import hashlib
import base64
import io
from datetime import datetime, timezone, timedelta
from typing import Optional

import qrcode
from qrcode.constants import ERROR_CORRECT_M
from bakong_khqr import KHQR
import os


# Initialize KHQR with the Bakong API token
_BAKONG_TOKEN = os.getenv("BAKONG_API_TOKEN", "")
_khqr = KHQR(_BAKONG_TOKEN)


def _generate_qr_image_base64(data: str) -> str:
    """Generate a QR code image and return it as a base64-encoded PNG data URI."""
    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    b64 = base64.b64encode(buffer.read()).decode("utf-8")
    return f"data:image/png;base64,{b64}"


def generate_khqr(
    bakong_account_id: str,
    amount: float,
    currency: str = "USD",
    merchant_name: Optional[str] = None,
    merchant_city: Optional[str] = None,
    bill_number: Optional[str] = None,
    qr_expire_minutes: int = 30,
) -> dict:
    """Generate a KHQR payment QR code using the official Bakong KHQR library."""
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=qr_expire_minutes)

    qr_string = _khqr.create_qr(
        account_id=bakong_account_id,
        merchant_name=merchant_name or "Store",
        merchant_city=merchant_city or "Phnom Penh",
        amount=amount,
        currency=currency,
        bill_number=bill_number,
    )

    md5_hash = hashlib.md5(qr_string.encode("utf-8")).hexdigest()

    qr_image_base64 = _generate_qr_image_base64(qr_string)

    return {
        "qr_string": qr_string,
        "qr_image_base64": qr_image_base64,
        "md5": md5_hash,
        "expires_at": expires_at,
        "bakong_account_id": bakong_account_id,
    }
