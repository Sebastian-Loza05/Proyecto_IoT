from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.websocket import manager

router = APIRouter()

@router.websocket("/ws/sensor-readings")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Mantenemos la conexión viva
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
