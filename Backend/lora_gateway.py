import serial
import time
import asyncio
import aiomqtt

def hex_to_ascii(hex_str):
    try:
        return bytes.fromhex(hex_str).decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"[!] Error al decodificar: {e}")
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
        return "invernadero/humedad"


async def main():
    # CAMBIA
    puerto = serial.Serial(
        port='/dev/ttyUSB0',
        baudrate=115200,
        timeout=1
    )

    time.sleep(2)
    puerto.write(b'AT+NWM=0\r\n')
    time.sleep(2)
    puerto.write(b'AT+P2P=923700000:7:125:0:10:14\r\n')
    time.sleep(1)
    puerto.write(b'at+PRECV=65533\r\n')
    time.sleep(1)
    puerto.reset_input_buffer()
    print(" Puerto serie configurado y listo.")

    async with aiomqtt.Client("localhost", port=1883) as mqtt_client:

        try:
            while True:
                if puerto.in_waiting > 0:
                    linea = puerto.readline().decode('utf-8', errors='ignore').strip()
                    print(linea)
                    if not linea:
                        continue

                    print(f"[RAW] {linea}")

                    data_hex = ""

                    if "+EVT:RXP2P" in linea:
                        partes = linea.split(":")
                        # El formato suele ser: +EVT:RXP2P:-50:10:4:AABBCC
                        if len(partes) >= 4:
                            data_hex = partes[-1].strip()

                    # CASO 2: Formato Antiguo -> at+recv=RSSI,SNR,LEN,DATA
                    elif "recv=" in linea:
                        # Limpiamos 'at+recv=' y dividimos por comas
                        contenido = linea.replace("at+recv=", "").strip()
                        partes = contenido.split(",")
                        if len(partes) >= 3:
                            data_hex = partes[-1].strip()  # El último suele ser la data

                    # Si obtuvimos datos HEX válidos
                    if data_hex:
                        ascii_data = hex_to_ascii(data_hex)
                        print(f" >> MENSAJE: {ascii_data}")

                        topico = identificar_topico(ascii_data)
                        try:
                            await mqtt_client.publish(topico, ascii_data)
                            print(f" [MQTT] Enviado a {topico}")
                        except Exception as e:
                            print(f" [MQTT Error] {e}")

                await asyncio.sleep(0.1)

        except KeyboardInterrupt:
            print("\n Lectura interrumpida.")
        finally:
            puerto.close()
            print(" Puerto cerrado.")

if __name__ == "__main__":
    asyncio.run(main())
