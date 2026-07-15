# -*- coding: utf-8 -*-
"""
FASE 1 — Prueba de conexión con un equipo ZKTeco.

¿Qué hace este script?
  1. Se conecta al equipo por la red (puerto 4370, el estándar de ZKTeco).
  2. Muestra la información del equipo (modelo, serie, firmware, hora).
  3. Lista los usuarios registrados en el equipo.
  4. Muestra las últimas marcaciones (huellas/rostros registrados).
  5. Se desconecta limpiamente.

¿Cómo se usa? (desde la carpeta "puente", con el entorno activado)
    python probar_conexion.py 192.168.1.201
                              ^^^^^^^^^^^^^ la IP de tu equipo

  Si no pasas la IP, usa la IP_POR_DEFECTO configurada abajo.

IMPORTANTE: este script SOLO LEE datos. No borra ni modifica nada
en el equipo, así que es seguro probarlo en un equipo en producción.
"""

import sys
from datetime import datetime

# "zk" es el nombre interno de la librería pyzk que instalamos
from zk import ZK


# ============================================================
# CONFIGURACIÓN — lo único que quizás necesites editar
# ============================================================

# IP que se usa si no pasas una por la línea de comandos
IP_POR_DEFECTO = "192.168.1.201"

# Puerto de comunicación ZKTeco. Casi siempre es 4370; solo cambia
# si alguien lo modificó en el menú del equipo.
PUERTO = 4370

# Comm Key del equipo. Tu equipo está en 0 (valor de fábrica).
# Si algún equipo futuro tiene clave, se cambia aquí.
CLAVE_COMUNICACION = 0

# Segundos máximos de espera antes de rendirse.
# En red local 10 es suficiente; por VPN puede convenir subirlo a 20-30.
TIEMPO_ESPERA = 10

# --- Opciones para conexiones difíciles (VPN, firewalls) ---

# Algunos equipos/redes solo responden por UDP. Si la conexión normal
# (TCP) falla con timeout, prueba poniendo esto en True.
FORZAR_UDP = False

# pyzk hace "ping" al equipo antes de conectar. Muchas VPN bloquean
# el ping aunque el puerto 4370 sí funcione. Si estás por VPN y falla,
# pon esto en True para saltarse esa verificación.
OMITIR_PING = False

# Cuántas marcaciones recientes mostrar (el equipo puede tener miles)
MARCACIONES_A_MOSTRAR = 10


# ============================================================
# FUNCIONES AUXILIARES
# ============================================================

def linea(titulo=""):
    """Imprime una línea separadora para que la salida se lea ordenada."""
    if titulo:
        print(f"\n===== {titulo} " + "=" * (50 - len(titulo)))
    else:
        print("=" * 57)


def nombre_privilegio(codigo):
    """
    Traduce el código numérico de privilegio del equipo a texto.
    En el protocolo ZKTeco: 0 = usuario normal, 14 = administrador.
    """
    return "Administrador" if codigo == 14 else "Usuario"


# ============================================================
# PROGRAMA PRINCIPAL
# ============================================================

def main():
    # Si el usuario escribió una IP al ejecutar (python probar_conexion.py X.X.X.X)
    # la usamos; si no, usamos la configurada arriba.
    ip = sys.argv[1] if len(sys.argv) > 1 else IP_POR_DEFECTO

    print(f"\nConectando a equipo ZKTeco en {ip}:{PUERTO} "
          f"(espera máxima: {TIEMPO_ESPERA}s)...")

    # Preparamos el "cliente" con toda la configuración.
    # Todavía no se conecta: eso pasa recién en zk.connect().
    zk = ZK(
        ip,
        port=PUERTO,
        timeout=TIEMPO_ESPERA,
        password=CLAVE_COMUNICACION,
        force_udp=FORZAR_UDP,
        ommit_ping=OMITIR_PING,  # sí, la librería lo escribe con doble "m"
    )

    conexion = None
    try:
        # ---- 1. CONECTAR ----
        conexion = zk.connect()
        print("✔ Conexión establecida.")

        # ---- 2. INFORMACIÓN DEL EQUIPO ----
        linea("INFORMACIÓN DEL EQUIPO")
        # Cada get_* hace una consulta real al equipo por la red
        print(f"Nombre del equipo : {conexion.get_device_name()}")
        print(f"Número de serie   : {conexion.get_serialnumber()}")
        print(f"Firmware          : {conexion.get_firmware_version()}")
        print(f"Plataforma        : {conexion.get_platform()}")
        print(f"MAC               : {conexion.get_mac()}")

        # Comparamos la hora del equipo con la de la PC: si difieren mucho,
        # los reportes de asistencia saldrían con horas incorrectas.
        hora_equipo = conexion.get_time()
        hora_pc = datetime.now()
        diferencia = abs((hora_pc - hora_equipo).total_seconds())
        print(f"Hora del equipo   : {hora_equipo}")
        print(f"Hora de esta PC   : {hora_pc.strftime('%Y-%m-%d %H:%M:%S')}")
        if diferencia > 60:
            print(f"⚠ ATENCIÓN: el equipo está desfasado {int(diferencia)} "
                  f"segundos respecto a la PC. Conviene sincronizar la hora "
                  f"(lo haremos desde el panel en una fase posterior).")
        else:
            print("✔ La hora del equipo está bien sincronizada.")

        # ---- 3. USUARIOS REGISTRADOS ----
        linea("USUARIOS EN EL EQUIPO")
        usuarios = conexion.get_users()
        print(f"Total: {len(usuarios)} usuario(s)\n")
        for u in usuarios:
            # user_id = el código que se usa al marcar (el importante para RRHH)
            # uid     = índice interno del equipo (casi nunca lo usaremos)
            print(f"  ID: {u.user_id:<10} Nombre: {u.name:<25} "
                  f"Tipo: {nombre_privilegio(u.privilege)}")

        # ---- 4. MARCACIONES ----
        linea("MARCACIONES")
        marcaciones = conexion.get_attendance()
        print(f"Total almacenadas en el equipo: {len(marcaciones)}")

        if marcaciones:
            print(f"Mostrando las últimas {MARCACIONES_A_MOSTRAR}:\n")
            # Ordenamos por fecha y nos quedamos con las más recientes,
            # porque el equipo las entrega en su orden interno.
            recientes = sorted(marcaciones, key=lambda m: m.timestamp)
            for m in recientes[-MARCACIONES_A_MOSTRAR:]:
                print(f"  Usuario: {m.user_id:<10} "
                      f"Fecha/hora: {m.timestamp}  "
                      f"(punch={m.punch}, status={m.status})")
            print("\nNota: 'punch' y 'status' son códigos del equipo "
                  "(entrada/salida, huella/rostro). Los interpretaremos "
                  "en el motor de asistencia de la Fase 5.")
        else:
            print("El equipo no tiene marcaciones almacenadas todavía.")
            print("Marca tu huella en el equipo y vuelve a ejecutar el script.")

        linea()
        print("✔ PRUEBA COMPLETADA CON ÉXITO. La Fase 1 funciona.\n")

    except Exception as error:
        # Cualquier problema (IP incorrecta, equipo apagado, firewall...)
        # cae aquí. Mostramos el error y pistas de solución en vez de
        # dejar que el programa reviente con un mensaje críptico.
        linea("ERROR")
        print(f"No se pudo completar la prueba: {error}\n")
        print("Pistas según el tipo de problema:")
        print(" - Timeout / no responde:")
        print("     * ¿La IP es correcta? Verifica en el equipo:")
        print("       Menú > Comunicación > Ethernet")
        print("     * ¿Tu PC y el equipo están en la misma red? Compara con 'ipconfig'.")
        print("     * Prueba: ping a la IP del equipo desde cmd.")
        print("     * Firewall de Windows puede bloquear; permite Python o")
        print("       desactiva el firewall un momento para descartar.")
        print(" - Estás por VPN:")
        print("     * Pon OMITIR_PING = True en la configuración de arriba.")
        print("     * Sube TIEMPO_ESPERA a 30.")
        print(" - 'Unauthenticated' o error de autenticación:")
        print("     * El equipo tiene Comm Key distinta de 0. Revisa:")
        print("       Menú > Comunicación > Comm Key, y ponla en")
        print("       CLAVE_COMUNICACION arriba.")
        print(" - Conecta pero falla a mitad de la lectura:")
        print("     * Prueba FORZAR_UDP = True.")
        sys.exit(1)  # código 1 = terminó con error (útil para automatizar luego)

    finally:
        # Pase lo que pase (éxito o error), cerramos la conexión para no
        # dejar al equipo "ocupado". Esto SIEMPRE se ejecuta.
        if conexion:
            conexion.disconnect()
            print("Conexión cerrada correctamente.")


# Punto de entrada: esto hace que main() solo corra cuando ejecutas el
# archivo directamente, no si otro script lo importa (buena costumbre).
if __name__ == "__main__":
    main()
