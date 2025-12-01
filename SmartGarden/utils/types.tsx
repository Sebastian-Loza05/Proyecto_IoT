export const IP = "192.168.0.64"

export interface SensorData {
  temperatura: number;
  humedad: number;
  luz: number;
  device_id?: string;
}
