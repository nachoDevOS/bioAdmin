// ============================================================
// ASIGNACIONES — EDITAR una asignación existente.
// El empleado no se cambia (para eso: quitar y crear de nuevo);
// se ajustan turno y vigencia.
// ============================================================

import { Head, Link, useForm } from '@inertiajs/react';
import PanelLayout from '../../Layouts/PanelLayout';

export default function Editar({ asignacion, turnos }) {
    // ---------- DATOS ----------
    const { data, setData, put, processing, errors } = useForm({
        turno_id: asignacion.turno_id,
        desde: asignacion.desde?.substring(0, 10) ?? '',
        hasta: asignacion.hasta?.substring(0, 10) ?? '',
    });

    // ---------- FUNCIONES ----------
    function guardar(e) {
        e.preventDefault();
        put(`/asignaciones/${asignacion.id}`);
    }

    // ---------- JSX ----------
    return (
        <PanelLayout titulo="Editar asignación">
            <Head title="Asignaciones" />

            <form
                onSubmit={guardar}
                className="max-w-xl bg-white rounded-xl border border-slate-200 p-6 space-y-5"
            >
                {/* Empleado fijo, solo informativo */}
                <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm">
                    <span className="text-slate-500">Empleado:</span>{' '}
                    <span className="font-medium text-slate-800">
                        {asignacion.empleado.apellidos}, {asignacion.empleado.nombres}
                    </span>
                    <span className="ml-2 font-mono text-xs text-slate-400">
                        #{asignacion.empleado.codigo_biometrico}
                    </span>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Turno *
                    </label>
                    <select
                        value={data.turno_id}
                        onChange={(e) => setData('turno_id', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    >
                        {turnos.map((turno) => (
                            <option key={turno.id} value={turno.id}>
                                {turno.nombre}
                            </option>
                        ))}
                    </select>
                    {errors.turno_id && (
                        <p className="mt-1 text-sm text-red-600">{errors.turno_id}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Desde *
                        </label>
                        <input
                            type="date"
                            value={data.desde}
                            onChange={(e) => setData('desde', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        />
                        {errors.desde && (
                            <p className="mt-1 text-sm text-red-600">{errors.desde}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Hasta
                        </label>
                        <input
                            type="date"
                            value={data.hasta}
                            onChange={(e) => setData('hasta', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        />
                        <p className="mt-1 text-xs text-slate-400">Vacío = indefinido.</p>
                        {errors.hasta && (
                            <p className="mt-1 text-sm text-red-600">{errors.hasta}</p>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {processing ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                    <Link
                        href="/asignaciones"
                        className="rounded-lg border border-slate-300 px-5 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        Cancelar
                    </Link>
                </div>
            </form>
        </PanelLayout>
    );
}
