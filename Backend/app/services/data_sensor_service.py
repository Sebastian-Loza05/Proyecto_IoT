from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from sqlalchemy import BinaryExpression, and_

from app.db.models import DeviceSensor, DeviceConfiguration
from app.system.schemas import (
    DeviceSensorListSchema,
    DeviceConfigurationListSchema,
)

class DataSensorService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def read_data_sensors(
        self,
        device_id: int,
        sensor_id: int = None
    ):
        base_filter: list[BinaryExpression] = []
        base_filter.append(DeviceSensor.device_id == device_id)

        if sensor_id is not None:
            base_filter.append(DeviceSensor.sensor_id == sensor_id)

        filter = (
            and_(*base_filter)
        )

        stmt = select(DeviceSensor).where(filter).limit(20)

        result = await self.db.execute(stmt)

        device_sensors = result.scalars().all()

        return DeviceSensorListSchema(
            device_sensors=device_sensors
        )

    async def read_configuration_by_sensor(
        self,
        device_id: int,
        actuador: str,
    ):
        base_filter: list[BinaryExpression] = []
        base_filter.append(DeviceConfiguration.device_id == device_id)
        base_filter.append(DeviceConfiguration.actuador == actuador)

        filter = (
            and_(*base_filter)
        )

        stmt = select(DeviceConfiguration).where(filter)
        result = await self.db.execute(stmt)
        configuration = result.scalars().first()
        return configuration

    async def update_controller_value(
        self,
        device_id: int,
        actuador: str,
        value: int,
        admin: bool = False
    ):
        base_filter: list[BinaryExpression] = []
        base_filter.append(DeviceConfiguration.device_id == device_id)
        base_filter.append(DeviceConfiguration.actuador == actuador)

        filter = (
            and_(*base_filter)
        )

        stmt = select(DeviceConfiguration).where(filter)
        result = await self.db.execute(stmt)
        configuration = result.scalars().first()

        if configuration:
            if actuador != "servo" or admin:
                configuration.value = value
                self.db.add(configuration)
                await self.db.commit()
                await self.db.refresh(configuration)

        return configuration

    async def read_configuration_by_device(
        self,
        device_id: int,
    ):
        base_filter: list[BinaryExpression] = []
        base_filter.append(DeviceConfiguration.device_id == device_id)

        filter = (
            and_(*base_filter)
        )

        stmt = select(DeviceConfiguration).where(filter)
        result = await self.db.execute(stmt)
        configurations = result.scalars().all()
        return DeviceConfigurationListSchema(
            device_configurations=configurations
        )

