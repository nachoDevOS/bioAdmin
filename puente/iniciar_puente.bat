@echo off
rem ============================================================
rem Arranca el puente BioAdmin (recolector + API de ordenes).
rem Doble clic sobre este archivo, o ejecutarlo desde cmd.
rem Dejar la ventana abierta: cerrarla detiene el puente.
rem ============================================================
cd /d %~dp0
echo Iniciando puente BioAdmin en http://127.0.0.1:8001 ...
.venv\Scripts\python.exe -m uvicorn servicio:app --host 127.0.0.1 --port 8001
pause
