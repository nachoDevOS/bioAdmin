// ============================================================
// MARCACIONES — SOLO LECTURA.
// Registro crudo que el puente recolecta de los equipos cada
// 5 minutos. No hay crear/editar/eliminar a propósito: el
// historial de marcaciones es intocable.
// ============================================================

import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Paginacion from '../../Components/Paginacion';
import PanelLayout from '../../Layouts/PanelLayout';

export default function Index({ marcaciones, filtros }) {
    // ---------- DATOS ----------
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const [fecha, setFecha] = useState(filtros.fecha ?? '');

    // ---------- FUNCIONES ----------
    function filtrar(e) {
        e.preventDefault();
        router.get('/marcaciones', { buscar, fecha }, { preserveState: true, replace: true });
    }

    function limpiarFiltros() {
        setBuscar('');
        setFecha('');
        router.get('/marcaciones', {}, { preserveState: true, replace: true });
    }

    // Convierte "2026-07-14T08:03:21..." a "14/07/2026 08:03:21"
    function formatearFechaHora(texto) {
        const f = new Date(texto);
        return f.toLocaleString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    }

    // ---------- JSX ----------
    return (
        <PanelLayout titulo="Marcaciones">
            <Head title="Marcaciones" />

            <div className="flex flex-wrap items-center gap-2 mb-4">
                <form onSubmit={filtrar} className="flex flex-wrap gap-2">
                    <input
                        type="text"
                        value={buscar}
                        onChange={(e) => setBuscar(e.target.value)}
                        placeholder="Código o nombre del empleado..."
                        className="w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    />
                    <input
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    />
                    <button
                        type="submit"
                        className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-800"
                    >
                        Filtrar
                    </button>
                    <button
                        type="button"
                        onClick={limpiarFiltros}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        Limpiar
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                            <th className="px-4 py-3">Fecha y hora</th>
                            <th className="px-4 py-3">Código</th>
                            <th className="px-4 py-3">Empleado</th>
                            <th className="px-4 py-3">Equipo</th>
                            <th className="px-4 py-3">Códigos crudos</th>
                        </tr>
                    </thead>
                    <tbody>
                        {marcaciones.data.map((marcacion) => (
                            <tr
                                key={marcacion.id}
                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                            >
                                <td className="px-4 py-3 whitespace-nowrap text-slate-800 font-medium">
                                    {formatearFechaHora(marcacion.marcado_en)}
                                </td>
                                <td className="px-4 py-3 font-mono text-slate-600">
                                    {marcacion.codigo_biometrico}
                                </td>
                                <td className="px-4 py-3">
                                    {marcacion.empleado ? (
                                        <span className="text-slate-800">
                                            {marcacion.empleado.apellidos}, {marcacion.empleado.nombres}
                                        </span>
                                    ) : (
                                        // Código que no corresponde a ningún empleado
                                        // registrado: probablemente falta darlo de alta
                                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                                            Sin registrar
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                    {marcacion.dispositivo?.nombre ?? '—'}
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                                    punch={marcacion.punch ?? '-'} status={marcacion.status ?? '-'}
                                </td>
                            </tr>
                        ))}

                        {marcaciones.data.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                                    Sin marcaciones todavía. Cuando el puente esté corriendo y
                                    alguien marque en el equipo, aparecerán aquí solas (máximo 5 minutos).
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Paginacion links={marcaciones.links} />
        </PanelLayout>
    );
}
