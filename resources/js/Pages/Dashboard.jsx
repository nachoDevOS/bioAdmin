// ============================================================
// PANEL PRINCIPAL (Dashboard).
// Tarjetas con contadores + últimas marcaciones recolectadas.
// Cuando exista el motor de asistencia (Fase 5) se sumarán:
// presentes del día, tardanzas y ausencias.
// ============================================================

import { Head, Link } from '@inertiajs/react';
import PanelLayout from '../Layouts/PanelLayout';

export default function Dashboard({ resumen, ultimasMarcaciones, asistenciaHoy, equiposCaidos }) {
    // ---------- DATOS ----------
    // Estados del día que produce el motor de asistencia
    const estadosHoy = [
        { clave: 'puntual', texto: 'Puntuales', color: 'text-green-600' },
        { clave: 'tardanza', texto: 'Tardanzas', color: 'text-amber-600' },
        { clave: 'falta', texto: 'Faltas', color: 'text-red-600' },
        { clave: 'incompleta', texto: 'Sin salida', color: 'text-orange-600' },
    ];

    const tarjetas = [
        { texto: 'Marcaciones hoy', valor: resumen.marcacionesHoy, color: 'text-blue-600' },
        { texto: 'Empleados activos', valor: resumen.empleados, color: 'text-indigo-600' },
        {
            texto: 'Dispositivos',
            valor: `${resumen.dispositivosActivos} / ${resumen.dispositivos}`,
            detalle: 'activos / registrados',
            color: 'text-emerald-600',
        },
        { texto: 'Departamentos', valor: resumen.departamentos, color: 'text-violet-600' },
    ];

    // ---------- JSX ----------
    return (
        <PanelLayout titulo="Panel del día">
            <Head title="Panel" />

            {/* ALERTA: equipos que no responden al puente */}
            {equiposCaidos.length > 0 && (
                <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-5 py-4">
                    <div className="text-sm font-semibold text-red-800">
                        ⚠ {equiposCaidos.length} equipo(s) sin conexión
                    </div>
                    <ul className="mt-1 text-sm text-red-700">
                        {equiposCaidos.map((equipo) => (
                            <li key={equipo.id}>
                                {equipo.nombre} ({equipo.ip}) — última conexión: {equipo.ultima}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {tarjetas.map((tarjeta) => (
                    <div
                        key={tarjeta.texto}
                        className="bg-white rounded-xl border border-slate-200 p-5"
                    >
                        <div className="text-sm text-slate-500">{tarjeta.texto}</div>
                        <div className={`mt-1 text-3xl font-bold ${tarjeta.color}`}>
                            {tarjeta.valor}
                        </div>
                        {tarjeta.detalle && (
                            <div className="text-xs text-slate-400">{tarjeta.detalle}</div>
                        )}
                    </div>
                ))}
            </div>

            {/* Estados de asistencia de HOY (motor) */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {estadosHoy.map((estado) => (
                    <div
                        key={estado.clave}
                        className="bg-white rounded-xl border border-slate-200 p-4 text-center"
                    >
                        <div className={`text-2xl font-bold ${estado.color}`}>
                            {asistenciaHoy[estado.clave] ?? 0}
                        </div>
                        <div className="text-xs text-slate-500">{estado.texto} hoy</div>
                    </div>
                ))}
            </div>

            {/* Últimas marcaciones */}
            <div className="mt-6 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-800">Últimas marcaciones</h2>
                    <Link href="/marcaciones" className="text-sm text-blue-600 hover:underline">
                        Ver todas →
                    </Link>
                </div>

                {ultimasMarcaciones.length === 0 ? (
                    <p className="px-6 py-8 text-sm text-slate-400 text-center">
                        Sin marcaciones todavía. Con el puente corriendo, cada huella
                        marcada en un equipo aparecerá aquí sola (máximo 5 minutos).
                    </p>
                ) : (
                    <table className="min-w-full text-sm">
                        <tbody>
                            {ultimasMarcaciones.map((marcacion) => (
                                <tr
                                    key={marcacion.id}
                                    className="border-b border-slate-50 last:border-0"
                                >
                                    <td className="px-6 py-2.5 whitespace-nowrap font-mono text-slate-500">
                                        {marcacion.hora}
                                    </td>
                                    <td className="px-6 py-2.5 font-medium text-slate-800">
                                        {marcacion.empleado ?? (
                                            <span className="text-amber-600">
                                                Código {marcacion.codigo} (sin registrar)
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-2.5 text-slate-500">
                                        {marcacion.dispositivo}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </PanelLayout>
    );
}
