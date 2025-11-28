from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Request
from app.services.websocket import manager
from app.system.schemas import (
    ControllerData,
    ControllerResponse
)


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


@router.post("/controllers", response_model=ControllerResponse)
async def activate_controller(data: ControllerData, request: Request):
    topic_control = "invernadero/control"
    payload_json = data.model_dump_json()

    mqtt_client = request.app.state.mqtt

    try:
        print(f" [API] Enviando comando: {payload_json}")

        await mqtt_client.publish(topic_control, payload_json)

        return ControllerResponse(
            success=True,
            message="Comando enviado correctamente al controlador"
        )

    except Exception as e:
        print(f"Error publicando MQTT: {e}")
        raise HTTPException(status_code=500, detail="Error al conectar con el broker MQTT")
    pass
