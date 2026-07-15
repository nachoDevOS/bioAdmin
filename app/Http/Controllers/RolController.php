<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Módulo Roles y permisos.
 * Un rol agrupa permisos (ej. "RRHH" puede gestionar empleados pero
 * no usuarios). Los permisos disponibles se definen en el seeder;
 * aquí solo se combinan en roles.
 */
class RolController extends Controller
{
    public function index(): Response
    {
        $roles = Role::query()
            ->withCount(['permissions', 'users'])
            ->orderBy('name')
            ->get();

        return Inertia::render('Roles/Index', [
            'roles' => $roles,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Roles/Formulario', [
            'rol' => null,
            'permisosDisponibles' => Permission::orderBy('name')->pluck('name'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $datos = $this->validar($request);

        $rol = Role::create(['name' => $datos['name']]);
        $rol->syncPermissions($datos['permisos'] ?? []);

        return redirect('/roles')
            ->with('exito', 'Rol creado correctamente.');
    }

    public function edit(Role $rol): Response
    {
        return Inertia::render('Roles/Formulario', [
            'rol' => [
                'id' => $rol->id,
                'name' => $rol->name,
                // Permisos que el rol ya tiene, para marcar sus casillas
                'permisos' => $rol->permissions->pluck('name'),
            ],
            'permisosDisponibles' => Permission::orderBy('name')->pluck('name'),
        ]);
    }

    public function update(Request $request, Role $rol): RedirectResponse
    {
        // El rol Administrador es intocable: garantiza que siempre
        // exista alguien con acceso total al sistema.
        if ($rol->name === 'Administrador') {
            return redirect('/roles')
                ->with('error', 'El rol Administrador no se puede modificar.');
        }

        $datos = $this->validar($request, $rol);

        $rol->update(['name' => $datos['name']]);
        $rol->syncPermissions($datos['permisos'] ?? []);

        return redirect('/roles')
            ->with('exito', 'Rol actualizado correctamente.');
    }

    public function destroy(Role $rol): RedirectResponse
    {
        if ($rol->name === 'Administrador') {
            return redirect('/roles')
                ->with('error', 'El rol Administrador no se puede eliminar.');
        }

        if ($rol->users()->count() > 0) {
            return redirect('/roles')
                ->with('error', 'No se puede eliminar: hay usuarios con este rol. Reasígnalos primero.');
        }

        $rol->delete();

        return redirect('/roles')
            ->with('exito', 'Rol eliminado.');
    }

    private function validar(Request $request, ?Role $existente = null): array
    {
        return $request->validate([
            'name' => [
                'required', 'string', 'max:50',
                Rule::unique('roles', 'name')->ignore($existente?->id),
            ],
            'permisos' => ['array'],
            'permisos.*' => ['string', 'exists:permissions,name'],
        ], [
            'name.required' => 'El nombre del rol es obligatorio.',
            'name.unique' => 'Ya existe un rol con ese nombre.',
        ]);
    }
}
