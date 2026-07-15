<?php

namespace App\Http\Controllers;

use App\Models\TipoPermiso;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Catálogo de tipos de permiso (Vacaciones, Descanso médico...).
 * Módulo pequeño: lista + formulario en la misma pantalla.
 */
class TipoPermisoController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('TiposPermiso/Index', [
            'tipos' => TipoPermiso::withCount('lotes')->orderBy('nombre')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $datos = $request->validate([
            'nombre' => ['required', 'string', 'max:100', 'unique:tipos_permiso,nombre'],
            'color' => ['required', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'remunerado' => ['boolean'],
        ], [
            'nombre.unique' => 'Ya existe un tipo con ese nombre.',
            'color.regex' => 'Color inválido.',
        ]);

        TipoPermiso::create($datos);

        return back()->with('exito', 'Tipo de permiso creado.');
    }

    public function destroy(TipoPermiso $tipo): RedirectResponse
    {
        if ($tipo->lotes()->exists()) {
            return back()->with(
                'error',
                'No se puede eliminar: hay permisos otorgados con este tipo.',
            );
        }

        $tipo->delete();

        return back()->with('exito', 'Tipo de permiso eliminado.');
    }
}
