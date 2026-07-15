// ============================================================
// PORTAL DEL EMPLEADO — solo lectura, solo SUS datos:
// asistencia del mes, permisos y últimas marcaciones.
// ============================================================

import { Head } from '@inertiajs/react';
import PanelLayout from '../../Layouts/PanelLayout';

const COLORES_ESTADO = {
    puntual: 'bg-green-100 text-green-700',
    tardanza: 'bg-amber-100 text-amber-700',
    falta: 'bg-red-100 text-red-700',
    incompleta: 'bg-orange-100 text-orange-700',
    permiso: 'bg-sky-100 text-sky-700',
    descanso: 'bg-slate-100 text-slate-500',
    sin_turno: 'bg-violet-100 text-violet-600',
};

export default function Index({ datos }) {
    // ---------- Usuario sin empleado vinculado ----------
    if (!datos) {
        return (
            <PanelLayout titulo="Mi portal">
                <Head title="Mi portal" />
                <div className="max-w-xl rounded-xl bg-amber-50 border border-amber-200 px-5 py-4 text-sm text-amber-800">
                    Tu usuario no está vinculado a ningún empleado. Pide al
                    administrador que edite tu usuario y seleccione tu ficha de
                    empleado en el campo "Empleado vinculado".
                </div>
            </PanelLayout>
        );
    }

    // ---------- JSX ----------
    return (
        <PanelLayout titulo={`Mi portal — ${datos.empleado.nombre}`}>
            <Head title="Mi portal" />

            <div className="space-y-6">
                {/* ----- Mi asistencia del mes ----- */}
                <div className="bg-white rounded-xl border border-slate-200">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="font-semibold text-slate-800">
                            Mi asistencia de {datos.mes}
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-500">
                                    <th className="px-6 py-2">Fecha</th>
                                    <th className="px-6 py-2">Estado</th>
                                    <th className="px-6 py-2">Entrada</th>
                                    <th className="px-6 py-2">Salida</th>
                                    <th className="px-6 py-2">Horas</th>
                                    <th className="px-6 py-2">Extra</th>
                                </tr>
                            </thead>
                            <tbody>
                                {datos.asistencias.map((dia) => (
                                    <tr key={dia.id} className="border-b border-slate-50 last:border-0">
                                        <td className="px-6 py-2 text-slate-600">{dia.fecha}</td>
                                        <td className="px-6 py-2">
                                            <span
                                                className={
                                                    'rounded-full px-2.5 py-0.5 text-xs font-medium ' +
                                                    (COLORES_ESTADO[dia.estado] ?? '')
                                                }
                                            >
                                                {datos.estados[dia.estado] ?? dia.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-2 font-mono text-slate-600">
                                            {dia.entrada ?? '—'}
                                        </td>
                                        <td className="px-6 py-2 font-mono text-slate-600">
                                            {dia.salida ?? '—'}
                                        </td>
                                        <td className="px-6 py-2 text-slate-600">
                                            {dia.horas > 0 ? dia.horas.toFixed(2) : '—'}
                                        </td>
                                        <td className="px-6 py-2 text-slate-600">
                                            {dia.extra > 0 ? `+${dia.extra.toFixed(2)}` : '—'}
                                        </td>
                                    </tr>
                                ))}
                                {datos.asistencias.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-6 text-center text-slate-400">
                                            Aún no hay asistencia calculada este mes.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* ----- Mis permisos ----- */}
                    <div className="bg-white rounded-xl border border-slate-200">
                        <div className="px-6 py-4 border-b border-slate-100">
                            <h2 className="font-semibold text-slate-800">Mis permisos</h2>
                        </div>
                        <div className="p-4 space-y-2">
                            {datos.permisos.map((permiso) => (
                                <div
                                    key={permiso.id}
                                    className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
                                >
                                    <span
                                        className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                                        style={{ backgroundColor: permiso.color }}
                                    >
                                        {permiso.tipo}
                                    </span>
                                    <span className="text-slate-600">
                                        {permiso.desde} – {permiso.hasta}
                                    </span>
                                </div>
                            ))}
                            {datos.permisos.length === 0 && (
                                <p className="py-4 text-center text-sm text-slate-400">
                                    Sin permisos registrados.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ----- Mis últimas marcaciones ----- */}
                    <div className="bg-white rounded-xl border border-slate-200">
                        <div className="px-6 py-4 border-b border-slate-100">
                            <h2 className="font-semibold text-slate-800">Mis últimas marcaciones</h2>
                        </div>
                        <div className="p-4 space-y-1">
                            {datos.marcaciones.map((marcacion) => (
                                <div
                                    key={marcacion.id}
                                    className="flex justify-between px-3 py-1.5 text-sm"
                                >
                                    <span className="font-mono text-slate-600">{marcacion.hora}</span>
                                    <span className="text-slate-400">{marcacion.dispositivo}</span>
                                </div>
                            ))}
                            {datos.marcaciones.length === 0 && (
                                <p className="py-4 text-center text-sm text-slate-400">
                                    Sin marcaciones registradas.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PanelLayout>
    );
}
