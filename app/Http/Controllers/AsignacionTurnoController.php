<?php

namespace App\Http\Controllers;

use App\Models\AsignacionTurno;
use App\Models\Empleado;
use App\Models\Turno;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Asignaciones de turno: qué turno tiene cada empleado y en qué fechas.
 *
 * Reglas de orden:
 *  - La creación es MASIVA (un turno → varios empleados a la vez).
 *  - Al asignar un turno nuevo, la asignación ABIERTA anterior del
 *    empleado se cierra sola el día previo (así los rotativos quedan
 *    encadenados sin superposiciones).
 *  - Las asignaciones se pueden editar (turno, desde, hasta) o quitar.
 */
class AsignacionTurnoController extends Controller
{
    public function index(Request $request): Response
    {
        $busqueda = $request->string('buscar')->toString();
        $hoy = today();

        $asignaciones = AsignacionTurno::query()
            ->with(['empleado:id,nombres,apellidos,codigo_biometrico', 'turno:id,nombre'])
            ->when($busqueda, function ($query) use ($busqueda) {
                $query->whereHas('empleado', function ($q) use ($busqueda) {
                    $q->where('nombres', 'like', "%{$busqueda}%")
                        ->orWhere('apellidos', 'like', "%{$busqueda}%")
                        ->orWhere('codigo_biometrico', 'like', "%{$busqueda}%");
                });
            })
            // Orden útil: por empleado, y sus asignaciones de la más
            // reciente a la más antigua (se lee como historial).
            ->join('empleados', 'empleados.id', '=', 'asignaciones_turno.empleado_id')
            ->orderBy('empleados.apellidos')
            ->orderByDesc('asignaciones_turno.desde')
            ->select('asignaciones_turno.*')
            ->paginate(15)
            ->withQueryString()
            // through(): agrega a cada fila el dato calculado "vigente_hoy"
            // sin romper la estructura de paginación.
            ->through(function (AsignacionTurno $a) use ($hoy) {
                $a->vigente_hoy = $a->desde->lte($hoy)
                    && ($a->hasta === null || $a->hasta->gte($hoy));

                return $a;
            });

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

    /**
     * Crea la asignación para TODOS los empleados marcados y CIERRA
     * las asignaciones anteriores que se superpondrían.
     */
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

        $cerradas = 0;

        // Transacción: cierres y altas se hacen COMPLETOS o nada
        DB::transaction(function () use ($datos, &$cerradas) {
            $diaAnterior = \Carbon\Carbon::parse($datos['desde'])->subDay()->toDateString();

            foreach ($datos['empleado_ids'] as $empleadoId) {
                // Cerrar las asignaciones del empleado que empezaron antes
                // y siguen abiertas (o terminan después del nuevo inicio):
                // su nuevo "hasta" es el día previo al turno nuevo.
                $cerradas += AsignacionTurno::query()
                    ->where('empleado_id', $empleadoId)
                    ->whereDate('desde', '<', $datos['desde'])
                    ->where(function ($q) use ($datos) {
                        $q->whereNull('hasta')
                            ->orWhereDate('hasta', '>=', $datos['desde']);
                    })
                    ->update(['hasta' => $diaAnterior]);

                // firstOrCreate: si ya existe una asignación IDÉNTICA
                // (mismo empleado, turno y fecha de inicio) no crea otra.
                // Blinda contra doble clic o reenvíos del formulario.
                AsignacionTurno::firstOrCreate(
                    [
                        'empleado_id' => $empleadoId,
                        'turno_id' => $datos['turno_id'],
                        'desde' => $datos['desde'],
                    ],
                    ['hasta' => $datos['hasta']],
                );
            }
        });

        $cantidad = count($datos['empleado_ids']);
        $mensaje = "Turno asignado a {$cantidad} empleado(s).";
        if ($cerradas > 0) {
            $mensaje .= " Se cerraron {$cerradas} asignación(es) anteriores el día previo (sin superposición).";
        }
        $mensaje .= ' Recalcula la asistencia para ver el efecto.';

        return redirect('/asignaciones')->with('exito', $mensaje);
    }

    public function edit(AsignacionTurno $asignacion): Response
    {
        $asignacion->load('empleado:id,nombres,apellidos,codigo_biometrico');

        return Inertia::render('Asignaciones/Editar', [
            'asignacion' => $asignacion,
            'turnos' => Turno::where('activo', true)->orderBy('nombre')->get(['id', 'nombre']),
        ]);
    }

    public function update(Request $request, AsignacionTurno $asignacion): RedirectResponse
    {
        $datos = $request->validate([
            'turno_id' => ['required', 'exists:turnos,id'],
            'desde' => ['required', 'date'],
            'hasta' => ['nullable', 'date', 'after_or_equal:desde'],
        ], [
            'hasta.after_or_equal' => 'La fecha final no puede ser anterior a la inicial.',
        ]);

        $asignacion->update($datos);

        return redirect('/asignaciones')->with(
            'exito',
            'Asignación actualizada. Recalcula la asistencia de las fechas afectadas.',
        );
    }

    public function destroy(AsignacionTurno $asignacion): RedirectResponse
    {
        $asignacion->delete();

        return redirect('/asignaciones')
            ->with('exito', 'Asignación eliminada. Recalcula la asistencia de esas fechas.');
    }
}
