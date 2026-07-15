// ============================================================
// ASIGNACIONES DE TURNO — LISTA.
// Muestra qué turno tiene cada empleado y su vigencia.
// Un empleado con varias filas en fechas distintas = turno rotativo.
// ============================================================

import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import Paginacion from '../../Components/Paginacion';
import PanelLayout from '../../Layouts/PanelLayout';

export default function Index({ asignaciones, filtros }) {
    // ---------- DATOS ----------
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');

    // ---------- FUNCIONES ----------
    function buscarAhora(e) {
        e.preventDefault();
        router.get('/asignaciones', { buscar }, { preserveState: true, replace: true });
    }

    function eliminar(asignacion) {
        const nombre = `${asignacion.empleado.nombres} ${asignacion.empleado.apellidos}`;
        if (confirm(`¿Quitar el turno "${asignacion.turno.nombre}" a ${nombre}?`)) {
            router.delete(`/asignaciones/${asignacion.id}`);
        }
    }

    // "2026-07-01T00:00:00..." → "01/07/2026"
    function fecha(texto) {
        if (!texto) return null;
        const [anio, mes, dia] = texto.substring(0, 10).split('-');
        return `${dia}/${mes}/${anio}`;
    }

    // ---------- JSX ----------
    return (
        <PanelLayout titulo="Asignaciones de turno">
            <Head title="Asignaciones" />

            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <form onSubmit={buscarAhora} className="flex gap-2">
                    <input
                        type="text"
                        value={buscar}
                        onChange={(e) => setBuscar(e.target.value)}
                        placeholder="Buscar empleado..."
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
                    href="/asignaciones/crear"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    + Asignar turno
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                            <th className="px-4 py-3">Empleado</th>
                            <th className="px-4 py-3">Turno</th>
                            <th className="px-4 py-3">Desde</th>
                            <th className="px-4 py-3">Hasta</th>
                            <th className="px-4 py-3">Estado</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {asignaciones.data.map((asignacion) => (
                            <tr
                                key={asignacion.id}
                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                            >
                                <td className="px-4 py-3">
                                    <span className="font-medium text-slate-800">
                                        {asignacion.empleado.apellidos}, {asignacion.empleado.nombres}
                                    </span>
                                    <span className="ml-2 font-mono text-xs text-slate-400">
                                        #{asignacion.empleado.codigo_biometrico}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                    {asignacion.turno.nombre}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                    {fecha(asignacion.desde)}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                    {fecha(asignacion.hasta) ?? (
                                        <span className="text-slate-400">Indefinido</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {/* vigente_hoy lo calcula el controlador */}
                                    {asignacion.vigente_hoy ? (
                                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                                            Vigente hoy
                                        </span>
                                    ) : (
                                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">
                                            Histórica / futura
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                                    <Link
                                        href={`/asignaciones/${asignacion.id}/editar`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        Editar
                                    </Link>
                                    <button
                                        onClick={() => eliminar(asignacion)}
                                        className="text-red-600 hover:underline"
                                    >
                                        Quitar
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {asignaciones.data.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-4 py-8 text-center text-slate-400">
                                    Sin asignaciones. Usa "+ Asignar turno" para empezar.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Paginacion links={asignaciones.links} />
        </PanelLayout>
    );
}
