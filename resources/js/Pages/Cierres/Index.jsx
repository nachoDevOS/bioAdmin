// ============================================================
// CIERRE DE PERÍODO.
// Cerrar congela las asistencias de un rango (ya se pagó con esos
// números). Reabrir es posible pero queda en auditoría.
// ============================================================

import { Head, router, useForm } from '@inertiajs/react';
import PanelLayout from '../../Layouts/PanelLayout';

export default function Index({ cierres }) {
    // ---------- DATOS ----------
    const { data, setData, post, processing, errors } = useForm({
        desde: '',
        hasta: '',
    });

    // ---------- FUNCIONES ----------
    function cerrar(e) {
        e.preventDefault();
        if (
            confirm(
                `Se cerrará el período del ${data.desde} al ${data.hasta}.\n` +
                    'Sus asistencias quedarán CONGELADAS (el recálculo no las tocará). ' +
                    '¿Continuar?',
            )
        ) {
            post('/cierres');
        }
    }

    function reabrir(cierre) {
        if (
            confirm(
                `¿Reabrir el período ${cierre.desde} – ${cierre.hasta}?\n` +
                    'Sus asistencias podrán recalcularse de nuevo y la reapertura ' +
                    'quedará registrada en auditoría.',
            )
        ) {
            router.delete(`/cierres/${cierre.id}`);
        }
    }

    // ---------- JSX ----------
    return (
        <PanelLayout titulo="Cierre de período">
            <Head title="Cierres" />

            <div className="max-w-3xl space-y-6">
                {/* ----- Formulario de cierre ----- */}
                <form
                    onSubmit={cerrar}
                    className="bg-white rounded-xl border border-slate-200 p-6"
                >
                    <h2 className="font-semibold text-slate-800">Cerrar un período</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Hazlo cuando la quincena o el mes ya esté revisado y pagado:
                        los números quedan congelados para siempre (salvo reapertura).
                    </p>

                    <div className="mt-4 flex flex-wrap items-end gap-3">
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Desde *</label>
                            <input
                                type="date"
                                value={data.desde}
                                onChange={(e) => setData('desde', e.target.value)}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Hasta *</label>
                            <input
                                type="date"
                                value={data.hasta}
                                onChange={(e) => setData('hasta', e.target.value)}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={processing || !data.desde || !data.hasta}
                            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? 'Cerrando...' : '🔒 Cerrar período'}
                        </button>
                    </div>
                    {(errors.desde || errors.hasta) && (
                        <p className="mt-2 text-sm text-red-600">
                            {errors.desde ?? errors.hasta}
                        </p>
                    )}
                </form>

                {/* ----- Historial de cierres ----- */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                                <th className="px-4 py-3">Período</th>
                                <th className="px-4 py-3">Cerrado por</th>
                                <th className="px-4 py-3">Fecha del cierre</th>
                                <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cierres.map((cierre) => (
                                <tr
                                    key={cierre.id}
                                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                >
                                    <td className="px-4 py-3 font-medium text-slate-800">
                                        🔒 {cierre.desde} – {cierre.hasta}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{cierre.usuario}</td>
                                    <td className="px-4 py-3 text-slate-500">
                                        {cierre.fecha_cierre}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => reabrir(cierre)}
                                            className="text-red-600 hover:underline"
                                        >
                                            Reabrir
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {cierres.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-4 py-8 text-center text-slate-400">
                                        Ningún período cerrado todavía.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </PanelLayout>
    );
}
