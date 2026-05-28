import asyncio
import logging
from typing import Dict, List, Optional
from fastapi import WebSocket

logger = logging.getLogger(__name__)

ADMIN_CHANNEL = "__admin__"


class ConnectionManager:
    def __init__(self):
        self._connections: Dict[str, List[WebSocket]] = {}
        self._loop: asyncio.AbstractEventLoop = None

    def set_loop(self, loop: asyncio.AbstractEventLoop) -> None:
        self._loop = loop

    async def connect(self, user_id: str, websocket: WebSocket, role: Optional[str] = None) -> None:
        await websocket.accept()
        if user_id not in self._connections:
            self._connections[user_id] = []
        self._connections[user_id].append(websocket)

        if role in ("admin", "staff"):
            if ADMIN_CHANNEL not in self._connections:
                self._connections[ADMIN_CHANNEL] = []
            self._connections[ADMIN_CHANNEL].append(websocket)

        logger.info(
            f"WebSocket connected: user={user_id}, role={role or 'N/A'}, "
            f"total connections={len(self._connections[user_id])}"
        )

    async def disconnect(self, user_id: str, websocket: WebSocket, role: Optional[str] = None) -> None:
        if user_id in self._connections:
            self._connections[user_id] = [
                ws for ws in self._connections[user_id] if ws != websocket
            ]
            if not self._connections[user_id]:
                del self._connections[user_id]

        if role in ("admin", "staff") and ADMIN_CHANNEL in self._connections:
            self._connections[ADMIN_CHANNEL] = [
                ws for ws in self._connections[ADMIN_CHANNEL] if ws != websocket
            ]
            if not self._connections[ADMIN_CHANNEL]:
                del self._connections[ADMIN_CHANNEL]

        logger.info(f"WebSocket disconnected: user={user_id}")

    def broadcast_to_user(self, user_id: str, message: dict) -> None:
        if user_id not in self._connections:
            return
        disconnected = []
        for ws in self._connections[user_id]:
            try:
                coro = ws.send_json(message)
                if self._loop and self._loop.is_running():
                    asyncio.run_coroutine_threadsafe(coro, self._loop)
            except Exception:
                disconnected.append(ws)
        for ws in disconnected:
            try:
                self._connections[user_id].remove(ws)
            except ValueError:
                pass
        if user_id in self._connections and not self._connections[user_id]:
            del self._connections[user_id]

    def broadcast_to_admins(self, message: dict) -> None:
        if ADMIN_CHANNEL not in self._connections:
            return
        disconnected = []
        for ws in self._connections[ADMIN_CHANNEL]:
            try:
                coro = ws.send_json(message)
                if self._loop and self._loop.is_running():
                    asyncio.run_coroutine_threadsafe(coro, self._loop)
            except Exception:
                disconnected.append(ws)
        for ws in disconnected:
            try:
                self._connections[ADMIN_CHANNEL].remove(ws)
            except ValueError:
                pass
        if ADMIN_CHANNEL in self._connections and not self._connections[ADMIN_CHANNEL]:
            del self._connections[ADMIN_CHANNEL]

    def get_connection_count(self, user_id: str) -> int:
        return len(self._connections.get(user_id, []))


manager = ConnectionManager()
