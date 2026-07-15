<?php

namespace App\Http\Controllers;

use App\Models\Cargo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Módulo Organización — Cargos (puestos de trabajo).
 * Mismo patrón estándar de todos los módulos.
 */
class CargoController extends Controller
{
    public function index(Request $request): Response
    {
        $busqueda = $request->string('buscar')->toString();

        $cargos = Cargo::query()
            ->withCount('empleados')
            ->when($busqueda, fn ($q) => $q->where('nombre', 'like', "%{$busqueda}%"))
            ->orderBy('nombre')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Cargos/Index', [
            'cargos' => $cargos,
            'filtros' => ['buscar' => $busqueda],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Cargos/Formulario', [
            'cargo' => null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $datos = $this->validar($request);

        Cargo::create($datos);

        return redirect('/cargos')
            ->with('exito', 'Cargo creado correctamente.');
    }

    public function edit(Cargo $cargo): Response
    {
        return Inertia::render('Cargos/Formulario', [
            'cargo' => $cargo,
        ]);
    }

    public function update(Request $request, Cargo $cargo): RedirectResponse
    {
        $datos = $this->validar($request, $cargo);

        $cargo->update($datos);

        return redirect('/cargos')
            ->with('exito', 'Cargo actualizado correctamente.');
    }

    public function destroy(Cargo $cargo): RedirectResponse
    {
        $cargo->delete();

        return redirect('/cargos')
            ->with('exito', 'Cargo eliminado. Sus empleados quedaron sin cargo.');
    }

    private function validar(Request $request, ?Cargo $existente = null): array
    {
        return $request->validate([
            'nombre' => [
                'required', 'string', 'max:100',
                Rule::unique('cargos', 'nombre')->ignore($existente?->id),
            ],
            'descripcion' => ['nullable', 'string', 'max:255'],
        ], [
            'nombre.required' => 'El nombre es obligatorio.',
            'nombre.unique' => 'Ya existe un cargo con ese nombre.',
        ]);
    }
}
