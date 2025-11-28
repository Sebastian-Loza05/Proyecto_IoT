import serial
import json
import time
import asyncio
import aiomqtt
import binascii  # Útil para convertir texto a hex fácilmente


def hex_to_ascii(hex_str):
    try:
        return bytes.fromhex(hex_str).decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"[!] Error al decodificar Hex a ASCII: {e}")
        return ""

def ascii_to_hex(text):
    return text.encode('utf-8').hex()

def identificar_topico(mensaje_str):
    if "hum" in mensaje_str.lower():
        return "invernadero/humedad"
    elif "temp" in mensaje_str.lower():
        return "invernadero/temperatura"
    elif "ldr" in mensaje_str.lower() or "luz" in mensaje_str.lower():
        return "invernadero/luz"
    else:
        return "invernadero/general"


async def tarea_leer_lora(puerto, mqtt_client, serial_lock):
    """Lee del puerto Serial y publica en MQTT (Lo que ya hacías)"""
    print(" [Tarea] Iniciando lectura LoRa...")
    while True:
        try:
            # Usamos el Lock para acceder al puerto de forma segura
            async with serial_lock:
                hay_datos = puerto.in_waiting > 0
                if hay_datos:
                    linea = puerto.readline().decode('utf-8', errors='ignore').strip()
                else:
                    linea = None

            if linea:
                print(f"[RAW] {linea}")
                data_hex = ""

                # Lógica de parseo (RAK P2P)
                if "+EVT:RXP2P" in linea:
                    partes = linea.split(":")
                    if len(partes) >= 4:
                        data_hex = partes[-1].strip()
                elif "recv=" in linea:
                    contenido = linea.replace("at+recv=", "").strip()
                    partes = contenido.split(",")
                    if len(partes) >= 3:
                        data_hex = partes[-1].strip()

                if data_hex:
                    ascii_data = hex_to_ascii(data_hex)
                    print(f" >> MENSAJE RECIBIDO: {ascii_data}")
                    topico = identificar_topico(ascii_data)

                    try:
                        await mqtt_client.publish(topico, ascii_data)
                        print(f" [MQTT Pub] Enviado a {topico}")
                    except Exception as e:
                        print(f" [MQTT Error] {e}")

            # Importante: ceder el control al event loop para que la otra tarea corra
            await asyncio.sleep(0.1) 

        except Exception as e:
            print(f"Error en lectura LoRa: {e}")
            await asyncio.sleep(1)

async def tarea_escuchar_mqtt(puerto, mqtt_client, serial_lock, topico_control):
    print(f" [Tarea] Suscribiéndose a {topico_control}...")
    await mqtt_client.subscribe(topico_control)

    async for message in mqtt_client.messages:
        try:
            payload_str = message.payload.decode()
            print(f" [MQTT] Recibido: {payload_str}")

            data = json.loads(payload_str)

            comando_lora = ""

            # 2. Traducir a Protocolo Corto
            target = data.get("target", "").lower()
            valor = data.get("value", 0)

            if target == "bomba":
                comando_lora = f"B:{valor}"  # Ej: B:1
            elif target == "servo":
                comando_lora = f"S:{valor}"  # Ej: S:90
            elif target == "motor":
                comando_lora = f"M:{valor}"  # Ej: M:150

            if comando_lora:
                payload_hex = ascii_to_hex(comando_lora)
                cmd_at = f"AT+PSEND={payload_hex}\r\n"

                async with serial_lock:
                    print(f" [LoRa] Enviando: {comando_lora} -> {cmd_at.strip()}")
                    puerto.write(cmd_at.encode())
            else:
                print(" [Error] Dispositivo no reconocido en el JSON")

        except json.JSONDecodeError:
            print(" [Error] El mensaje MQTT no es un JSON válido")
        except Exception as e:
            print(f" [Error Procesando MQTT] {e}")

async def main():
    # 1. Configuración Serial
    puerto = serial.Serial(
        port='/dev/ttyUSB0',
        baudrate=115200,
        timeout=1
    )

    # Configuración inicial del módulo RAK
    time.sleep(2)
    puerto.write(b'AT+NWM=0\r\n')
    time.sleep(2)
    puerto.write(b'AT+P2P=923700000:7:125:0:10:14\r\n')
    time.sleep(1)
    puerto.write(b'at+PRECV=65533\r\n') # Poner en modo recepción continua
    time.sleep(1)
    puerto.reset_input_buffer()
    print(" Puerto serie configurado.")

    # 2. Crear un Lock para controlar el acceso al puerto serial
    serial_lock = asyncio.Lock()

    # 3. Conexión MQTT y ejecución paralela
    async with aiomqtt.Client("localhost", port=1883) as mqtt_client:
        print(" Conectado al Broker MQTT.")

        # Definimos el tópico donde escucharás las órdenes para los actuadores
        TOPICO_CONTROL = "invernadero/control" 

        # asyncio.gather ejecuta ambas funciones "al mismo tiempo"
        await asyncio.gather(
            tarea_leer_lora(puerto, mqtt_client, serial_lock),
            tarea_escuchar_mqtt(puerto, mqtt_client, serial_lock, TOPICO_CONTROL)
        )

    puerto.close()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nPrograma detenido.")
