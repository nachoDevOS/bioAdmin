// ============================================================
// ASIGNACIONES — FORMULARIO MASIVO.
// Eliges UN turno, marcas VARIOS empleados y defines la vigencia.
// Para un turno ROTATIVO: asigna el turno A con vigencia julio,
// luego el turno B con vigencia agosto, y así sucesivamente.
// ============================================================

import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import PanelLayout from '../../Layouts/PanelLayout';

export default function Formulario({ turnos, empleados }) {
    // ---------- DATOS ----------
    const { data, setData, post, processing, errors } = useForm({
        turno_id: '',
        empleado_ids: [],
        desde: new Date().toISOString().substring(0, 10), // hoy "AAAA-MM-DD"
        hasta: '',
    });

    // Filtro local del listado de empleados (solo visual, no viaja al servidor)
    const [filtro, setFiltro] = useState('');

    const empleadosVisibles = empleados.filter((empleado) =>
        `${empleado.nombres} ${empleado.apellidos} ${empleado.codigo_biometrico}`
            .toLowerCase()
            .includes(filtro.toLowerCase()),
    );

    // ---------- FUNCIONES ----------
    function alternarEmpleado(id) {
        if (data.empleado_ids.includes(id)) {
            setData('empleado_ids', data.empleado_ids.filter((e) => e !== id));
        } else {
            setData('empleado_ids', [...data.empleado_ids, id]);
        }
    }

    function marcarTodosVisibles() {
        setData('empleado_ids', empleadosVisibles.map((e) => e.id));
    }

    function desmarcarTodos() {
        setData('empleado_ids', []);
    }

    function guardar(e) {
        e.preventDefault();
        post('/asignaciones');
    }

    // ---------- JSX ----------
    return (
        <PanelLayout titulo="Asignar turno a empleados">
            <Head title="Asignaciones" />

            <form
                onSubmit={guardar}
                className="max-w-2xl bg-white rounded-xl border border-slate-200 p-6 space-y-5"
            >
                {/* ----- Turno y vigencia ----- */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Turno *
                        </label>
                        <select
                            value={data.turno_id}
                            onChange={(e) => setData('turno_id', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        >
                            <option value="">— Elegir —</option>
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

                {/* ----- Selección masiva de empleados ----- */}
                <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="text-sm font-medium text-slate-700">
                            Empleados * ({data.empleado_ids.length} marcados)
                        </div>
                        <div className="flex gap-2 text-xs">
                            <button
                                type="button"
                                onClick={marcarTodosVisibles}
                                className="text-blue-600 hover:underline"
                            >
                                Marcar visibles
                            </button>
                            <button
                                type="button"
                                onClick={desmarcarTodos}
                                className="text-slate-500 hover:underline"
                            >
                                Desmarcar todos
                            </button>
                        </div>
                    </div>

                    <input
                        type="text"
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                        placeholder="Filtrar por nombre o código..."
                        className="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    />

                    <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100">
                        {empleadosVisibles.map((empleado) => (
                            <label
                                key={empleado.id}
                                className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={data.empleado_ids.includes(empleado.id)}
                                    onChange={() => alternarEmpleado(empleado.id)}
                                    className="rounded border-slate-300"
                                />
                                <span className="text-slate-800">
                                    {empleado.apellidos}, {empleado.nombres}
                                </span>
                                <span className="font-mono text-xs text-slate-400">
                                    #{empleado.codigo_biometrico}
                                </span>
                            </label>
                        ))}

                        {empleadosVisibles.length === 0 && (
                            <p className="px-3 py-4 text-center text-sm text-slate-400">
                                Ningún empleado coincide con el filtro.
                            </p>
                        )}
                    </div>
                    {errors.empleado_ids && (
                        <p className="mt-1 text-sm text-red-600">{errors.empleado_ids}</p>
                    )}
                </div>

                {/* ----- Botones ----- */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={processing || data.empleado_ids.length === 0}
                        className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {processing
                            ? 'Asignando...'
                            : `Asignar a ${data.empleado_ids.length} empleado(s)`}
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
