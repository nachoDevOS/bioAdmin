<?php

namespace App\Http\Controllers;

use App\Models\Departamento;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Módulo Organización — Departamentos.
 * Sigue exactamente el mismo patrón que DispositivoController.
 */
class DepartamentoController extends Controller
{
    public function index(Request $request): Response
    {
        $busqueda = $request->string('buscar')->toString();

        $departamentos = Departamento::query()
            // withCount agrega la columna calculada empleados_count
            // sin cargar todos los empleados (eficiente).
            ->withCount('empleados')
            ->when($busqueda, fn ($q) => $q->where('nombre', 'like', "%{$busqueda}%"))
            ->orderBy('nombre')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Departamentos/Index', [
            'departamentos' => $departamentos,
            'filtros' => ['buscar' => $busqueda],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Departamentos/Formulario', [
            'departamento' => null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $datos = $this->validar($request);

        Departamento::create($datos);

        return redirect('/departamentos')
            ->with('exito', 'Departamento creado correctamente.');
    }

    public function edit(Departamento $departamento): Response
    {
        return Inertia::render('Departamentos/Formulario', [
            'departamento' => $departamento,
        ]);
    }

    public function update(Request $request, Departamento $departamento): RedirectResponse
    {
        $datos = $this->validar($request, $departamento);

        $departamento->update($datos);

        return redirect('/departamentos')
            ->with('exito', 'Departamento actualizado correctamente.');
    }

    public function destroy(Departamento $departamento): RedirectResponse
    {
        // Los empleados NO se borran: su departamento_id queda en null
        // (así lo definimos en la migración con nullOnDelete).
        $departamento->delete();

        return redirect('/departamentos')
            ->with('exito', 'Departamento eliminado. Sus empleados quedaron sin departamento.');
    }

    private function validar(Request $request, ?Departamento $existente = null): array
    {
        return $request->validate([
            'nombre' => [
                'required', 'string', 'max:100',
                Rule::unique('departamentos', 'nombre')->ignore($existente?->id),
            ],
            'descripcion' => ['nullable', 'string', 'max:255'],
        ], [
            'nombre.required' => 'El nombre es obligatorio.',
            'nombre.unique' => 'Ya existe un departamento con ese nombre.',
        ]);
    }
}
