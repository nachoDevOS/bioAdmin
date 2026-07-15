<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * Vista blade raíz que carga la aplicación (resources/views/app.blade.php).
     */
    protected $rootView = 'app';

    /**
     * Versión de los assets (para invalidar caché del navegador al recompilar).
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Datos COMPARTIDOS con TODAS las páginas React.
     *
     * Todo lo que se devuelva aquí llega automáticamente a cada página
     * como props. Lo usamos para dos cosas:
     *  - auth.usuario : quién está conectado (para el menú y los permisos)
     *  - flash        : mensajes de éxito/error de una sola vez
     *                   (ej. "Empleado guardado") que las pantallas muestran
     *                   después de guardar o eliminar algo.
     */
    public function share(Request $request): array
    {
        $usuario = $request->user();

        return [
            ...parent::share($request),

            'auth' => [
                'usuario' => $usuario ? [
                    'id' => $usuario->id,
                    'nombre' => $usuario->name,
                    'email' => $usuario->email,
                    // Lista de roles del usuario, ej. ["Administrador"]
                    'roles' => $usuario->getRoleNames(),
                    // Lista plana de permisos, ej. ["gestionar-empleados", ...]
                    // El menú lateral la usa para ocultar módulos sin acceso.
                    'permisos' => $usuario->getAllPermissions()->pluck('name'),
                ] : null,
            ],

            'flash' => [
                'exito' => $request->session()->get('exito'),
                'error' => $request->session()->get('error'),
            ],
        ];
    }
}
