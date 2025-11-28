from contextlib import asynccontextmanager
import asyncio
from fastapi import FastAPI
from app.system.routes import router
from app.services.mqtt_service import mqtt_listener
from app.core.config import settings
from app.db.database import async_engine, Base
from app.db import models
import aiomqtt

async def create_tables():
    _ = models
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@asynccontextmanager
async def lifespan(app: FastAPI):

    await create_tables()
    async with aiomqtt.Client(settings.MQTT_BROKER, settings.MQTT_PORT) as client:
        print(" >>> Cliente MQTT (Publisher) Conectado.")
        app.state.mqtt = client

        listener_task = asyncio.create_task(mqtt_listener())

        yield

        print(" >>> Apagando servicios...")
        listener_task.cancel()
        try:
            await listener_task
        except asyncio.CancelledError:
            pass

    print(" >>> Cliente MQTT desconectado.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)

app.include_router(router, prefix="/system")

@app.get("/")
def read_root():
    return {"status": "online", "system": "RAK IoT Receiver"}
