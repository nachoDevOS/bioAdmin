# -*- coding: utf-8 -*-
"""
PUENTE BioAdmin — servicio que conecta Laravel con los equipos ZKTeco.

Hace DOS trabajos a la vez:

1. RECOLECTOR (automático, cada N minutos):
   - Pide a Laravel la lista de equipos activos
   - Se conecta a cada equipo y lee sus marcaciones
   - Las envía a Laravel en lote (Laravel descarta duplicados)

2. API DE ÓRDENES (FastAPI, puerto 8001):
   - POST /probar-conexion   → Laravel la usa para el botón "Probar"
   - POST /sincronizar-hora  → pone la hora de la PC en el equipo
   - GET  /estado            → ¿el puente está vivo?

Arrancar con:  iniciar_puente.bat   (o el comando uvicorn del README)

SEGURIDAD: este servicio escucha SOLO en 127.0.0.1 (la misma PC).
Nadie desde la red puede darle órdenes; únicamente el Laravel local.
"""

import logging
import os
import threading
import time
from contextlib import asynccontextmanager

import requests
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel

import zkteco

# ============================================================
# CONFIGURACIÓN (se lee del archivo puente/.env)
# ============================================================

load_dotenv()

LARAVEL_URL = os.getenv("LARAVEL_URL", "http://127.0.0.1:8000")
TOKEN_PUENTE = os.getenv("TOKEN_PUENTE", "")
INTERVALO_MINUTOS = int(os.getenv("INTERVALO_MINUTOS", "5"))

# Cabeceras que autentican al puente ante la API de Laravel
CABECERAS = {
    "Authorization": f"Bearer {TOKEN_PUENTE}",
    "Accept": "application/json",
}

# Registro de actividad en la consola, con hora, para poder
# diagnosticar qué pasó y cuándo.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-7s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("puente")


# ============================================================
# RECOLECTOR — el ciclo que corre cada N minutos
# ============================================================

def recolectar_de_un_equipo(dispositivo):
    """
    Conecta con UN equipo, envía sus marcaciones a Laravel y reporta
    el "latido". Los errores se registran pero NO detienen el ciclo:
    un equipo apagado no puede impedir recolectar de los demás.
    """
    nombre = dispositivo["nombre"]
    conexion = None
    try:
        conexion = zkteco.conectar(
            dispositivo["ip"],
            dispositivo["puerto"],
            dispositivo["clave_comunicacion"],
        )

        # 1. Avisar a Laravel que el equipo respondió (actualiza
        #    "última conexión" y guarda el número de serie real)
        numero_serie = conexion.get_serialnumber()
        requests.post(
            f"{LARAVEL_URL}/api/puente/dispositivos/{dispositivo['id']}/latido",
            json={"numero_serie": numero_serie},
            headers=CABECERAS,
            timeout=15,
        )

        # 2. Leer y enviar las marcaciones
        marcaciones = zkteco.obtener_marcaciones(conexion)
        if not marcaciones:
            log.info(f"[{nombre}] Conectado. Sin marcaciones en el equipo.")
            return

        respuesta = requests.post(
            f"{LARAVEL_URL}/api/puente/marcaciones",
            json={"dispositivo_id": dispositivo["id"], "marcaciones": marcaciones},
            headers=CABECERAS,
            timeout=60,
        )
        respuesta.raise_for_status()
        resultado = respuesta.json()
        log.info(
            f"[{nombre}] {resultado['recibidas']} leídas → "
            f"{resultado['nuevas']} nuevas, {resultado['duplicadas']} ya existían."
        )

    except Exception as error:
        # Equipo apagado, IP mala, red caída... se anota y se sigue.
        log.warning(f"[{nombre}] No se pudo recolectar: {error}")

    finally:
        # Pase lo que pase, cerrar la conexión con el equipo
        if conexion:
            try:
                conexion.disconnect()
            except Exception:
                pass  # si falla al cerrar, no hay nada más que hacer


def ciclo_recolector():
    """Bucle infinito: recolectar de todos los equipos, dormir, repetir."""
    log.info(f"Recolector iniciado. Intervalo: cada {INTERVALO_MINUTOS} minuto(s).")

    while True:
        try:
            # Pedir a Laravel la lista de equipos ACTIVOS
            respuesta = requests.get(
                f"{LARAVEL_URL}/api/puente/dispositivos",
                headers=CABECERAS,
                timeout=15,
            )
            respuesta.raise_for_status()
            dispositivos = respuesta.json()["dispositivos"]

            if dispositivos:
                log.info(f"Recolectando de {len(dispositivos)} equipo(s)...")
                for dispositivo in dispositivos:
                    recolectar_de_un_equipo(dispositivo)
            else:
                log.info("No hay equipos activos registrados en el panel.")

        except Exception as error:
            # Laravel caído o token inválido: anotar y reintentar luego.
            log.error(f"No se pudo hablar con Laravel: {error}")

        time.sleep(INTERVALO_MINUTOS * 60)


# ============================================================
# API DE ÓRDENES (FastAPI)
# ============================================================

@asynccontextmanager
async def ciclo_de_vida(app):
    """Al arrancar el servidor, lanzar el recolector en segundo plano."""
    hilo = threading.Thread(target=ciclo_recolector, daemon=True)
    hilo.start()
    yield  # aquí el servidor queda atendiendo peticiones


app = FastAPI(title="Puente BioAdmin", lifespan=ciclo_de_vida)


class DatosEquipo(BaseModel):
    """Lo que Laravel envía para identificar a qué equipo conectarse."""
    ip: str
    puerto: int = 4370
    clave: int = 0


class EmpleadoParaEnviar(BaseModel):
    """Un empleado a registrar en el equipo."""
    codigo: str
    nombre: str


class DatosEnvio(DatosEquipo):
    """Equipo + lista de empleados a enviarle."""
    empleados: list[EmpleadoParaEnviar]


@app.get("/estado")
def estado():
    """Para verificar que el puente está vivo (y desde cuándo)."""
    return {
        "ok": True,
        "servicio": "Puente BioAdmin",
        "intervalo_minutos": INTERVALO_MINUTOS,
        "laravel": LARAVEL_URL,
    }


@app.post("/probar-conexion")
def probar_conexion(datos: DatosEquipo):
    """
    Intenta conectarse al equipo y devuelve su información.
    Laravel llama aquí cuando presionas "Probar" en el panel.
    """
    conexion = None
    try:
        conexion = zkteco.conectar(datos.ip, datos.puerto, datos.clave, tiempo_espera=8)
        info = zkteco.obtener_info(conexion)
        return {"ok": True, **info}
    except Exception as error:
        return {"ok": False, "error": str(error)}
    finally:
        if conexion:
            try:
                conexion.disconnect()
            except Exception:
                pass


@app.post("/enviar-empleados")
def enviar_empleados(datos: DatosEnvio):
    """
    Registra empleados en el equipo (nombre + código para marcar).
    Laravel llama aquí desde Empleados → "Enviar al equipo".
    """
    conexion = None
    try:
        conexion = zkteco.conectar(datos.ip, datos.puerto, datos.clave, tiempo_espera=10)
        enviados, errores = zkteco.enviar_usuarios(
            conexion,
            [e.model_dump() for e in datos.empleados],
        )
        log.info(f"Envío de empleados a {datos.ip}: {enviados} ok, {len(errores)} con error.")
        return {"ok": True, "enviados": enviados, "errores": errores}
    except Exception as error:
        return {"ok": False, "error": str(error)}
    finally:
        if conexion:
            try:
                conexion.disconnect()
            except Exception:
                pass


@app.post("/sincronizar-hora")
def poner_en_hora(datos: DatosEquipo):
    """Pone la hora de esta PC en el equipo."""
    conexion = None
    try:
        conexion = zkteco.conectar(datos.ip, datos.puerto, datos.clave, tiempo_espera=8)
        hora_nueva = zkteco.sincronizar_hora(conexion)
        return {"ok": True, "hora_equipo": hora_nueva}
    except Exception as error:
        return {"ok": False, "error": str(error)}
    finally:
        if conexion:
            try:
                conexion.disconnect()
            except Exception:
                pass
