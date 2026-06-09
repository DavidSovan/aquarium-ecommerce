import os
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from dependencies.auth import require_role
from config.database import get_db
from models.user import User
from services.reset_database import reset_database

router = APIRouter(prefix="/admin", tags=["admin"])

_RATE_LIMIT_WINDOW = 60
_RATE_LIMIT_MAX = 3
_rate_limit_store: dict[str, list[float]] = {}


def _check_rate_limit(admin_id: str):
    now = datetime.now(timezone.utc).timestamp()
    if admin_id not in _rate_limit_store:
        _rate_limit_store[admin_id] = []
    timestamps = _rate_limit_store[admin_id]
    timestamps[:] = [t for t in timestamps if now - t < _RATE_LIMIT_WINDOW]
    if len(timestamps) >= _RATE_LIMIT_MAX:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Max {_RATE_LIMIT_MAX} requests per {_RATE_LIMIT_WINDOW}s.",
        )
    timestamps.append(now)


class ResetDatabaseRequest(BaseModel):
    confirmation: str
    backup: bool = False


class ResetDatabaseResponse(BaseModel):
    success: bool
    message: str
    backup_path: str | None = None


@router.post("/reset-database", response_model=ResetDatabaseResponse)
def reset_database_endpoint(
    body: ResetDatabaseRequest,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    if os.getenv("ALLOW_DB_RESET", "false").lower() not in ("true", "1", "yes"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Database reset is disabled. Set ALLOW_DB_RESET=true in environment variables.",
        )

    if body.confirmation != "RESET":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Confirmation must be exactly 'RESET'.",
        )

    _check_rate_limit(current_user.id)

    try:
        result = reset_database(current_user.id, backup=body.backup)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database reset failed: {str(e)}",
        )
