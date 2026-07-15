<?php

namespace App\Http\Controllers;

use App\Models\Empleado;
use App\Models\LotePermiso;
use App\Models\TipoPermiso;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Permisos individuales y GRUPALES.
 *
 * Todo permiso se crea como un LOTE (asistente de 3 pasos):
 *   paso 1: tipo, fechas y motivo
 *   paso 2: empleados (uno o muchos)
 *   paso 3: confirmación
 * El lote es la unidad anulable: anularlo desactiva el permiso
 * de todos sus empleados a la vez.
 */
class PermisoController extends Controller
{
    public function index(): Response
    {
        $lotes = LotePermiso::query()
            ->with(['tipo:id,nombre,color', 'creador:id,name', 'anuladoPor:id,name'])
            ->withCount('permisos')
            ->orderByDesc('created_at')
            ->paginate(15);

        return Inertia::render('Permisos/Index', [
            'lotes' => $lotes,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Permisos/Crear', [
            'tipos' => TipoPermiso::orderBy('nombre')->get(['id', 'nombre', 'color']),
            'empleados' => Empleado::where('activo', true)
                ->orderBy('apellidos')
                ->get(['id', 'nombres', 'apellidos', 'codigo_biometrico']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $datos = $request->validate([
            'tipo_permiso_id' => ['required', 'exists:tipos_permiso,id'],
            'desde' => ['required', 'date'],
            'hasta' => ['required', 'date', 'after_or_equal:desde'],
            'motivo' => ['nullable', 'string', 'max:255'],
            'empleado_ids' => ['required', 'array', 'min:1'],
            'empleado_ids.*' => ['exists:empleados,id'],
        ], [
            'tipo_permiso_id.required' => 'Elige el tipo de permiso.',
            'hasta.after_or_equal' => 'La fecha final no puede ser anterior a la inicial.',
            'empleado_ids.required' => 'Marca al menos un empleado.',
        ]);

        // Transacción: el lote y sus permisos se crean COMPLETOS o nada.
        // Sin esto, un corte a mitad dejaría un lote a medias.
        DB::transaction(function () use ($datos, $request) {
            $lote = LotePermiso::create([
                'tipo_permiso_id' => $datos['tipo_permiso_id'],
                'desde' => $datos['desde'],
                'hasta' => $datos['hasta'],
                'motivo' => $datos['motivo'],
                'user_id' => $request->user()->id,
            ]);

            foreach ($datos['empleado_ids'] as $empleadoId) {
                $lote->permisos()->create(['empleado_id' => $empleadoId]);
            }
        });

        $cantidad = count($datos['empleado_ids']);

        return redirect('/permisos')->with(
            'exito',
            "Permiso otorgado a {$cantidad} empleado(s). Recalcula la asistencia de esas fechas para ver el efecto.",
        );
    }

    /** Anula el lote completo (todos sus empleados a la vez). */
    public function anular(Request $request, LotePermiso $lote): RedirectResponse
    {
        if ($lote->anulado_en !== null) {
            return back()->with('error', 'Este lote ya estaba anulado.');
        }

        $lote->update([
            'anulado_en' => now(),
            'anulado_por_id' => $request->user()->id,
        ]);

        return back()->with(
            'exito',
            'Lote anulado: el permiso dejó de aplicar para sus '
            .$lote->permisos()->count().' empleado(s). Recalcula esas fechas.',
        );
    }
}
