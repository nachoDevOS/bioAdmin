// ============================================================
// EMPLEADOS — LISTA.
// Patrón estándar + un filtro extra por estado (activos/inactivos).
// Recordatorio: los empleados no se eliminan, se DESACTIVAN
// (su historial de asistencia debe conservarse siempre).
// ============================================================

import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import Paginacion from '../../Components/Paginacion';
import PanelLayout from '../../Layouts/PanelLayout';

export default function Index({ empleados, filtros }) {
    // ---------- DATOS ----------
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const [estado, setEstado] = useState(filtros.estado ?? 'todos');

    // ---------- FUNCIONES ----------
    function filtrar(e, estadoNuevo = null) {
        if (e) e.preventDefault();
        router.get(
            '/empleados',
            // Si cambió el <select>, usamos el valor nuevo directamente:
            // el estado de React se actualiza "después" y aún tendría el viejo.
            { buscar, estado: estadoNuevo ?? estado },
            { preserveState: true, replace: true },
        );
    }

    function cambiarEstado(e) {
        setEstado(e.target.value);
        filtrar(null, e.target.value);
    }

    function desactivar(empleado) {
        if (
            confirm(
                `¿Desactivar a ${empleado.nombres} ${empleado.apellidos}?\n` +
                    'No se elimina: su historial de marcaciones se conserva.',
            )
        ) {
            router.delete(`/empleados/${empleado.id}`);
        }
    }

    function reactivar(empleado) {
        router.post(`/empleados/${empleado.id}/reactivar`);
    }

    // ---------- JSX ----------
    return (
        <PanelLayout titulo="Empleados">
            <Head title="Empleados" />

            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <form onSubmit={filtrar} className="flex flex-wrap gap-2">
                    <input
                        type="text"
                        value={buscar}
                        onChange={(e) => setBuscar(e.target.value)}
                        placeholder="Nombre, código o documento..."
                        className="w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    />

                    {/* Select controlado: igual que un input, pero con opciones */}
                    <select
                        value={estado}
                        onChange={cambiarEstado}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    >
                        <option value="todos">Todos</option>
                        <option value="activos">Solo activos</option>
                        <option value="inactivos">Solo inactivos</option>
                    </select>

                    <button
                        type="submit"
                        className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-800"
                    >
                        Buscar
                    </button>
                </form>

                {/* Acciones del módulo: importar, enviar al equipo, crear */}
                <div className="flex flex-wrap gap-2">
                    <Link
                        href="/empleados/importar"
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                        ⬆ Importar Excel
                    </Link>
                    <Link
                        href="/empleados/enviar"
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                        ⇄ Enviar al equipo
                    </Link>
                    <Link
                        href="/empleados/crear"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        + Nuevo empleado
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                            <th className="px-4 py-3">Código</th>
                            <th className="px-4 py-3">Empleado</th>
                            <th className="px-4 py-3">Departamento</th>
                            <th className="px-4 py-3">Cargo</th>
                            <th className="px-4 py-3">Estado</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {empleados.data.map((empleado) => (
                            <tr
                                key={empleado.id}
                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                            >
                                <td className="px-4 py-3 font-mono text-slate-600">
                                    {empleado.codigo_biometrico}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-medium text-slate-800">
                                        {empleado.apellidos}, {empleado.nombres}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        {empleado.documento || 'sin documento'}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                    {/* ?. evita error si no tiene departamento asignado */}
                                    {empleado.departamento?.nombre || '—'}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                    {empleado.cargo?.nombre || '—'}
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={
                                            'rounded-full px-2.5 py-0.5 text-xs font-medium ' +
                                            (empleado.activo
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-slate-100 text-slate-500')
                                        }
                                    >
                                        {empleado.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                                    <Link
                                        href={`/empleados/${empleado.id}/editar`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        Editar
                                    </Link>
                                    {empleado.activo ? (
                                        <button
                                            onClick={() => desactivar(empleado)}
                                            className="text-red-600 hover:underline"
                                        >
                                            Desactivar
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => reactivar(empleado)}
                                            className="text-green-600 hover:underline"
                                        >
                                            Reactivar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}

                        {empleados.data.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-4 py-8 text-center text-slate-400">
                                    No hay empleados que coincidan con los filtros.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Paginacion links={empleados.links} />
        </PanelLayout>
    );
}
