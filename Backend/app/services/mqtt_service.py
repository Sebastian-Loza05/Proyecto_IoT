import asyncio
import json
import aiomqtt
from app.core.config import settings
from app.services.websocket import manager
from app.db.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

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
                    # data = json.loads(payload)

                    # Guadar la data en la base de datos

                    # Enviar a la App Móvil en tiempo real
                        await manager.broadcast(payload)
                    except json.JSONDecodeError:
                        print(" [Error] JSON inválido recibido")

        except Exception as e:
            print(f"Error en MQTT: {e}. Reintentando en 5s...")
            await asyncio.sleep(5)
