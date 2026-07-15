<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Inicio y cierre de sesión del panel.
 */
class AuthController extends Controller
{
    /** Muestra la pantalla de login (página React Auth/Login.jsx). */
    public function mostrarLogin(): Response
    {
        return Inertia::render('Auth/Login');
    }

    /** Procesa el formulario de login. */
    public function iniciarSesion(Request $request): RedirectResponse
    {
        $credenciales = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ], [
            // Mensajes de error en español para el usuario final
            'email.required' => 'El correo es obligatorio.',
            'email.email' => 'El correo no tiene un formato válido.',
            'password.required' => 'La contraseña es obligatoria.',
        ]);

        // Auth::attempt verifica correo + contraseña contra la tabla users.
        // El segundo parámetro ("recordarme") mantiene la sesión abierta.
        if (! Auth::attempt($credenciales, $request->boolean('recordar'))) {
            // back() regresa al login; withErrors hace que React reciba
            // el mensaje dentro de la prop "errors" del formulario.
            return back()->withErrors([
                'email' => 'Las credenciales no coinciden con nuestros registros.',
            ])->onlyInput('email');
        }

        // Regenerar el ID de sesión tras el login previene ataques
        // de fijación de sesión (práctica de seguridad estándar).
        $request->session()->regenerate();

        return redirect()->intended('/panel');
    }

    /** Cierra la sesión y limpia todo rastro de ella. */
    public function cerrarSesion(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }
}
