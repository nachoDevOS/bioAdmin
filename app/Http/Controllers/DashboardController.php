<?php

namespace App\Http\Controllers;

use App\Models\Asistencia;
use App\Models\Departamento;
use App\Models\Dispositivo;
use App\Models\Empleado;
use App\Models\Marcacion;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Panel principal (dashboard): contadores generales + últimas
 * marcaciones recolectadas por el puente. El "panel del día" completo
 * (presentes, tardanzas, ausencias) llegará con el motor de asistencia.
 */
class DashboardController extends Controller
{
    public function index(): Response
    {
        // Últimas 10 marcaciones, con su empleado y equipo, en formato
        // simple para React (solo lo que la pantalla necesita).
        $ultimasMarcaciones = Marcacion::query()
            ->with(['empleado:id,nombres,apellidos', 'dispositivo:id,nombre'])
            ->orderByDesc('marcado_en')
            ->limit(10)
            ->get()
            ->map(fn (Marcacion $m) => [
                'id' => $m->id,
                'hora' => $m->marcado_en->format('d/m/Y H:i:s'),
                'codigo' => $m->codigo_biometrico,
                'empleado' => $m->empleado
                    ? "{$m->empleado->apellidos}, {$m->empleado->nombres}"
                    : null,
                'dispositivo' => $m->dispositivo?->nombre ?? '—',
            ]);

        return Inertia::render('Dashboard', [
            'resumen' => [
                'empleados' => Empleado::where('activo', true)->count(),
                'dispositivos' => Dispositivo::count(),
                'dispositivosActivos' => Dispositivo::where('activo', true)->count(),
                'departamentos' => Departamento::count(),
                'usuarios' => User::count(),
                'marcacionesHoy' => Marcacion::whereDate('marcado_en', today())->count(),
            ],
            'ultimasMarcaciones' => $ultimasMarcaciones,
            // Conteo por estado de la asistencia de HOY (lo produce el
            // motor; se refresca con Recalcular o el programador de tareas)
            'asistenciaHoy' => Asistencia::whereDate('fecha', today())
                ->selectRaw('estado, count(*) as cantidad')
                ->groupBy('estado')
                ->pluck('cantidad', 'estado'),
            // ALERTAS: equipos activos que llevan más de 15 minutos sin
            // responder al puente (o que nunca se han conectado)
            'equiposCaidos' => Dispositivo::where('activo', true)
                ->where(function ($q) {
                    $q->whereNull('ultima_conexion')
                        ->orWhere('ultima_conexion', '<', now()->subMinutes(15));
                })
                ->get(['id', 'nombre', 'ip', 'ultima_conexion'])
                ->map(fn (Dispositivo $d) => [
                    'id' => $d->id,
                    'nombre' => $d->nombre,
                    'ip' => $d->ip,
                    'ultima' => $d->ultima_conexion?->diffForHumans() ?? 'nunca conectado',
                ]),
        ]);
    }
}
