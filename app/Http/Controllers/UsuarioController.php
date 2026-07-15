<?php

namespace App\Http\Controllers;

use App\Models\Empleado;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

/**
 * Módulo Usuarios del sistema (quiénes pueden entrar al panel).
 * No confundir con Empleados: un empleado marca asistencia;
 * un usuario administra el sistema. Pueden o no ser la misma persona.
 */
class UsuarioController extends Controller
{
    public function index(Request $request): Response
    {
        $busqueda = $request->string('buscar')->toString();

        $usuarios = User::query()
            ->with('roles:id,name')
            ->when($busqueda, function ($query) use ($busqueda) {
                $query->where(function ($q) use ($busqueda) {
                    $q->where('name', 'like', "%{$busqueda}%")
                        ->orWhere('email', 'like', "%{$busqueda}%");
                });
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Usuarios/Index', [
            'usuarios' => $usuarios,
            'filtros' => ['buscar' => $busqueda],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Usuarios/Formulario', [
            'usuario' => null,
            'roles' => Role::orderBy('name')->get(['id', 'name']),
            'empleados' => Empleado::where('activo', true)->orderBy('apellidos')
                ->get(['id', 'nombres', 'apellidos', 'codigo_biometrico']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $datos = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'unique:users,email'],
            // Password::defaults() aplica las reglas de seguridad de Laravel
            'password' => ['required', 'confirmed', Password::defaults()],
            'rol' => ['required', 'exists:roles,name'],
            'empleado_id' => ['nullable', 'exists:empleados,id'],
        ], $this->mensajes());

        $usuario = User::create([
            'name' => $datos['name'],
            'email' => $datos['email'],
            'password' => $datos['password'], // el modelo la cifra solo (cast 'hashed')
            'empleado_id' => $datos['empleado_id'] ?? null, // vínculo para el portal
        ]);

        // syncRoles deja al usuario EXACTAMENTE con este rol
        $usuario->syncRoles([$datos['rol']]);

        return redirect('/usuarios')
            ->with('exito', 'Usuario creado correctamente.');
    }

    public function edit(User $usuario): Response
    {
        return Inertia::render('Usuarios/Formulario', [
            'usuario' => [
                'id' => $usuario->id,
                'name' => $usuario->name,
                'email' => $usuario->email,
                // El primer (y único) rol del usuario, para preseleccionarlo
                'rol' => $usuario->getRoleNames()->first(),
                'empleado_id' => $usuario->empleado_id,
            ],
            'roles' => Role::orderBy('name')->get(['id', 'name']),
            'empleados' => Empleado::where('activo', true)->orderBy('apellidos')
                ->get(['id', 'nombres', 'apellidos', 'codigo_biometrico']),
        ]);
    }

    public function update(Request $request, User $usuario): RedirectResponse
    {
        $datos = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($usuario->id)],
            // Contraseña opcional al editar: vacía = no cambiarla
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'rol' => ['required', 'exists:roles,name'],
            'empleado_id' => ['nullable', 'exists:empleados,id'],
        ], $this->mensajes());

        $usuario->name = $datos['name'];
        $usuario->email = $datos['email'];
        $usuario->empleado_id = $datos['empleado_id'] ?? null;
        if (! empty($datos['password'])) {
            $usuario->password = $datos['password'];
        }
        $usuario->save();

        $usuario->syncRoles([$datos['rol']]);

        return redirect('/usuarios')
            ->with('exito', 'Usuario actualizado correctamente.');
    }

    public function destroy(Request $request, User $usuario): RedirectResponse
    {
        // Regla de seguridad: nadie puede eliminarse a sí mismo
        // (quedaría un sistema sin administradores por accidente).
        if ($usuario->id === $request->user()->id) {
            return redirect('/usuarios')
                ->with('error', 'No puedes eliminar tu propio usuario.');
        }

        $usuario->delete();

        return redirect('/usuarios')
            ->with('exito', 'Usuario eliminado.');
    }

    private function mensajes(): array
    {
        return [
            'name.required' => 'El nombre es obligatorio.',
            'email.required' => 'El correo es obligatorio.',
            'email.unique' => 'Ese correo ya está en uso.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
            'rol.required' => 'Debes asignar un rol.',
        ];
    }
}
