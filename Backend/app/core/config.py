from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart Garden"

    # Database
    DATABASE_URL: str

    # MQTT
    MQTT_BROKER: str
    MQTT_PORT: int = 1883
    MQTT_TOPIC: str = "rak/sensors/ya_veremos_xd" 

    # Auth
    SECRET_KEY: str
    ALGORITHM: str = "HS256"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
