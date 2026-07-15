// ============================================================
// AUDITORÍA — solo lectura. Muestra quién hizo qué y cuándo.
// Los registros los genera automáticamente el trait LogsActivity
// de los modelos; aquí nadie puede crearlos ni borrarlos.
// ============================================================

import { Head } from '@inertiajs/react';
import Paginacion from '../../Components/Paginacion';
import PanelLayout from '../../Layouts/PanelLayout';

export default function Index({ registros }) {
    // ---------- FUNCIONES ----------
    // Convierte el objeto de cambios {attributes: {...}, old: {...}}
    // en texto legible "campo: antes → después".
    function describirCambios(cambios) {
        if (!cambios || !cambios.attributes) return null;

        const nuevos = cambios.attributes;
        const viejos = cambios.old ?? {};

        return Object.keys(nuevos).map((campo) => {
            const antes = viejos[campo];
            const despues = nuevos[campo];
            return (
                <div key={campo} className="text-xs text-slate-500">
                    <span className="font-mono">{campo}</span>:{' '}
                    {antes !== undefined && (
                        <>
                            <span className="line-through">{String(antes ?? '—')}</span>{' → '}
                        </>
                    )}
                    <span className="text-slate-700">{String(despues ?? '—')}</span>
                </div>
            );
        });
    }

    // ---------- JSX ----------
    return (
        <PanelLayout titulo="Bitácora de auditoría">
            <Head title="Auditoría" />

            <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                            <th className="px-4 py-3">Fecha y hora</th>
                            <th className="px-4 py-3">Usuario</th>
                            <th className="px-4 py-3">Módulo</th>
                            <th className="px-4 py-3">Evento</th>
                            <th className="px-4 py-3">Detalle del cambio</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registros.data.map((registro) => (
                            <tr
                                key={registro.id}
                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50 align-top"
                            >
                                <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                                    {registro.fecha}
                                </td>
                                <td className="px-4 py-3 font-medium text-slate-800">
                                    {registro.usuario}
                                </td>
                                <td className="px-4 py-3">
                                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                                        {registro.modulo}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-600">{registro.evento}</td>
                                <td className="px-4 py-3">{describirCambios(registro.cambios)}</td>
                            </tr>
                        ))}

                        {registros.data.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                                    Aún no hay actividad registrada.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Paginacion links={registros.links} />
        </PanelLayout>
    );
}
