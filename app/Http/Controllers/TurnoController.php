<?php

namespace App\Http\Controllers;

use App\Models\Turno;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Módulo Turnos (horarios de trabajo). Patrón CRUD estándar.
 */
class TurnoController extends Controller
{
    public function index(): Response
    {
        $turnos = Turno::query()
            ->withCount('asignaciones')
            ->orderBy('nombre')
            ->get();

        return Inertia::render('Turnos/Index', [
            'turnos' => $turnos,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Turnos/Formulario', ['turno' => null]);
    }

    public function store(Request $request): RedirectResponse
    {
        Turno::create($this->validar($request));

        return redirect('/turnos')->with('exito', 'Turno creado correctamente.');
    }

    public function edit(Turno $turno): Response
    {
        return Inertia::render('Turnos/Formulario', ['turno' => $turno]);
    }

    public function update(Request $request, Turno $turno): RedirectResponse
    {
        $turno->update($this->validar($request, $turno));

        return redirect('/turnos')->with(
            'exito',
            'Turno actualizado. Recuerda RECALCULAR la asistencia de los días afectados.',
        );
    }

    public function destroy(Turno $turno): RedirectResponse
    {
        // La BD impide borrar turnos con asignaciones (restrictOnDelete);
        // avisamos claro en vez de dejar reventar la consulta.
        if ($turno->asignaciones()->exists()) {
            return redirect('/turnos')->with(
                'error',
                'No se puede eliminar: hay empleados con este turno asignado. Quita esas asignaciones primero.',
            );
        }

        $turno->delete();

        return redirect('/turnos')->with('exito', 'Turno eliminado.');
    }

    private function validar(Request $request, ?Turno $existente = null): array
    {
        $datos = $request->validate([
            'nombre' => [
                'required', 'string', 'max:100',
                Rule::unique('turnos', 'nombre')->ignore($existente?->id),
            ],
            'tipo' => ['required', Rule::in(['fijo', 'partido', 'nocturno'])],
            // formato H:i = "08:00"
            'hora_entrada' => ['required', 'date_format:H:i'],
            'hora_salida' => ['required', 'date_format:H:i'],
            'hora_entrada_2' => ['nullable', 'required_if:tipo,partido', 'date_format:H:i'],
            'hora_salida_2' => ['nullable', 'required_if:tipo,partido', 'date_format:H:i'],
            'tolerancia_entrada_minutos' => ['required', 'integer', 'between:0,120'],
            'dias_laborables' => ['required', 'array', 'min:1'],
            'dias_laborables.*' => ['integer', 'between:1,7'],
            'activo' => ['boolean'],
        ], [
            'nombre.unique' => 'Ya existe un turno con ese nombre.',
            'hora_entrada.date_format' => 'Formato de hora inválido (usa HH:MM).',
            'hora_salida.date_format' => 'Formato de hora inválido (usa HH:MM).',
            'hora_entrada_2.required_if' => 'El turno partido necesita su segundo bloque.',
            'hora_salida_2.required_if' => 'El turno partido necesita su segundo bloque.',
            'dias_laborables.min' => 'Marca al menos un día laborable.',
        ]);

        // El tipo define automáticamente si cruza medianoche
        $datos['cruza_medianoche'] = $datos['tipo'] === 'nocturno';

        // Un turno no partido no guarda segundo bloque (por limpieza)
        if ($datos['tipo'] !== 'partido') {
            $datos['hora_entrada_2'] = null;
            $datos['hora_salida_2'] = null;
        }

        return $datos;
    }
}
