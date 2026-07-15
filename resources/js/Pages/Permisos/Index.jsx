// ============================================================
// PERMISOS — LISTA DE LOTES.
// Cada fila es un lote (individual o grupal). Anular el lote
// desactiva el permiso de todos sus empleados a la vez.
// ============================================================

import { Head, Link, router } from '@inertiajs/react';
import Paginacion from '../../Components/Paginacion';
import PanelLayout from '../../Layouts/PanelLayout';

export default function Index({ lotes }) {
    // ---------- FUNCIONES ----------
    function anular(lote) {
        if (
            confirm(
                `¿Anular este lote de "${lote.tipo.nombre}" (${lote.permisos_count} empleado(s))?\n` +
                    'El permiso dejará de aplicar para TODOS ellos.',
            )
        ) {
            router.post(`/permisos/lotes/${lote.id}/anular`, {}, { preserveScroll: true });
        }
    }

    function fecha(texto) {
        const [anio, mes, dia] = texto.substring(0, 10).split('-');
        return `${dia}/${mes}/${anio}`;
    }

    // ---------- JSX ----------
    return (
        <PanelLayout titulo="Permisos">
            <Head title="Permisos" />

            <div className="flex flex-wrap justify-end gap-2 mb-4">
                <Link
                    href="/tipos-permiso"
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                    Tipos de permiso
                </Link>
                <Link
                    href="/permisos/crear"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    + Otorgar permiso
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                            <th className="px-4 py-3">Tipo</th>
                            <th className="px-4 py-3">Fechas</th>
                            <th className="px-4 py-3">Empleados</th>
                            <th className="px-4 py-3">Motivo</th>
                            <th className="px-4 py-3">Otorgado por</th>
                            <th className="px-4 py-3">Estado</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lotes.data.map((lote) => (
                            <tr
                                key={lote.id}
                                className={
                                    'border-b border-slate-100 last:border-0 hover:bg-slate-50 ' +
                                    (lote.anulado_en ? 'opacity-50' : '')
                                }
                            >
                                <td className="px-4 py-3">
                                    <span
                                        className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                                        style={{ backgroundColor: lote.tipo.color }}
                                    >
                                        {lote.tipo.nombre}
                                    </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                                    {fecha(lote.desde)} – {fecha(lote.hasta)}
                                </td>
                                <td className="px-4 py-3 text-slate-600">{lote.permisos_count}</td>
                                <td className="px-4 py-3 text-slate-600">{lote.motivo || '—'}</td>
                                <td className="px-4 py-3 text-slate-500">{lote.creador.name}</td>
                                <td className="px-4 py-3">
                                    {lote.anulado_en ? (
                                        <span
                                            className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs text-red-700"
                                            title={`Anulado por ${lote.anulado_por?.name ?? '—'}`}
                                        >
                                            Anulado
                                        </span>
                                    ) : (
                                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs text-green-700">
                                            Vigente
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                    {!lote.anulado_en && (
                                        <button
                                            onClick={() => anular(lote)}
                                            className="text-red-600 hover:underline"
                                        >
                                            Anular lote
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}

                        {lotes.data.length === 0 && (
                            <tr>
                                <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                                    No hay permisos otorgados todavía.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Paginacion links={lotes.links} />
        </PanelLayout>
    );
}
