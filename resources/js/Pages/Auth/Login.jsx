// ============================================================
// PANTALLA DE LOGIN — única pantalla SIN el layout del panel.
//
// CONCEPTO REACT #4 — ESTADO y FORMULARIO CONTROLADO:
// En React, lo que se escribe en un <input> no vive en el HTML
// (como en PHP clásico) sino en una "caja de memoria" del componente
// llamada ESTADO. El input muestra lo que hay en la caja (value=...)
// y cada tecla actualiza la caja (onChange=...). A eso se le llama
// "formulario controlado": React siempre sabe qué hay escrito.
//
// Aquí la caja nos la da useForm() de Inertia, que además sabe:
//   - enviar los datos a Laravel (post)
//   - recibir los errores de validación (errors)
//   - avisar mientras envía (processing) para deshabilitar el botón
// ============================================================

import { Head, useForm } from '@inertiajs/react';

export default function Login() {
    // ---------- DATOS ----------
    // data      = los valores actuales de los campos
    // setData   = función para cambiar un campo: setData('email', 'a@b.com')
    // post      = envía el formulario a Laravel
    // errors    = errores de validación que Laravel devuelva
    // processing= true mientras la petición viaja (para bloquear el botón)
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        recordar: false,
    });

    // ---------- FUNCIONES ----------
    function enviar(e) {
        // Evita que el navegador recargue la página (comportamiento
        // clásico de los formularios HTML). Inertia lo hace por AJAX.
        e.preventDefault();
        post('/login');
    }

    // ---------- JSX ----------
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
            {/* <Head> cambia el título de la pestaña del navegador */}
            <Head title="Iniciar sesión" />

            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="text-3xl font-bold text-white">BioAdmin</div>
                    <div className="text-sm text-slate-400 mt-1">
                        Sistema de asistencia biométrica
                    </div>
                </div>

                <form
                    onSubmit={enviar}
                    className="bg-white rounded-xl shadow-lg p-8 space-y-5"
                >
                    {/* ----- Correo ----- */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Correo electrónico
                        </label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            placeholder="admin@bioadmin.test"
                            autoFocus
                        />
                        {/* Si Laravel devolvió un error para este campo, se muestra */}
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>

                    {/* ----- Contraseña ----- */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                        )}
                    </div>

                    {/* ----- Recordarme ----- */}
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                            type="checkbox"
                            checked={data.recordar}
                            onChange={(e) => setData('recordar', e.target.checked)}
                            className="rounded border-slate-300"
                        />
                        Mantener la sesión abierta
                    </label>

                    {/* ----- Botón ----- */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {processing ? 'Entrando...' : 'Entrar al panel'}
                    </button>
                </form>
            </div>
        </div>
    );
}
