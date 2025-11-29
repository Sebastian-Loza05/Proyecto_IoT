import asyncio
import json
import aiomqtt
from app.core.config import settings
from app.services.websocket import manager
from app.db.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from sqlalchemy import select
from datetime import datetime
from app.db.models import Sensor, DeviceSensor

async def save_sensor_data(db: AsyncSession, device_id: int, data: dict):
    now = datetime.now()

    for key in ["temperatura", "humedad", "luz"]:
        value = data.get(key)
        if value is not None:
            result = await db.execute(
                select(Sensor.sensor_id).where(Sensor.name == key)
            )
            sensor_id = result.scalar()
            if sensor_id is None:
                print(f"[ERROR] Sensor '{key}' no encontrado en la DB.")
                continue

            sensor_entry = DeviceSensor(
                device_id=device_id,
                sensor_id=sensor_id,
                value=value,
                event_date=now.date(),
                event_time=now.time()
            )
            db.add(sensor_entry)
    await db.commit()

async def mqtt_listener(
    db: AsyncSession = Depends(get_db)
):
    while True:
        try:
            async with aiomqtt.Client(settings.MQTT_BROKER, settings.MQTT_PORT) as client:
                await client.subscribe("invernadero/sensores")
                async for message in client.messages:
                    payload = message.payload.decode()
                    print(f"Recibido: {payload}")
                    try:
                        # 1. Convertir string a Diccionario Python
                        data = json.loads(payload)

                        # 2. Imprimir valores individuales
                        temp = data.get("temperatura")
                        hum = data.get("humedad")
                        luz = data.get("luz")

                        print(f" ➤ Temperatura procesada: {temp} °C")
                        print(f" ➤ Humedad procesada: {hum} %")
                        print(f" ➤ Luz procesada: {luz}")

                        device_id = data.get("device_id", 1)

                        await save_sensor_data(db, device_id, data)

                        await manager.broadcast(payload)
                    except json.JSONDecodeError:
                        print(" [Error] JSON inválido recibido")

        except Exception as e:
            print(f"Error en MQTT: {e}. Reintentando en 5s...")
            await asyncio.sleep(5)
