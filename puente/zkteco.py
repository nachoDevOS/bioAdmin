# -*- coding: utf-8 -*-
"""
Funciones para hablar con los equipos ZKTeco (protocolo puerto 4370).

Este módulo NO sabe nada de Laravel ni de FastAPI: solo sabe
conectarse a un equipo y leer/escribir datos. Así, si algún día
cambia la librería (pyzk) o llega un equipo con otro protocolo,
solo se toca este archivo.
"""

from datetime import datetime

from zk import ZK


def conectar(ip, puerto=4370, clave=0, tiempo_espera=10):
    """
    Abre la conexión con un equipo y la devuelve.
    Quien llama es responsable de cerrar con .disconnect()
    (o usar try/finally, como hacen las funciones de servicio.py).

    ommit_ping=True: no hacemos ping previo porque muchas VPN lo
    bloquean aunque el puerto 4370 sí esté abierto.
    """
    zk = ZK(
        ip,
        port=int(puerto),
        timeout=int(tiempo_espera),
        password=int(clave),
        force_udp=False,
        ommit_ping=True,
    )
    return zk.connect()


def obtener_info(conexion):
    """Datos básicos del equipo, para la prueba de conexión."""
    return {
        "nombre_equipo": conexion.get_device_name(),
        "numero_serie": conexion.get_serialnumber(),
        "firmware": conexion.get_firmware_version(),
        "usuarios": len(conexion.get_users()),
        "marcaciones": len(conexion.get_attendance()),
        "hora_equipo": str(conexion.get_time()),
    }


def obtener_marcaciones(conexion):
    """
    Lee TODAS las marcaciones almacenadas en el equipo y las convierte
    al formato que espera la API de Laravel:
        {codigo, marcado_en, punch, status}

    Se envían todas siempre: Laravel ignora las repetidas (índice
    único anti-duplicados), así que reenviar es seguro y más simple
    que llevar la cuenta de "cuál fue la última".
    """
    marcaciones = []
    for registro in conexion.get_attendance():
        marcaciones.append({
            "codigo": str(registro.user_id),
            # Formato ISO "2026-07-14 08:03:21" que Laravel entiende
            "marcado_en": registro.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "punch": registro.punch,
            "status": registro.status,
        })
    return marcaciones


def sincronizar_hora(conexion):
    """
    Pone en el equipo la hora de esta PC. Importante: si el equipo
    tiene la hora desviada, todos los reportes de asistencia salen mal.
    """
    conexion.set_time(datetime.now())
    return str(conexion.get_time())


def enviar_usuarios(conexion, empleados):
    """
    Registra (o actualiza) empleados en el equipo, para que puedan
    marcar. Recibe una lista de {codigo, nombre}.

    Detalles del protocolo ZKTeco:
      - user_id: el código con el que la persona marca (texto)
      - uid: índice numérico interno del equipo. Usamos el mismo código
        convertido a número, así crear y actualizar es la misma operación.
        Por eso los códigos deben ser NUMÉRICOS (1 a 65534); los que no,
        se reportan como error sin detener el resto.
      - la huella NO se puede enviar desde aquí: se registra una sola vez
        en cualquier equipo y en fases futuras se podrá copiar entre equipos.

    Devuelve (enviados, errores).
    """
    enviados = 0
    errores = []

    # Mientras se escriben usuarios, el equipo se "congela" un momento
    # para que nadie marque a medias. SIEMPRE se reactiva (finally).
    conexion.disable_device()
    try:
        for empleado in empleados:
            codigo = str(empleado["codigo"]).strip()
            # El equipo corta nombres largos; 24 caracteres es lo seguro
            nombre = str(empleado["nombre"])[:24]

            if not codigo.isdigit() or not (1 <= int(codigo) <= 65534):
                errores.append(f"Código '{codigo}': debe ser numérico entre 1 y 65534.")
                continue

            try:
                conexion.set_user(
                    uid=int(codigo),
                    name=nombre,
                    privilege=0,        # 0 = usuario normal (14 sería admin)
                    user_id=codigo,
                )
                enviados += 1
            except Exception as error:
                errores.append(f"Código '{codigo}' ({nombre}): {error}")
    finally:
        conexion.enable_device()

    return enviados, errores
