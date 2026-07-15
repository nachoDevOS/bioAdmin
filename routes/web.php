<?php

use App\Http\Controllers\AsignacionTurnoController;
use App\Http\Controllers\AsistenciaController;
use App\Http\Controllers\AuditoriaController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CalendarioController;
use App\Http\Controllers\CargoController;
use App\Http\Controllers\CierrePeriodoController;
use App\Http\Controllers\ConfiguracionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DepartamentoController;
use App\Http\Controllers\DispositivoController;
use App\Http\Controllers\EmpleadoController;
use App\Http\Controllers\MarcacionController;
use App\Http\Controllers\PermisoController;
use App\Http\Controllers\PortalController;
use App\Http\Controllers\ReporteController;
use App\Http\Controllers\RolController;
use App\Http\Controllers\TipoPermisoController;
use App\Http\Controllers\TurnoController;
use App\Http\Controllers\UsuarioController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas del panel BioAdmin
|--------------------------------------------------------------------------
| Cada módulo repite el mismo esquema de 6 rutas:
|   GET    /modulo                  → lista
|   GET    /modulo/crear            → formulario vacío
|   POST   /modulo                  → guardar nuevo
|   GET    /modulo/{id}/editar      → formulario con datos
|   PUT    /modulo/{id}             → guardar cambios
|   DELETE /modulo/{id}             → eliminar
*/

// La raíz manda al panel; si no hay sesión, el middleware 'auth'
// redirige solo al login.
Route::redirect('/', '/panel');

// ---------- Visitantes (sin sesión) ----------
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'mostrarLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'iniciarSesion']);
});

// ---------- Panel (requiere sesión) ----------
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'cerrarSesion'])->name('logout');

    Route::get('/panel', [DashboardController::class, 'index'])->name('panel');

    // --- Dispositivos ZKTeco ---
    Route::middleware('permission:gestionar-dispositivos')->group(function () {
        Route::get('/dispositivos', [DispositivoController::class, 'index']);
        Route::get('/dispositivos/crear', [DispositivoController::class, 'create']);
        Route::post('/dispositivos', [DispositivoController::class, 'store']);
        Route::get('/dispositivos/{dispositivo}/editar', [DispositivoController::class, 'edit']);
        Route::put('/dispositivos/{dispositivo}', [DispositivoController::class, 'update']);
        Route::delete('/dispositivos/{dispositivo}', [DispositivoController::class, 'destroy']);
        // Prueba de conexión en vivo: Laravel le pide al puente Python
        // que intente hablar con el equipo y devuelve el resultado.
        Route::post('/dispositivos/{dispositivo}/probar', [DispositivoController::class, 'probar']);
    });

    // --- Marcaciones (solo lectura) ---
    Route::middleware('permission:ver-marcaciones')->group(function () {
        Route::get('/marcaciones', [MarcacionController::class, 'index']);
    });

    // --- Turnos y asignaciones ---
    Route::middleware('permission:gestionar-turnos')->group(function () {
        Route::get('/turnos', [TurnoController::class, 'index']);
        Route::get('/turnos/crear', [TurnoController::class, 'create']);
        Route::post('/turnos', [TurnoController::class, 'store']);
        Route::get('/turnos/{turno}/editar', [TurnoController::class, 'edit']);
        Route::put('/turnos/{turno}', [TurnoController::class, 'update']);
        Route::delete('/turnos/{turno}', [TurnoController::class, 'destroy']);

        Route::get('/asignaciones', [AsignacionTurnoController::class, 'index']);
        Route::get('/asignaciones/crear', [AsignacionTurnoController::class, 'create']);
        Route::post('/asignaciones', [AsignacionTurnoController::class, 'store']);
        Route::delete('/asignaciones/{asignacion}', [AsignacionTurnoController::class, 'destroy']);
    });

    // --- Asistencia (ver el resumen diario) + calendario ---
    Route::middleware('permission:ver-asistencia')->group(function () {
        Route::get('/asistencias', [AsistenciaController::class, 'index']);
        Route::get('/calendario', [CalendarioController::class, 'index']);
    });

    // --- Permisos individuales y grupales ---
    Route::middleware('permission:gestionar-permisos')->group(function () {
        Route::get('/permisos', [PermisoController::class, 'index']);
        Route::get('/permisos/crear', [PermisoController::class, 'create']);
        Route::post('/permisos', [PermisoController::class, 'store']);
        Route::post('/permisos/lotes/{lote}/anular', [PermisoController::class, 'anular']);

        Route::get('/tipos-permiso', [TipoPermisoController::class, 'index']);
        Route::post('/tipos-permiso', [TipoPermisoController::class, 'store']);
        Route::delete('/tipos-permiso/{tipo}', [TipoPermisoController::class, 'destroy']);
    });

    // --- Reportes ---
    Route::middleware('permission:ver-reportes')->group(function () {
        Route::get('/reportes', [ReporteController::class, 'index']);
        Route::get('/reportes/descargar', [ReporteController::class, 'descargar']);
    });

    // --- Portal del empleado ---
    Route::middleware('permission:ver-portal')->group(function () {
        Route::get('/portal', [PortalController::class, 'index']);
    });

    // --- Asistencia: recalcular y cerrar período ---
    Route::middleware('permission:gestionar-asistencia')->group(function () {
        Route::post('/asistencias/recalcular', [AsistenciaController::class, 'recalcular']);

        Route::get('/cierres', [CierrePeriodoController::class, 'index']);
        Route::post('/cierres', [CierrePeriodoController::class, 'store']);
        Route::delete('/cierres/{cierre}', [CierrePeriodoController::class, 'destroy']);
    });

    // --- Organización: departamentos y cargos ---
    Route::middleware('permission:gestionar-organizacion')->group(function () {
        Route::get('/departamentos', [DepartamentoController::class, 'index']);
        Route::get('/departamentos/crear', [DepartamentoController::class, 'create']);
        Route::post('/departamentos', [DepartamentoController::class, 'store']);
        Route::get('/departamentos/{departamento}/editar', [DepartamentoController::class, 'edit']);
        Route::put('/departamentos/{departamento}', [DepartamentoController::class, 'update']);
        Route::delete('/departamentos/{departamento}', [DepartamentoController::class, 'destroy']);

        Route::get('/cargos', [CargoController::class, 'index']);
        Route::get('/cargos/crear', [CargoController::class, 'create']);
        Route::post('/cargos', [CargoController::class, 'store']);
        Route::get('/cargos/{cargo}/editar', [CargoController::class, 'edit']);
        Route::put('/cargos/{cargo}', [CargoController::class, 'update']);
        Route::delete('/cargos/{cargo}', [CargoController::class, 'destroy']);
    });

    // --- Empleados ---
    Route::middleware('permission:gestionar-empleados')->group(function () {
        Route::get('/empleados', [EmpleadoController::class, 'index']);

        // Importación Excel (rutas fijas ANTES de las que llevan {empleado})
        Route::get('/empleados/importar', [EmpleadoController::class, 'importar']);
        Route::post('/empleados/importar', [EmpleadoController::class, 'procesarImportacion']);
        Route::get('/empleados/plantilla', [EmpleadoController::class, 'plantilla']);

        // Envío al equipo ZKTeco
        Route::get('/empleados/enviar', [EmpleadoController::class, 'enviarFormulario']);
        Route::post('/empleados/enviar', [EmpleadoController::class, 'enviarAlEquipo']);

        Route::get('/empleados/crear', [EmpleadoController::class, 'create']);
        Route::post('/empleados', [EmpleadoController::class, 'store']);
        Route::get('/empleados/{empleado}/editar', [EmpleadoController::class, 'edit']);
        Route::put('/empleados/{empleado}', [EmpleadoController::class, 'update']);
        Route::delete('/empleados/{empleado}', [EmpleadoController::class, 'destroy']);
        Route::post('/empleados/{empleado}/reactivar', [EmpleadoController::class, 'reactivar']);
    });

    // --- Usuarios y roles del sistema ---
    Route::middleware('permission:gestionar-usuarios')->group(function () {
        Route::get('/usuarios', [UsuarioController::class, 'index']);
        Route::get('/usuarios/crear', [UsuarioController::class, 'create']);
        Route::post('/usuarios', [UsuarioController::class, 'store']);
        Route::get('/usuarios/{usuario}/editar', [UsuarioController::class, 'edit']);
        Route::put('/usuarios/{usuario}', [UsuarioController::class, 'update']);
        Route::delete('/usuarios/{usuario}', [UsuarioController::class, 'destroy']);

        Route::get('/roles', [RolController::class, 'index']);
        Route::get('/roles/crear', [RolController::class, 'create']);
        Route::post('/roles', [RolController::class, 'store']);
        Route::get('/roles/{rol}/editar', [RolController::class, 'edit']);
        Route::put('/roles/{rol}', [RolController::class, 'update']);
        Route::delete('/roles/{rol}', [RolController::class, 'destroy']);
    });

    // --- Auditoría (solo lectura) ---
    Route::middleware('permission:ver-auditoria')->group(function () {
        Route::get('/auditoria', [AuditoriaController::class, 'index']);
    });

    // --- Configuración general ---
    Route::middleware('permission:gestionar-configuracion')->group(function () {
        Route::get('/configuracion', [ConfiguracionController::class, 'index']);
        Route::post('/configuracion', [ConfiguracionController::class, 'guardar']);
    });
});
