// ============================================================
// TURNOS — LISTA. Sin paginación (los turnos son pocos).
// ============================================================

import { Head, Link, router } from '@inertiajs/react';
import PanelLayout from '../../Layouts/PanelLayout';

// Nombres cortos de los días, en orden ISO (1=lunes ... 7=domingo)
const DIAS = { 1: 'Lu', 2: 'Ma', 3: 'Mi', 4: 'Ju', 5: 'Vi', 6: 'Sá', 7: 'Do' };

const NOMBRES_TIPO = { fijo: 'Fijo', partido: 'Partido', nocturno: 'Nocturno' };

export default function Index({ turnos }) {
    // ---------- FUNCIONES ----------
    function eliminar(turno) {
        if (confirm(`¿Eliminar el turno "${turno.nombre}"?`)) {
            router.delete(`/turnos/${turno.id}`);
        }
    }

    // "08:00:00" → "08:00" (la BD guarda con segundos)
    function hora(texto) {
        return texto ? texto.substring(0, 5) : '';
    }

    // ---------- JSX ----------
    return (
        <PanelLayout titulo="Turnos">
            <Head title="Turnos" />

            <div className="flex justify-end mb-4">
                <Link
                    href="/turnos/crear"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    + Nuevo turno
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                            <th className="px-4 py-3">Nombre</th>
                            <th className="px-4 py-3">Tipo</th>
                            <th className="px-4 py-3">Horario</th>
                            <th className="px-4 py-3">Días</th>
                            <th className="px-4 py-3">Tolerancia</th>
                            <th className="px-4 py-3">Asignados</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {turnos.map((turno) => (
                            <tr
                                key={turno.id}
                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                            >
                                <td className="px-4 py-3 font-medium text-slate-800">
                                    {turno.nombre}
                                    {!turno.activo && (
                                        <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                                            inactivo
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                    {NOMBRES_TIPO[turno.tipo]}
                                </td>
                                <td className="px-4 py-3 font-mono text-slate-600">
                                    {hora(turno.hora_entrada)}–{hora(turno.hora_salida)}
                                    {turno.tipo === 'partido' && (
                                        <> y {hora(turno.hora_entrada_2)}–{hora(turno.hora_salida_2)}</>
                                    )}
                                    {turno.cruza_medianoche && (
                                        <span className="ml-1 text-xs text-violet-600">(+1 día)</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                    {(turno.dias_laborables ?? []).map((d) => DIAS[d]).join(' ')}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                    {turno.tolerancia_entrada_minutos} min
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                    {turno.asignaciones_count}
                                </td>
                                <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                                    <Link
                                        href={`/turnos/${turno.id}/editar`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        Editar
                                    </Link>
                                    <button
                                        onClick={() => eliminar(turno)}
                                        className="text-red-600 hover:underline"
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {turnos.length === 0 && (
                            <tr>
                                <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                                    No hay turnos. Crea el primero.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </PanelLayout>
    );
}
