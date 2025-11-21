from app.db.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship

from datetime import date, time

from sqlalchemy import (
    Identity,
    String,
    PrimaryKeyConstraint,
    ForeignKeyConstraint,
)

class User(Base):
    __tablename__ = "user"

    user_id: Mapped[int] = mapped_column(Identity(start=1))
    email: Mapped[str] = mapped_column(String(length=50), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(length=200), nullable=False)
    first_name: Mapped[str] = mapped_column(String(length=50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(length=50), nullable=False)
    phone_number: Mapped[str] = mapped_column(String(length=15), nullable=True)
    device_id: Mapped[int] = mapped_column(nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint("user_id"),
        ForeignKeyConstraint(
            ["device_id"],
            ["device.device_id"],
        )
    )

    devices: Mapped["Device"] = relationship(back_populates="users")

class Device(Base):
    __tablename__ = "device"

    device_id: Mapped[int] = mapped_column(Identity(start=1))
    password_device: Mapped[str] = mapped_column(String(length=200), nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint("device_id"),
    )
    users: Mapped[list["User"]] = relationship(back_populates="devices")

class DeviceSensor(Base):
    __tablename__ = "device_sensor"

    device_sensor_id: Mapped[int] = mapped_column(Identity(start=1))
    device_id: Mapped[int] = mapped_column(nullable=False)
    sensor_id: Mapped[int] = mapped_column(nullable=False)

    value: Mapped[float] = mapped_column(nullable=False)
    event_date: Mapped[date] = mapped_column(nullable=False)
    event_time: Mapped[time] = mapped_column(nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint("device_sensor_id"),
        ForeignKeyConstraint(
            ["device_id"],
            ["device.device_id"],
        ),
        ForeignKeyConstraint(
            ["sensor_id"],
            ["sensor.sensor_id"],
        ),
    )

class Sensor(Base):
    __tablename__ = "sensor"

    sensor_id: Mapped[int] = mapped_column(Identity(start=1))
    model: Mapped[str] = mapped_column(String(length=50), nullable=False)
    name: Mapped[str] = mapped_column(String(length=100), nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint("sensor_id"),
    )
