<?php

namespace App\Http\Controllers;

use App\Models\AsignacionTurno;
use App\Models\Empleado;
use App\Models\Turno;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Asignaciones de turno: qué turno tiene cada empleado y en qué fechas.
 * La creación es MASIVA: eliges un turno, marcas varios empleados y
 * todos quedan asignados de una vez.
 */
class AsignacionTurnoController extends Controller
{
    public function index(Request $request): Response
    {
        $busqueda = $request->string('buscar')->toString();

        $asignaciones = AsignacionTurno::query()
            ->with(['empleado:id,nombres,apellidos,codigo_biometrico', 'turno:id,nombre'])
            ->when($busqueda, function ($query) use ($busqueda) {
                $query->whereHas('empleado', function ($q) use ($busqueda) {
                    $q->where('nombres', 'like', "%{$busqueda}%")
                        ->orWhere('apellidos', 'like', "%{$busqueda}%")
                        ->orWhere('codigo_biometrico', 'like', "%{$busqueda}%");
                });
            })
            ->orderByDesc('desde')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Asignaciones/Index', [
            'asignaciones' => $asignaciones,
            'filtros' => ['buscar' => $busqueda],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Asignaciones/Formulario', [
            'turnos' => Turno::where('activo', true)->orderBy('nombre')->get(['id', 'nombre']),
            'empleados' => Empleado::where('activo', true)
                ->orderBy('apellidos')
                ->get(['id', 'nombres', 'apellidos', 'codigo_biometrico']),
        ]);
    }

    /** Crea la asignación para TODOS los empleados marcados. */
    public function store(Request $request): RedirectResponse
    {
        $datos = $request->validate([
            'turno_id' => ['required', 'exists:turnos,id'],
            'empleado_ids' => ['required', 'array', 'min:1'],
            'empleado_ids.*' => ['exists:empleados,id'],
            'desde' => ['required', 'date'],
            'hasta' => ['nullable', 'date', 'after_or_equal:desde'],
        ], [
            'empleado_ids.required' => 'Marca al menos un empleado.',
            'empleado_ids.min' => 'Marca al menos un empleado.',
            'hasta.after_or_equal' => 'La fecha final no puede ser anterior a la inicial.',
        ]);

        foreach ($datos['empleado_ids'] as $empleadoId) {
            AsignacionTurno::create([
                'empleado_id' => $empleadoId,
                'turno_id' => $datos['turno_id'],
                'desde' => $datos['desde'],
                'hasta' => $datos['hasta'],
            ]);
        }

        $cantidad = count($datos['empleado_ids']);

        return redirect('/asignaciones')->with(
            'exito',
            "Turno asignado a {$cantidad} empleado(s). Recalcula la asistencia para ver el efecto.",
        );
    }

    public function destroy(AsignacionTurno $asignacion): RedirectResponse
    {
        $asignacion->delete();

        return redirect('/asignaciones')
            ->with('exito', 'Asignación eliminada. Recalcula la asistencia de esas fechas.');
    }
}
