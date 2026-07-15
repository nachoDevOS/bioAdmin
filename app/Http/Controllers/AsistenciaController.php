<?php

namespace App\Http\Controllers;

use App\Models\Asistencia;
use App\Services\MotorAsistencia;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Módulo Asistencia: el resumen diario que produce el motor
 * (puntual/tardanza/falta, horas trabajadas, horas extra)
 * + el botón "Recalcular".
 */
class AsistenciaController extends Controller
{
    public function index(Request $request): Response
    {
        // Por defecto: el mes en curso
        $desde = $request->string('desde')->toString() ?: today()->startOfMonth()->toDateString();
        $hasta = $request->string('hasta')->toString() ?: today()->toDateString();
        $estado = $request->string('estado')->toString();
        $busqueda = $request->string('buscar')->toString();

        $asistencias = Asistencia::query()
            ->with(['empleado:id,nombres,apellidos,codigo_biometrico', 'turno:id,nombre'])
            ->whereBetween('fecha', [$desde, $hasta])
            ->when($estado, fn ($q) => $q->where('estado', $estado))
            ->when($busqueda, function ($query) use ($busqueda) {
                $query->whereHas('empleado', function ($q) use ($busqueda) {
                    $q->where('nombres', 'like', "%{$busqueda}%")
                        ->orWhere('apellidos', 'like', "%{$busqueda}%")
                        ->orWhere('codigo_biometrico', 'like', "%{$busqueda}%");
                });
            })
            ->orderByDesc('fecha')
            ->orderBy('empleado_id')
            ->paginate(20)
            ->withQueryString();

        // Totales del rango filtrado, para las tarjetas de arriba
        $totales = Asistencia::query()
            ->whereBetween('fecha', [$desde, $hasta])
            ->selectRaw('estado, count(*) as cantidad')
            ->groupBy('estado')
            ->pluck('cantidad', 'estado');

        return Inertia::render('Asistencias/Index', [
            'asistencias' => $asistencias,
            'totales' => $totales,
            'estados' => Asistencia::ESTADOS,
            'filtros' => [
                'desde' => $desde,
                'hasta' => $hasta,
                'estado' => $estado,
                'buscar' => $busqueda,
            ],
        ]);
    }

    /** Botón "Recalcular": ejecuta el motor sobre el rango elegido. */
    public function recalcular(Request $request, MotorAsistencia $motor): RedirectResponse
    {
        $datos = $request->validate([
            'desde' => ['required', 'date'],
            'hasta' => ['required', 'date', 'after_or_equal:desde'],
        ], [
            'hasta.after_or_equal' => 'La fecha final no puede ser anterior a la inicial.',
        ]);

        $resultado = $motor->recalcularRango(
            Carbon::parse($datos['desde']),
            Carbon::parse($datos['hasta']),
        );

        $mensaje = "Recálculo terminado: {$resultado['procesados']} día-empleado procesados.";
        if ($resultado['saltados_por_cierre'] > 0) {
            $mensaje .= " {$resultado['saltados_por_cierre']} saltados (período cerrado).";
        }

        return back()->with('exito', $mensaje);
    }
}
