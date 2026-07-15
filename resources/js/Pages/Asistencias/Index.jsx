// ============================================================
// ASISTENCIA — el resumen diario que produce el motor.
// Filtros por rango de fechas, estado y empleado + botón Recalcular.
// Los días de períodos cerrados aparecen con un candado.
// ============================================================

import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Paginacion from '../../Components/Paginacion';
import PanelLayout from '../../Layouts/PanelLayout';

// Color de la insignia según el estado
const COLORES_ESTADO = {
    puntual: 'bg-green-100 text-green-700',
    tardanza: 'bg-amber-100 text-amber-700',
    falta: 'bg-red-100 text-red-700',
    incompleta: 'bg-orange-100 text-orange-700',
    permiso: 'bg-sky-100 text-sky-700',
    descanso: 'bg-slate-100 text-slate-500',
    sin_turno: 'bg-violet-100 text-violet-600',
};

export default function Index({ asistencias, totales, estados, filtros }) {
    // ---------- DATOS ----------
    const [desde, setDesde] = useState(filtros.desde);
    const [hasta, setHasta] = useState(filtros.hasta);
    const [estado, setEstado] = useState(filtros.estado ?? '');
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const [recalculando, setRecalculando] = useState(false);

    // ¿El usuario puede recalcular? (permiso compartido por el layout)
    const { auth } = usePage().props;
    const puedeRecalcular = auth.usuario.permisos.includes('gestionar-asistencia');

    // ---------- FUNCIONES ----------
    function filtrar(e) {
        e.preventDefault();
        router.get(
            '/asistencias',
            { desde, hasta, estado, buscar },
            { preserveState: true, replace: true },
        );
    }

    function recalcular() {
        if (
            confirm(
                `Se recalculará la asistencia del ${desde} al ${hasta} ` +
                    'a partir de las marcaciones. Los días de períodos cerrados ' +
                    'no se tocan. ¿Continuar?',
            )
        ) {
            setRecalculando(true);
            router.post(
                '/asistencias/recalcular',
                { desde, hasta },
                { preserveScroll: true, onFinish: () => setRecalculando(false) },
            );
        }
    }

    // "2026-07-14T..." → "14/07/2026" y "...T08:01:11..." → "08:01"
    function soloFecha(texto) {
        const [anio, mes, dia] = texto.substring(0, 10).split('-');
        return `${dia}/${mes}/${anio}`;
    }

    function soloHora(texto) {
        return texto ? texto.substring(11, 16) : '—';
    }

    // ---------- JSX ----------
    return (
        <PanelLayout titulo="Asistencia">
            <Head title="Asistencia" />

            {/* Totales del rango: una tarjetita por estado */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                {Object.entries(estados).map(([clave, nombre]) => (
                    <div
                        key={clave}
                        className="bg-white rounded-lg border border-slate-200 px-3 py-2 text-center"
                    >
                        <div className="text-xl font-bold text-slate-800">
                            {totales[clave] ?? 0}
                        </div>
                        <div className={`inline-block rounded-full px-2 text-xs ${COLORES_ESTADO[clave]}`}>
                            {nombre}
                        </div>
                    </div>
                ))}
            </div>

            {/* Filtros + recalcular */}
            <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
                <form onSubmit={filtrar} className="flex flex-wrap items-end gap-2">
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Desde</label>
                        <input
                            type="date"
                            value={desde}
                            onChange={(e) => setDesde(e.target.value)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Hasta</label>
                        <input
                            type="date"
                            value={hasta}
                            onChange={(e) => setHasta(e.target.value)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        />
                    </div>
                    <select
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    >
                        <option value="">Todos los estados</option>
                        {Object.entries(estados).map(([clave, nombre]) => (
                            <option key={clave} value={clave}>
                                {nombre}
                            </option>
                        ))}
                    </select>
                    <input
                        type="text"
                        value={buscar}
                        onChange={(e) => setBuscar(e.target.value)}
                        placeholder="Empleado..."
                        className="w-44 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    />
                    <button
                        type="submit"
                        className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-800"
                    >
                        Filtrar
                    </button>
                </form>

                {puedeRecalcular && (
                    <button
                        onClick={recalcular}
                        disabled={recalculando}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                        {recalculando ? 'Recalculando...' : '⟳ Recalcular este rango'}
                    </button>
                )}
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                            <th className="px-4 py-3">Fecha</th>
                            <th className="px-4 py-3">Empleado</th>
                            <th className="px-4 py-3">Turno</th>
                            <th className="px-4 py-3">Estado</th>
                            <th className="px-4 py-3">Entrada</th>
                            <th className="px-4 py-3">Salida</th>
                            <th className="px-4 py-3">Tardanza</th>
                            <th className="px-4 py-3">Horas</th>
                            <th className="px-4 py-3">Extra</th>
                        </tr>
                    </thead>
                    <tbody>
                        {asistencias.data.map((asistencia) => (
                            <tr
                                key={asistencia.id}
                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                            >
                                <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                                    {soloFecha(asistencia.fecha)}
                                    {/* Candado = día congelado por cierre de período */}
                                    {asistencia.cerrado && <span title="Período cerrado"> 🔒</span>}
                                </td>
                                <td className="px-4 py-3 font-medium text-slate-800">
                                    {asistencia.empleado.apellidos}, {asistencia.empleado.nombres}
                                </td>
                                <td className="px-4 py-3 text-slate-500">
                                    {asistencia.turno?.nombre ?? '—'}
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={
                                            'rounded-full px-2.5 py-0.5 text-xs font-medium ' +
                                            (COLORES_ESTADO[asistencia.estado] ?? '')
                                        }
                                        title={asistencia.observacion ?? ''}
                                    >
                                        {estados[asistencia.estado] ?? asistencia.estado}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-mono text-slate-600">
                                    {soloHora(asistencia.primera_marcacion)}
                                </td>
                                <td className="px-4 py-3 font-mono text-slate-600">
                                    {soloHora(asistencia.ultima_marcacion)}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                    {asistencia.minutos_tardanza > 0
                                        ? `${asistencia.minutos_tardanza} min`
                                        : '—'}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                    {Number(asistencia.horas_trabajadas) > 0
                                        ? Number(asistencia.horas_trabajadas).toFixed(2)
                                        : '—'}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                    {Number(asistencia.horas_extra) > 0 ? (
                                        <span className="font-medium text-blue-600">
                                            +{Number(asistencia.horas_extra).toFixed(2)}
                                        </span>
                                    ) : (
                                        '—'
                                    )}
                                </td>
                            </tr>
                        ))}

                        {asistencias.data.length === 0 && (
                            <tr>
                                <td colSpan="9" className="px-4 py-8 text-center text-slate-400">
                                    Sin datos en este rango. Presiona "Recalcular este rango"
                                    para que el motor procese las marcaciones.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Paginacion links={asistencias.links} />
        </PanelLayout>
    );
}
