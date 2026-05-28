from typing import Optional, Tuple
from jose import JWTError, jwt
from config.settings import JWT_SECRET, JWT_ALGORITHM


def get_user_id_from_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        return user_id
    except JWTError:
        return None


def get_user_info_from_token(token: str) -> Optional[Tuple[str, str]]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        role: str = payload.get("role", "customer")
        if user_id is None:
            return None
        return (user_id, role)
    except JWTError:
        return None
