// ============================================================
// USUARIOS — FORMULARIO (crear/editar). Patrón estándar.
// Al editar, la contraseña es opcional: vacía = no cambiarla.
// ============================================================

import { Head, Link, useForm } from '@inertiajs/react';
import PanelLayout from '../../Layouts/PanelLayout';

export default function Formulario({ usuario, roles, empleados }) {
    // ---------- DATOS ----------
    const editando = usuario !== null;

    const { data, setData, post, put, processing, errors } = useForm({
        name: usuario?.name ?? '',
        email: usuario?.email ?? '',
        password: '',
        password_confirmation: '', // Laravel la compara por la regla "confirmed"
        rol: usuario?.rol ?? '',
        empleado_id: usuario?.empleado_id ?? '', // vínculo para "Mi portal"
    });

    // ---------- FUNCIONES ----------
    function guardar(e) {
        e.preventDefault();
        if (editando) {
            put(`/usuarios/${usuario.id}`);
        } else {
            post('/usuarios');
        }
    }

    // ---------- JSX ----------
    return (
        <PanelLayout titulo={editando ? 'Editar usuario' : 'Nuevo usuario'}>
            <Head title="Usuarios" />

            <form
                onSubmit={guardar}
                className="max-w-xl bg-white rounded-xl border border-slate-200 p-6 space-y-5"
            >
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Nombre *
                    </label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        autoFocus
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Correo electrónico *
                    </label>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Rol *
                    </label>
                    <select
                        value={data.rol}
                        onChange={(e) => setData('rol', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    >
                        <option value="">— Selecciona un rol —</option>
                        {roles.map((rol) => (
                            <option key={rol.id} value={rol.name}>
                                {rol.name}
                            </option>
                        ))}
                    </select>
                    {errors.rol && <p className="mt-1 text-sm text-red-600">{errors.rol}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Empleado vinculado
                    </label>
                    <select
                        value={data.empleado_id}
                        onChange={(e) => setData('empleado_id', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    >
                        <option value="">— Ninguno —</option>
                        {empleados.map((empleado) => (
                            <option key={empleado.id} value={empleado.id}>
                                {empleado.apellidos}, {empleado.nombres} (#{empleado.codigo_biometrico})
                            </option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-slate-400">
                        Vincula al usuario con su ficha de empleado para que vea "Mi portal"
                        (su asistencia, permisos y marcaciones). Usa el rol "Empleado".
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {editando ? 'Nueva contraseña' : 'Contraseña *'}
                        </label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        />
                        {editando && (
                            <p className="mt-1 text-xs text-slate-400">
                                Déjala vacía para mantener la actual.
                            </p>
                        )}
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Confirmar contraseña
                        </label>
                        <input
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {processing ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear usuario'}
                    </button>
                    <Link
                        href="/usuarios"
                        className="rounded-lg border border-slate-300 px-5 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        Cancelar
                    </Link>
                </div>
            </form>
        </PanelLayout>
    );
}
