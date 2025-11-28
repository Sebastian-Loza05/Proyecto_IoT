from pydantic import BaseModel, Field


class ControllerData(BaseModel):
    target: str = Field(..., description="Name of the controller")
    value: int = Field(..., description="Value to set for the controller")


class ControllerResponse(BaseModel):
    success: bool = Field(..., description="Indicates if the operation was successful")
    message: str = Field(..., description="Additional information about the operation")

