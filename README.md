# BioAdmin — Sistema de administración de asistencia biométrica

Sistema web para controlar la asistencia de una empresa con equipos
biométricos **ZKTeco** (huella/rostro): recolecta marcaciones
automáticamente, calcula tardanzas, faltas y horas extra, gestiona
turnos y permisos, y genera reportes Excel/PDF.

## Arquitectura

```
Equipo ZKTeco ←(red, puerto 4370)→ Puente Python ←(API + token)→ Laravel ←(Inertia)→ Panel React
```

| Componente | Tecnología |
|---|---|
| Sistema central | Laravel 13 + MySQL 8 |
| Frontend | Inertia.js + React 18 + Tailwind CSS 4 + FullCalendar |
| Puente de comunicación | Python 3 + FastAPI + pyzk |
| Paquetes clave | spatie/laravel-permission (roles), spatie/laravel-activitylog (auditoría), maatwebsite/excel y barryvdh/laravel-dompdf (reportes), laravel/sanctum (token del puente) |

## Requisitos

- **Windows** (probado en Windows 11) — funciona igual en Linux ajustando rutas
- **PHP 8.3+** con extensiones `zip`, `gd`, `iconv`, `pdo_mysql` (Laragon las trae)
- **MySQL 8** (probado con Laragon)
- **Composer 2**
- **Node.js 20+** y npm
- **Python 3.10+**
- Equipo(s) ZKTeco accesibles por red en el puerto **4370** (misma LAN o VPN)

## Instalación (desde cero)

### 1. Sistema central (Laravel)

```cmd
cd /d D:\garoto\projects\bioAdmin

:: Dependencias PHP y JavaScript
composer install
npm install

:: Configuración
copy .env.example .env
php artisan key:generate
```

Edita el archivo `.env`:

```ini
APP_TIMEZONE=America/Lima          # TU zona horaria (crítico para la asistencia)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bioadmin
DB_USERNAME=root
DB_PASSWORD=                       # la de tu MySQL
PUENTE_URL=http://127.0.0.1:8001   # dónde correrá el puente Python
MYSQLDUMP_PATH=C:/laragon/bin/mysql/mysql-8.4.3-winx64/bin/mysqldump.exe
```

> OJO: en el `.env` las rutas de Windows van con barras normales `/`
> y SIN comillas (las `\` dentro de comillas rompen el archivo).

Crea la base de datos y siembra los datos iniciales:

```cmd
:: Crear la BD (o créala desde HeidiSQL/phpMyAdmin con charset utf8mb4)
php -r "$p=new PDO('mysql:host=127.0.0.1','root','');$p->exec('CREATE DATABASE IF NOT EXISTS bioadmin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');"

php artisan migrate --seed
npm run build
```

### 2. Puente Python

```cmd
cd /d D:\garoto\projects\bioAdmin\puente

python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Genera el token con el que el puente se autentica ante Laravel:

```cmd
cd /d D:\garoto\projects\bioAdmin
php artisan puente:token
```

Copia el token mostrado y crea el archivo `puente\.env`:

```ini
LARAVEL_URL=http://127.0.0.1:8000
TOKEN_PUENTE=pega_aqui_el_token_generado
INTERVALO_MINUTOS=5
```

## Arrancar el sistema (3 ventanas)

```cmd
:: Ventana 1 — Panel web  →  http://127.0.0.1:8000
cd /d D:\garoto\projects\bioAdmin && php artisan serve

:: Ventana 2 — Puente (recolecta marcaciones cada 5 min y atiende órdenes)
D:\garoto\projects\bioAdmin\puente\iniciar_puente.bat

:: Ventana 3 — Tareas programadas (recálculo cada 10 min, respaldo 02:00)
cd /d D:\garoto\projects\bioAdmin && php artisan schedule:work
```

Antes de todo: MySQL debe estar corriendo (Laragon → Iniciar todo).

## Usuario inicial

| Correo | Contraseña | Rol |
|---|---|---|
| `admin@bioadmin.test` | `admin1234` | Administrador |

**Cambia la contraseña en el primer inicio de sesión** (Usuarios → Editar).
Los demás usuarios se crean desde el panel con roles: Administrador,
RRHH, Supervisor o Empleado (este último solo ve "Mi portal" y debe
vincularse a su ficha de empleado).

## Puesta en marcha con tu equipo ZKTeco

1. **Dispositivos** → editar el equipo demo → poner la IP real → Guardar.
2. Botón **Probar** → debe responder con nombre, serie y conteos.
3. **Empleados** → registrar (o Importar Excel con la plantilla) usando
   como *código biométrico* el mismo ID con el que marcan en el equipo.
4. **Empleados → Enviar al equipo** → registra código+nombre en el equipo;
   la huella se enrola físicamente en el equipo (Menú → Usuarios).
5. **Turnos** → crear horarios → **Asignaciones** → asignar a empleados.
6. Marcar huella → esperar máx. 5 min → aparece en el panel;
   **Asistencia → Recalcular** muestra los estados del día.
7. Fin de quincena/mes: revisar → **Cierre de período** (congela los números).

## Módulos

Panel del día (contadores, últimas marcaciones, alertas de equipos caídos) ·
Asistencia (motor: puntual/tardanza/falta/horas extra) · Marcaciones (registro
crudo intocable) · Permisos (individuales y grupales por lotes anulables,
asistente de 3 pasos) · Calendario · Turnos (fijo/partido/nocturno, tolerancias,
vigencias; rotativos = asignaciones encadenadas) · Cierre de período · Reportes
(Excel/PDF, detalle y resumen) · Dispositivos · Organización (departamentos y
cargos) · Empleados (CRUD + importación Excel + envío al equipo) ·
Usuarios/Roles · Auditoría · Configuración · Mi portal (autoconsulta del empleado).

## Comandos útiles

```cmd
php artisan asistencia:recalcular --desde=2026-07-01 --hasta=2026-07-15
php artisan respaldo:crear          :: respaldo .sql en storage/app/respaldos
php artisan puente:token            :: regenera el token (revoca el anterior)
npm run dev                         :: desarrollo frontend con recarga en vivo
npm run build                       :: compilar frontend para uso normal
```

## Solución de problemas

| Síntoma | Causa probable |
|---|---|
| Pantalla blanca | Falta compilar: `npm run build` |
| `SQLSTATE Connection refused` | MySQL apagado (Laragon) |
| "El servicio puente no está corriendo" | Arrancar `puente\iniciar_puente.bat` |
| Timeout al Probar equipo | IP incorrecta, equipo apagado, firewall, o red distinta |
| Marcaciones "Sin registrar" | El código del equipo no coincide con el código biométrico del empleado |
| Todo sale "Sin turno" | Falta asignación de turno vigente en esas fechas |
| Horas/fechas corridas | `APP_TIMEZONE` mal configurada |
| Error 403 en un módulo | El rol del usuario no tiene ese permiso |
| Respaldo falla | `MYSQLDUMP_PATH` no apunta al mysqldump real |

## Notas de producción (pendientes al desplegar)

- Las 3 ventanas deben convertirse en **servicios de Windows** (NSSM o
  Programador de tareas) para sobrevivir reinicios.
- Poner contraseña a MySQL y cambiar `admin1234`.
- Configurar SMTP en `.env` si se quieren notificaciones por correo.
- Equipos faciales solo-PUSH (algunos SpeedFace) no hablan pyzk: requieren
  un receptor PUSH adicional en el puente (extensión futura).
