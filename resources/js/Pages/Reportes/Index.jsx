// ============================================================
// REPORTES — genera Excel o PDF de asistencia.
// La descarga NO usa Inertia: se construye una URL con los filtros
// y el navegador la abre — Laravel responde con el archivo.
// ============================================================

import { Head } from '@inertiajs/react';
import { useState } from 'react';
import PanelLayout from '../../Layouts/PanelLayout';

export default function Index({ empleados }) {
    // ---------- DATOS ----------
    // Formulario simple con useState (no useForm: no hay POST,
    // la descarga es un GET que abre el navegador).
    const hoy = new Date().toISOString().substring(0, 10);
    const inicioMes = hoy.substring(0, 8) + '01';

    const [tipo, setTipo] = useState('resumen');
    const [formato, setFormato] = useState('excel');
    const [desde, setDesde] = useState(inicioMes);
    const [hasta, setHasta] = useState(hoy);
    const [empleadoId, setEmpleadoId] = useState('');

    // ---------- FUNCIONES ----------
    function descargar(e) {
        e.preventDefault();

        // Construir la URL con los filtros como parámetros
        const parametros = new URLSearchParams({
            tipo,
            formato,
            desde,
            hasta,
        });
        if (empleadoId) parametros.append('empleado_id', empleadoId);

        // Abrir la URL = el navegador descarga el archivo
        window.location.href = `/reportes/descargar?${parametros.toString()}`;
    }

    // ---------- JSX ----------
    return (
        <PanelLayout titulo="Reportes">
            <Head title="Reportes" />

            <form
                onSubmit={descargar}
                className="max-w-2xl bg-white rounded-xl border border-slate-200 p-6 space-y-5"
            >
                {/* ----- Tipo de reporte ----- */}
                <div>
                    <div className="text-sm font-medium text-slate-700 mb-2">Tipo de reporte</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label
                            className={
                                'cursor-pointer rounded-lg border p-4 text-sm transition ' +
                                (tipo === 'resumen'
                                    ? 'border-blue-600 bg-blue-50'
                                    : 'border-slate-200 hover:bg-slate-50')
                            }
                        >
                            <input
                                type="radio"
                                className="sr-only"
                                checked={tipo === 'resumen'}
                                onChange={() => setTipo('resumen')}
                            />
                            <div className="font-medium text-slate-800">Resumen por empleado</div>
                            <div className="mt-1 text-xs text-slate-500">
                                Una fila por persona: días puntuales, tardanzas, faltas,
                                permisos, horas y extra del período. Ideal para planilla.
                            </div>
                        </label>
                        <label
                            className={
                                'cursor-pointer rounded-lg border p-4 text-sm transition ' +
                                (tipo === 'detalle'
                                    ? 'border-blue-600 bg-blue-50'
                                    : 'border-slate-200 hover:bg-slate-50')
                            }
                        >
                            <input
                                type="radio"
                                className="sr-only"
                                checked={tipo === 'detalle'}
                                onChange={() => setTipo('detalle')}
                            />
                            <div className="font-medium text-slate-800">Detalle día por día</div>
                            <div className="mt-1 text-xs text-slate-500">
                                Una fila por empleado por día: estado, entrada, salida,
                                tardanza, horas. Para revisar casos puntuales.
                            </div>
                        </label>
                    </div>
                </div>

                {/* ----- Rango y empleado ----- */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Desde *
                        </label>
                        <input
                            type="date"
                            value={desde}
                            onChange={(e) => setDesde(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Hasta *
                        </label>
                        <input
                            type="date"
                            value={hasta}
                            onChange={(e) => setHasta(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Empleado
                        </label>
                        <select
                            value={empleadoId}
                            onChange={(e) => setEmpleadoId(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        >
                            <option value="">Todos</option>
                            {empleados.map((empleado) => (
                                <option key={empleado.id} value={empleado.id}>
                                    {empleado.apellidos}, {empleado.nombres}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ----- Formato y descarga ----- */}
                <div className="flex flex-wrap items-end gap-3">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Formato
                        </label>
                        <select
                            value={formato}
                            onChange={(e) => setFormato(e.target.value)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        >
                            <option value="excel">Excel (.xlsx)</option>
                            <option value="pdf">PDF</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        ⬇ Descargar reporte
                    </button>
                </div>

                <p className="text-xs text-slate-400">
                    El reporte usa los datos calculados por el motor: si cambiaste
                    marcaciones, turnos o permisos, recalcula la asistencia primero.
                </p>
            </form>
        </PanelLayout>
    );
}
