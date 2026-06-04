import os
import logging
from typing import Optional
import httpx

logger = logging.getLogger(__name__)

BAKONG_API_BASE = os.getenv("BAKONG_API_BASE_URL", "https://api-bakong.nbc.gov.kh")
BAKONG_API_TOKEN = os.getenv("BAKONG_API_TOKEN", "")


def _headers() -> dict:
    headers = {"Content-Type": "application/json"}
    if BAKONG_API_TOKEN:
        headers["Authorization"] = f"Bearer {BAKONG_API_TOKEN}"
    return headers


def check_transaction_by_md5(
    md5: str,
    amount: Optional[float] = None,
) -> dict:
    url = f"{BAKONG_API_BASE}/v1/check_transaction_by_md5"
    payload = {"md5": md5}
    if amount is not None:
        payload["amount"] = f"{amount:.2f}"

    try:
        with httpx.Client(timeout=15) as client:
            response = client.post(url, json=payload, headers=_headers())
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"Bakong API HTTP error: {e.response.status_code} - {e.response.text}")
        return {"errorCode": -1, "errorMessage": f"HTTP {e.response.status_code}"}
    except httpx.RequestError as e:
        logger.error(f"Bakong API request failed: {e}")
        return {"errorCode": -1, "errorMessage": str(e)}


def check_bakong_account(account_id: str) -> dict:
    url = f"{BAKONG_API_BASE}/v1/check_bakong_account"
    payload = {"bakongAccountID": account_id}

    try:
        with httpx.Client(timeout=15) as client:
            response = client.post(url, json=payload, headers=_headers())
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"Bakong API HTTP error: {e.response.status_code} - {e.response.text}")
        return {"errorCode": -1, "errorMessage": f"HTTP {e.response.status_code}"}
    except httpx.RequestError as e:
        logger.error(f"Bakong API request failed: {e}")
        return {"errorCode": -1, "errorMessage": str(e)}
