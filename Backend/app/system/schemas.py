from pydantic import BaseModel, Field, ConfigDict
from datetime import date, time

class ControllerData(BaseModel):
    target: str = Field(..., description="Name of the controller")
    value: int = Field(..., description="Value to set for the controller")


class ControllerDataUpdate(BaseModel):
    value: int = Field(..., description="Value to set for the controller")


class ControllerDataDevice(BaseModel):
    target: str = Field(..., description="Name of the controller")

class ControllerResponse(BaseModel):
    success: bool = Field(..., description="Indicates if the operation was successful")
    message: str = Field(..., description="Additional information about the operation")


class DeviceSensorSchema(BaseModel):

    device_sensor_id: int
    device_id: int
    sensor_id: int
    value: float
    event_date: date
    event_time: time

    model_config = ConfigDict(from_attributes=True)

class DeviceSensorListSchema(BaseModel):
    device_sensors: list[DeviceSensorSchema]

    model_config = ConfigDict(from_attributes=True)


class DeviceConfigurationSchema(BaseModel):
    device_configuration_id: int
    device_id: int
    actuador: str
    value: int

    model_config = ConfigDict(from_attributes=True)

class DeviceConfigurationListSchema(BaseModel):
    device_configurations: list[DeviceConfigurationSchema]

    model_config = ConfigDict(from_attributes=True)
