// ============================================================
// USUARIOS DEL SISTEMA — LISTA. Patrón estándar.
// (No confundir con Empleados: estos son quienes ENTRAN AL PANEL.)
// ============================================================

import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Paginacion from '../../Components/Paginacion';
import PanelLayout from '../../Layouts/PanelLayout';

export default function Index({ usuarios, filtros }) {
    // ---------- DATOS ----------
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    // Usuario conectado, para no mostrarle el botón "Eliminar" sobre sí mismo
    const { auth } = usePage().props;

    // ---------- FUNCIONES ----------
    function buscarAhora(e) {
        e.preventDefault();
        router.get('/usuarios', { buscar }, { preserveState: true, replace: true });
    }

    function eliminar(usuario) {
        if (confirm(`¿Eliminar al usuario "${usuario.name}"?`)) {
            router.delete(`/usuarios/${usuario.id}`);
        }
    }

    // ---------- JSX ----------
    return (
        <PanelLayout titulo="Usuarios del sistema">
            <Head title="Usuarios" />

            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <form onSubmit={buscarAhora} className="flex gap-2">
                    <input
                        type="text"
                        value={buscar}
                        onChange={(e) => setBuscar(e.target.value)}
                        placeholder="Buscar por nombre o correo..."
                        className="w-72 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    />
                    <button
                        type="submit"
                        className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-800"
                    >
                        Buscar
                    </button>
                </form>

                <Link
                    href="/usuarios/crear"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    + Nuevo usuario
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                            <th className="px-4 py-3">Nombre</th>
                            <th className="px-4 py-3">Correo</th>
                            <th className="px-4 py-3">Rol</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.data.map((usuario) => (
                            <tr
                                key={usuario.id}
                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                            >
                                <td className="px-4 py-3 font-medium text-slate-800">
                                    {usuario.name}
                                    {usuario.id === auth.usuario.id && (
                                        <span className="ml-2 text-xs text-blue-500">(tú)</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-slate-600">{usuario.email}</td>
                                <td className="px-4 py-3">
                                    {usuario.roles.map((rol) => (
                                        <span
                                            key={rol.id}
                                            className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700"
                                        >
                                            {rol.name}
                                        </span>
                                    ))}
                                </td>
                                <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                                    <Link
                                        href={`/usuarios/${usuario.id}/editar`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        Editar
                                    </Link>
                                    {/* Nadie puede eliminarse a sí mismo */}
                                    {usuario.id !== auth.usuario.id && (
                                        <button
                                            onClick={() => eliminar(usuario)}
                                            className="text-red-600 hover:underline"
                                        >
                                            Eliminar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Paginacion links={usuarios.links} />
        </PanelLayout>
    );
}
