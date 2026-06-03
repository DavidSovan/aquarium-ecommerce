import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from config.database import get_db
from models.user import User
from dependencies.auth import get_current_user
from services.telegram_service import send_telegram_message
from pydantic import BaseModel


def _utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)

router = APIRouter(prefix="/telegram", tags=["telegram"])


class LinkTokenResponse(BaseModel):
    token: str
    bot_username: str
    expires_in_minutes: int


class TelegramStatusResponse(BaseModel):
    connected: bool
    chat_id: str | None = None


@router.get("/status", response_model=TelegramStatusResponse)
def telegram_status(
    current_user: User = Depends(get_current_user),
):
    return TelegramStatusResponse(
        connected=bool(current_user.telegram_chat_id),
        chat_id=current_user.telegram_chat_id,
    )


@router.post("/link-token", response_model=LinkTokenResponse)
def generate_link_token(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from services.telegram_service import TELEGRAM_BOT_USERNAME

    if current_user.telegram_chat_id:
        raise HTTPException(status_code=400, detail="Telegram already connected")

    if current_user.telegram_link_token and current_user.telegram_link_token_expires_at:
        if current_user.telegram_link_token_expires_at > _utcnow():
            return LinkTokenResponse(
                token=current_user.telegram_link_token,
                bot_username=TELEGRAM_BOT_USERNAME or "YourBot",
                expires_in_minutes=15,
            )

    token = secrets.token_urlsafe(32)
    current_user.telegram_link_token = token
    current_user.telegram_link_token_expires_at = _utcnow() + timedelta(minutes=15)
    db.commit()

    return LinkTokenResponse(
        token=token,
        bot_username=TELEGRAM_BOT_USERNAME or "YourBot",
        expires_in_minutes=15,
    )


@router.post("/webhook")
async def telegram_webhook(
    request: Request,
    db: Session = Depends(get_db),
):
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    message = body.get("message", {})
    text = message.get("text", "")
    chat_id = str(message.get("chat", {}).get("id", ""))

    if not text or not chat_id:
        return {"ok": True}

    if not text.startswith("/start"):
        return {"ok": True}

    parts = text.split(maxsplit=1)
    if len(parts) < 2:
        return {"ok": True}

    token = parts[1].strip()
    if not token:
        return {"ok": True}

    user = db.query(User).filter(
        User.telegram_link_token == token,
        User.telegram_link_token_expires_at > _utcnow(),
    ).first()

    if not user:
        send_telegram_message(
            chat_id=chat_id,
            message="This link has expired or is invalid. Please request a new link from the website.",
        )
        return {"ok": True}

    user.telegram_chat_id = chat_id
    user.telegram_link_token = None
    user.telegram_link_token_expires_at = None
    db.commit()

    send_telegram_message(
        chat_id=chat_id,
        message="✅ Your Telegram account has been successfully connected! You will now receive order updates.",
    )

    return {"ok": True}
