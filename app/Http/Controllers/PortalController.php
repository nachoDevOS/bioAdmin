<?php

namespace App\Http\Controllers;

use App\Models\Asistencia;
use App\Models\Marcacion;
use App\Models\Permiso;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * PORTAL DEL EMPLEADO: cada empleado (con usuario vinculado) ve
 * SU asistencia del mes, SUS permisos y SUS últimas marcaciones.
 * Solo lectura, y solo de sus propios datos.
 */
class PortalController extends Controller
{
    public function index(Request $request): Response
    {
        $empleado = $request->user()->empleado;

        // Usuario sin empleado vinculado: se le explica en pantalla
        if (! $empleado) {
            return Inertia::render('Portal/Index', ['datos' => null]);
        }

        $inicioMes = today()->startOfMonth();

        $asistencias = Asistencia::query()
            ->with('turno:id,nombre')
            ->where('empleado_id', $empleado->id)
            ->whereBetween('fecha', [$inicioMes, today()])
            ->orderByDesc('fecha')
            ->get()
            ->map(fn (Asistencia $a) => [
                'id' => $a->id,
                'fecha' => $a->fecha->format('d/m/Y'),
                'estado' => $a->estado,
                'turno' => $a->turno?->nombre,
                'entrada' => $a->primera_marcacion?->format('H:i'),
                'salida' => $a->ultima_marcacion?->format('H:i'),
                'tardanza' => $a->minutos_tardanza,
                'horas' => (float) $a->horas_trabajadas,
                'extra' => (float) $a->horas_extra,
            ]);

        $permisos = Permiso::query()
            ->where('empleado_id', $empleado->id)
            ->whereHas('lote', fn ($q) => $q->whereNull('anulado_en')
                ->whereDate('hasta', '>=', today()->subMonths(2)))
            ->with('lote.tipo:id,nombre,color')
            ->get()
            ->map(fn (Permiso $p) => [
                'id' => $p->id,
                'tipo' => $p->lote->tipo->nombre,
                'color' => $p->lote->tipo->color,
                'desde' => $p->lote->desde->format('d/m/Y'),
                'hasta' => $p->lote->hasta->format('d/m/Y'),
                'motivo' => $p->lote->motivo,
            ]);

        $marcaciones = Marcacion::query()
            ->with('dispositivo:id,nombre')
            ->where('empleado_id', $empleado->id)
            ->orderByDesc('marcado_en')
            ->limit(10)
            ->get()
            ->map(fn (Marcacion $m) => [
                'id' => $m->id,
                'hora' => $m->marcado_en->format('d/m/Y H:i:s'),
                'dispositivo' => $m->dispositivo?->nombre ?? '—',
            ]);

        return Inertia::render('Portal/Index', [
            'datos' => [
                'empleado' => [
                    'nombre' => $empleado->nombre_completo,
                    'codigo' => $empleado->codigo_biometrico,
                ],
                'mes' => today()->translatedFormat('F Y'),
                'asistencias' => $asistencias,
                'permisos' => $permisos,
                'marcaciones' => $marcaciones,
                'estados' => Asistencia::ESTADOS,
            ],
        ]);
    }
}
