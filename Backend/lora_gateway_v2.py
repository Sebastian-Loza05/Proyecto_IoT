import serial
import json
import time
import asyncio
import aiomqtt
import binascii 

# --- FUNCIONES DE AYUDA ---

def hex_to_ascii(hex_str):
    try:
        return bytes.fromhex(hex_str).decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"[!] Error al decodificar Hex a ASCII: {e}")
        return ""

def ascii_to_hex(text):
    return text.encode('utf-8').hex()

# --- TAREAS ---

async def tarea_leer_lora(puerto, mqtt_client, serial_lock, estado_global):
    """
    Lee LoRa. Si recibe 'IGNORADO', reenvía.
    Si recibe datos de sensores (temp, hum, ldr juntos), los separa y publica.
    """
    print(" [Tarea] Iniciando lectura LoRa...")
    while True:
        try:
            linea = None

            # 1. Leer del puerto Serial (Bloqueo mínimo)
            async with serial_lock:
                if puerto.in_waiting > 0:
                    linea = puerto.readline().decode('utf-8', errors='ignore').strip()

            # 2. Procesar datos fuera del lock
            if linea:
                # print(f"[RAW] {linea}") # Debug
                data_hex = ""

                # Extraer la parte Hexadecimal del mensaje RAK
                if "+EVT:RXP2P" in linea:
                    partes = linea.split(":")
                    if len(partes) >= 4:
                        data_hex = partes[-1].strip()
                elif "recv=" in linea:
                    contenido = linea.replace("at+recv=", "").strip()
                    partes = contenido.split(",")
                    if len(partes) >= 3:
                        data_hex = partes[-1].strip()

                # Si obtuvimos datos válidos
                if data_hex:
                    ascii_data = hex_to_ascii(data_hex)
                    print(f" >> MENSAJE RECIBIDO: {ascii_data}")

                    # -------------------------------------------------
                    # CASO A: MANEJO DE ERRORES (IGNORADO)
                    # -------------------------------------------------
                    if ascii_data.startswith("IGNORADO:"):
                        print(f" [ALERTA] El dispositivo ignoró el comando. Reintentando...")
                        
                        ultimo_hex = estado_global.get("ultimo_comando_hex")
                        
                        if ultimo_hex:
                            cmd_retry = f"AT+PSEND={ultimo_hex}\r\n"
                            print(f" [RE-SEND] Reenviando: {estado_global.get('ultima_accion_desc')}")
                            
                            async with serial_lock:
                                puerto.write(cmd_retry.encode())
                                await asyncio.sleep(0.5) 
                        else:
                            print(" [ERROR] Se pidió reenviar, pero no hay comando en memoria.")

                    # -------------------------------------------------
                    # CASO B: DATOS DE SENSORES (Formato Nuevo)
                    # Formato esperado: "temp:25.3,hum:40.0,ldr:512.7"
                    # -------------------------------------------------
                    elif "," in ascii_data and ":" in ascii_data:
                        # Separamos por comas primero: ["temp:25.3", "hum:40.0", "ldr:512.7"]
                        datos_json = {}
                        items = ascii_data.split(",")

                        for item in items:
                            if ":" in item:
                                key, val = item.split(":")
                                key = key.strip().lower()
                                val = val.strip()

                                try:
                                    val = float(val)
                                except ValueError:
                                    pass

                                # Asignar claves estandarizadas
                                if "temp" in key:
                                    datos_json["temperatura"] = val
                                elif "hum" in key:
                                    datos_json["humedad"] = val
                                elif "ldr" in key or "luz" in key:
                                    datos_json["luz"] = val

                                if datos_json:
                                    payload_final = json.dumps(datos_json)
                                    TOPICO_SENSORES = "invernadero/sensores"

                                    try:
                                        await mqtt_client.publish(TOPICO_SENSORES, payload_final)
                                        print(f"    -> [MQTT JSON] {TOPICO_SENSORES}: {payload_final}")
                                    except Exception as e:
                                        print(f"    -> [MQTT Error] {e}")


            # Ceder control al loop
            await asyncio.sleep(0.1) 

        except Exception as e:
            print(f"Error en lectura LoRa: {e}")
            await asyncio.sleep(1)

async def tarea_escuchar_mqtt(puerto, mqtt_client, serial_lock, topico_control, estado_global):
    """
    Escucha MQTT, envía a LoRa y GUARDA el comando en 'estado_global'.
    """
    print(f" [Tarea] Suscribiéndose a {topico_control}...")
    await mqtt_client.subscribe(topico_control)

    async for message in mqtt_client.messages:
        try:
            payload_str = message.payload.decode()
            print(f" [MQTT CMD] Recibido: {payload_str}")

            data = json.loads(payload_str)
            comando_lora = ""

            target = data.get("target", "").lower()
            valor = data.get("value", 0)

            if target == "bomba":
                comando_lora = f"B:{valor}"
            elif target == "servo":
                comando_lora = f"S:{valor}"
            elif target == "motor":
                comando_lora = f"M:{valor}"
            
            if comando_lora:
                payload_hex = ascii_to_hex(comando_lora)
                
                # Guardamos estado para reintentos
                estado_global["ultimo_comando_hex"] = payload_hex
                estado_global["ultima_accion_desc"] = comando_lora

                cmd_at = f"AT+PSEND={payload_hex}\r\n"

                async with serial_lock:
                    print(f" [LoRa TX] Enviando: {comando_lora} -> {cmd_at.strip()}")
                    puerto.write(cmd_at.encode())
            else:
                print(" [Error] JSON desconocido o sin target válido")

        except json.JSONDecodeError:
            print(" [Error] El mensaje MQTT no es un JSON válido")
        except Exception as e:
            print(f" [Error Procesando MQTT] {e}")

# --- MAIN ---

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
    puerto.write(b'at+PRECV=65533\r\n')
    time.sleep(1)
    puerto.reset_input_buffer()
    print(" Puerto serie configurado.")

    # 2. Objetos compartidos
    serial_lock = asyncio.Lock()
    estado_global = {
        "ultimo_comando_hex": None,
        "ultima_accion_desc": ""
    }

    # 3. Conexión MQTT
    async with aiomqtt.Client("localhost", port=1883) as mqtt_client:
        print(" Conectado al Broker MQTT.")
        TOPICO_CONTROL = "invernadero/control" 

        await asyncio.gather(
            tarea_leer_lora(puerto, mqtt_client, serial_lock, estado_global),
            tarea_escuchar_mqtt(puerto, mqtt_client, serial_lock, TOPICO_CONTROL, estado_global)
        )

    puerto.close()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nPrograma detenido.")
