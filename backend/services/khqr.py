import hashlib
from datetime import datetime, timezone, timedelta
from typing import Optional


def crc16(data: bytes) -> int:
    crc = 0xFFFF
    for byte in data:
        crc ^= byte << 8
        for _ in range(8):
            if crc & 0x8000:
                crc = (crc << 1) ^ 0x1021
            else:
                crc <<= 1
            crc &= 0xFFFF
    return crc ^ 0xFFFF


def _tlv(tag: str, value: str) -> str:
    length = len(value)
    return f"{tag}{length:02d}{value}"


def _tlv_nested(tag: str, sub_tlvs: list) -> str:
    inner = "".join(sub_tlvs)
    length = len(inner)
    return f"{tag}{length:02d}{inner}"


def generate_khqr(
    bakong_account_id: str,
    amount: float,
    currency: str = "840",
    merchant_name: Optional[str] = None,
    merchant_city: Optional[str] = None,
    bill_number: Optional[str] = None,
    qr_expire_minutes: int = 10,
) -> dict:
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=qr_expire_minutes)

    amount_str = f"{amount:.2f}"

    payload = _tlv("00", "01")
    payload += _tlv("01", "11")

    merchant_account = _tlv("00", "com.bakong.bankid")
    merchant_account += _tlv("01", bakong_account_id)
    payload += _tlv_nested("30", [merchant_account])

    currency_code = currency
    payload += _tlv("53", currency_code)
    payload += _tlv("54", amount_str)
    payload += _tlv("58", "KH")

    if merchant_name:
        payload += _tlv("59", merchant_name)
    if merchant_city:
        payload += _tlv("60", merchant_city)

    if bill_number:
        additional = _tlv("01", bill_number)
        payload += _tlv_nested("62", [additional])

    payload += "6304"

    crc_val = crc16(payload.encode("utf-8"))
    crc_hex = f"{crc_val:04X}"
    qr_string = payload + crc_hex

    md5_hash = hashlib.md5(qr_string.encode("utf-8")).hexdigest()

    return {
        "qr_string": qr_string,
        "md5": md5_hash,
        "expires_at": expires_at,
        "bakong_account_id": bakong_account_id,
    }
