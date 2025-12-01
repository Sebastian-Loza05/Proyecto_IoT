import { useState, useEffect, useRef } from 'react';
import { IP, SensorData } from './types';


const WS_URL = `ws://${IP}:8000/system/ws/sensor-readings`;

export function useSensorSocket() {
  const [data, setData] = useState<SensorData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const connect = () => {
    try {
      const ws = new WebSocket(WS_URL);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket Conectado');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const parsedData: SensorData = JSON.parse(event.data);
          setData(parsedData);
          console.log('Data recibida:', parsedData);
        } catch (error) {
          console.error('Error parseando data:', error);
        }
      };

      ws.onerror = (e) => {
        console.log('Error WebSocket:', e);
      };

      ws.onclose = () => {
        console.log('WebSocket Desconectado. Reintentando en 3s...');
        setIsConnected(false);
        
        setTimeout(() => {
          connect();
        }, 2000);
      };

    } catch (error) {
      console.log('Error inicializando socket', error);
    }
  };

  return { data, isConnected };
}
