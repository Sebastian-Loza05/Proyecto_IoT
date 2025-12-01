from fastapi import (
    APIRouter,
    WebSocket,
    WebSocketDisconnect,
    HTTPException,
    Request,
    Depends,
)

import json
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.websocket import manager
from app.services.data_sensor_service import DataSensorService
from app.system.schemas import (
    ControllerData,
    ControllerDataDevice,
    ControllerResponse,
    ControllerDataUpdate,
    DeviceConfigurationListSchema,
)
from app.db.database import get_db
from app.system.schemas import DeviceSensorListSchema

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

@router.get("/controllers/{device_id}/config", response_model=DeviceConfigurationListSchema)
async def get_controller_configuration(
    device_id: int,
    db: AsyncSession = Depends(get_db),
):
    data_sensor_service = DataSensorService(db)
    result = await data_sensor_service.read_configuration_by_device(
        device_id=device_id
    )
    return result


@router.put("/controllers/{device_id}/{actuador}", response_model=ControllerResponse)
async def update_controller(
    data: ControllerDataUpdate,
    device_id: int,
    actuador: str,
    db: AsyncSession = Depends(get_db),
):
    data_sensor_service = DataSensorService(db)

    print(actuador, data.value)
    configuration = await data_sensor_service.update_controller_value(
        device_id=device_id,
        actuador=actuador,
        value=data.value
    )

    if configuration:
        return ControllerResponse(
            success=True,
            message="Valor del controlador actualizado correctamente"
        )
    else:
        return ControllerResponse(
            success=False,
            message="No se encontró la configuración del controlador"
        )

@router.post("/controllers/{device_id}", response_model=ControllerResponse)
async def activate_controller_by_device(
    data: ControllerDataDevice,
    device_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    topic_control = "invernadero/control"
    payload_dict = data.model_dump()
    data_sensor_service = DataSensorService(db)
    configuration = await data_sensor_service.read_configuration_by_sensor(
        device_id=device_id,
        actuador=data.target
    )
    payload_dict["value"] = configuration.value
    payload_json = json.dumps(payload_dict)

    mqtt_client = request.app.state.mqtt

    try:
        print(f" [API] Enviando comando: {payload_json}")

        print(data.target, configuration.value, type(configuration.value))
        if data.target == "servo":
            movimiento = 0

            if int(configuration.value) == 90:
                movimiento = 180
            else:
                movimiento = 90

            await data_sensor_service.update_controller_value(
                device_id=device_id,
                actuador=data.target,
                value=movimiento,
                admin=True
            )

        await mqtt_client.publish(topic_control, payload_json)

        return ControllerResponse(
            success=True,
            message="Comando enviado correctamente al controlador"
        )

    except Exception as e:
        print(f"Error publicando MQTT: {e}")
        raise HTTPException(status_code=500, detail="Error al conectar con el broker MQTT")

@router.get("/data-sensors/{device_id}", response_model=DeviceSensorListSchema)
async def get_data_sensors(
    device_id: int,
    sensor_id: int | None = None,
    db: AsyncSession = Depends(get_db),
):
    data_sensor_service = DataSensorService(db)
    result = await data_sensor_service.read_data_sensors(
        device_id=device_id,
        sensor_id=sensor_id
    )
    return result
