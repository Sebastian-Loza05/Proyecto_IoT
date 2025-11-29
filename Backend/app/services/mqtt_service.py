import asyncio
import json
import aiomqtt
from datetime import datetime
import traceback

from sqlalchemy import select, insert
from app.core.config import settings
from app.services.websocket import manager
from app.db.models import Sensor, DeviceSensor
from app.db.database import async_engine


async def save_sensor_data(device_id: int, data: dict):
    now = datetime.now()
    try:
        async with async_engine.begin() as conn:
            for key in ["temperatura", "humedad", "luz"]:
                value = data.get(key)
                if value is None:
                    print(f"[WARN] No se recibió valor para '{key}'")
                    continue

                try:
                    value = float(value)
                except (ValueError, TypeError):
                    print(f"[ERROR] Valor inválido para '{key}': {value}")
                    continue

                result = await conn.execute(
                    select(Sensor.sensor_id).where(Sensor.name == key)
                )
                sensor_id = result.scalar()

                if sensor_id is None:
                    print(f"[ERROR] Sensor '{key}' no encontrado en la DB.")
                    continue

                print(f"[DB] Insertando → {key} | valor={value} | sensor_id={sensor_id} | device_id={device_id}")

                await conn.execute(
                    insert(DeviceSensor).values(
                        device_id=device_id,
                        sensor_id=sensor_id,
                        value=value,
                        event_date=now.date(),
                        event_time=now.time(),
                    )
                )

        print("[DB] Commit exitoso")

    except Exception as e:
        print(f"[ERROR] Falló el guardado en DB: {e}")
        traceback.print_exc()


async def mqtt_listener():
    print("HOLAAAA")
    while True:
        try:
            async with aiomqtt.Client(settings.MQTT_BROKER, settings.MQTT_PORT) as client:
                await client.subscribe("invernadero/sensores")
                async for message in client.messages:
                    payload = message.payload.decode()
                    print(f"Recibido: {payload}")
                    try:
                        data = json.loads(payload)

                        temp = data.get("temperatura")
                        hum = data.get("humedad")
                        luz = data.get("luz")

                        print(f" ➤ Temperatura procesada: {temp} °C")
                        print(f" ➤ Humedad procesada: {hum} %")
                        print(f" ➤ Luz procesada: {luz}")

                        device_id = data.get("device_id", 1)

                        await save_sensor_data(device_id, data)
                        await manager.broadcast(payload)

                    except json.JSONDecodeError:
                        print(" [Error] JSON inválido recibido")

        except Exception as e:
            print(f"Error en MQTT: {e}. Reintentando en 5s...")
            await asyncio.sleep(5)
