from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query

from websocket.connection_manager import manager
from websocket.websocket_auth import get_user_info_from_token

router = APIRouter()


@router.websocket("/ws/orders")
async def websocket_orders(websocket: WebSocket, token: str = Query(...)):
    info = get_user_info_from_token(token)
    if info is None:
        await websocket.close(code=4001, reason="Invalid or expired token")
        return

    user_id, role = info
    await manager.connect(user_id, websocket, role)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await manager.disconnect(user_id, websocket, role)
    except Exception:
        await manager.disconnect(user_id, websocket, role)
