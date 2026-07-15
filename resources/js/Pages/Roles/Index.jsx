// ============================================================
// ROLES — LISTA. Sin buscador (los roles son pocos) ni paginación.
// ============================================================

import { Head, Link, router } from '@inertiajs/react';
import PanelLayout from '../../Layouts/PanelLayout';

export default function Index({ roles }) {
    // ---------- FUNCIONES ----------
    function eliminar(rol) {
        if (confirm(`¿Eliminar el rol "${rol.name}"?`)) {
            router.delete(`/roles/${rol.id}`);
        }
    }

    // ---------- JSX ----------
    return (
        <PanelLayout titulo="Roles y permisos">
            <Head title="Roles" />

            <div className="flex justify-end mb-4">
                <Link
                    href="/roles/crear"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    + Nuevo rol
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                            <th className="px-4 py-3">Rol</th>
                            <th className="px-4 py-3">Permisos</th>
                            <th className="px-4 py-3">Usuarios con este rol</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map((rol) => (
                            <tr
                                key={rol.id}
                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                            >
                                <td className="px-4 py-3 font-medium text-slate-800">{rol.name}</td>
                                <td className="px-4 py-3 text-slate-600">{rol.permissions_count}</td>
                                <td className="px-4 py-3 text-slate-600">{rol.users_count}</td>
                                <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                                    {/* El rol Administrador está protegido en el
                                        controlador; ocultamos también sus botones */}
                                    {rol.name !== 'Administrador' ? (
                                        <>
                                            <Link
                                                href={`/roles/${rol.id}/editar`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                Editar
                                            </Link>
                                            <button
                                                onClick={() => eliminar(rol)}
                                                className="text-red-600 hover:underline"
                                            >
                                                Eliminar
                                            </button>
                                        </>
                                    ) : (
                                        <span className="text-xs text-slate-400">Protegido</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </PanelLayout>
    );
}
