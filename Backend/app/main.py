from contextlib import asynccontextmanager
import asyncio
from fastapi import FastAPI
from app.system.routes import router
from app.services.mqtt_service import mqtt_listener
from app.core.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicio: Arrancar el listener MQTT en segundo plano
    task = asyncio.create_task(mqtt_listener())
    yield
    task.cancel()

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)

app.include_router(router, prefix="/system")

@app.get("/")
def read_root():
    return {"status": "online", "system": "RAK IoT Receiver"}
