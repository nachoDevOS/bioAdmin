// ============================================================
// DEPARTAMENTOS — LISTA.
// Mismo patrón que Dispositivos/Index.jsx (ahí están los
// comentarios detallados de cada parte).
// ============================================================

import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import Paginacion from '../../Components/Paginacion';
import PanelLayout from '../../Layouts/PanelLayout';

export default function Index({ departamentos, filtros }) {
    // ---------- DATOS ----------
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');

    // ---------- FUNCIONES ----------
    function buscarAhora(e) {
        e.preventDefault();
        router.get('/departamentos', { buscar }, { preserveState: true, replace: true });
    }

    function eliminar(departamento) {
        if (
            confirm(
                `¿Eliminar "${departamento.nombre}"?\n` +
                    'Sus empleados NO se borran: quedarán sin departamento.',
            )
        ) {
            router.delete(`/departamentos/${departamento.id}`);
        }
    }

    // ---------- JSX ----------
    return (
        <PanelLayout titulo="Departamentos">
            <Head title="Departamentos" />

            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <form onSubmit={buscarAhora} className="flex gap-2">
                    <input
                        type="text"
                        value={buscar}
                        onChange={(e) => setBuscar(e.target.value)}
                        placeholder="Buscar departamento..."
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
                    href="/departamentos/crear"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    + Nuevo departamento
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                            <th className="px-4 py-3">Nombre</th>
                            <th className="px-4 py-3">Descripción</th>
                            <th className="px-4 py-3">Empleados</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departamentos.data.map((departamento) => (
                            <tr
                                key={departamento.id}
                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                            >
                                <td className="px-4 py-3 font-medium text-slate-800">
                                    {departamento.nombre}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                    {departamento.descripcion || '—'}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                    {/* empleados_count viene del withCount() del controlador */}
                                    {departamento.empleados_count}
                                </td>
                                <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                                    <Link
                                        href={`/departamentos/${departamento.id}/editar`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        Editar
                                    </Link>
                                    <button
                                        onClick={() => eliminar(departamento)}
                                        className="text-red-600 hover:underline"
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {departamentos.data.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-4 py-8 text-center text-slate-400">
                                    No hay departamentos registrados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Paginacion links={departamentos.links} />
        </PanelLayout>
    );
}
