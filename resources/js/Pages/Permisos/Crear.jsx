// ============================================================
// PERMISOS — ASISTENTE DE 3 PASOS.
//
// CONCEPTO REACT #8 — ASISTENTE (WIZARD):
// Un asistente es UN solo formulario cuyo estado se llena por
// partes. Un useState "paso" (1, 2 o 3) decide qué sección se
// dibuja; los datos viven todos en el mismo useForm y solo se
// envían al final. Ir atrás no pierde nada: el estado sigue ahí.
// ============================================================

import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import PanelLayout from '../../Layouts/PanelLayout';

export default function Crear({ tipos, empleados }) {
    // ---------- DATOS ----------
    const [paso, setPaso] = useState(1); // en qué paso del asistente estamos
    const [filtro, setFiltro] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        tipo_permiso_id: '',
        desde: '',
        hasta: '',
        motivo: '',
        empleado_ids: [],
    });

    const tipoElegido = tipos.find((t) => String(t.id) === String(data.tipo_permiso_id));

    const empleadosVisibles = empleados.filter((e) =>
        `${e.nombres} ${e.apellidos} ${e.codigo_biometrico}`
            .toLowerCase()
            .includes(filtro.toLowerCase()),
    );

    // ---------- FUNCIONES ----------
    // ¿Se puede avanzar desde el paso actual?
    function pasoCompleto() {
        if (paso === 1) return data.tipo_permiso_id && data.desde && data.hasta;
        if (paso === 2) return data.empleado_ids.length > 0;
        return true;
    }

    function alternarEmpleado(id) {
        if (data.empleado_ids.includes(id)) {
            setData('empleado_ids', data.empleado_ids.filter((e) => e !== id));
        } else {
            setData('empleado_ids', [...data.empleado_ids, id]);
        }
    }

    function guardar(e) {
        e.preventDefault();
        post('/permisos');
    }

    // ---------- JSX ----------
    return (
        <PanelLayout titulo="Otorgar permiso">
            <Head title="Permisos" />

            <form onSubmit={guardar} className="max-w-2xl space-y-4">
                {/* ----- Indicador de pasos ----- */}
                <div className="flex items-center gap-2">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="flex items-center gap-2">
                            <div
                                className={
                                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ' +
                                    (paso >= n
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-200 text-slate-500')
                                }
                            >
                                {n}
                            </div>
                            <span className={paso >= n ? 'text-sm text-slate-800' : 'text-sm text-slate-400'}>
                                {n === 1 ? 'Tipo y fechas' : n === 2 ? 'Empleados' : 'Confirmar'}
                            </span>
                            {n < 3 && <div className="h-px w-8 bg-slate-300" />}
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    {/* ============ PASO 1: tipo, fechas, motivo ============ */}
                    {paso === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Tipo de permiso *
                                </label>
                                <select
                                    value={data.tipo_permiso_id}
                                    onChange={(e) => setData('tipo_permiso_id', e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                                >
                                    <option value="">— Elegir —</option>
                                    {tipos.map((tipo) => (
                                        <option key={tipo.id} value={tipo.id}>
                                            {tipo.nombre}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-slate-400">
                                    ¿Falta un tipo? Créalo en{' '}
                                    <Link href="/tipos-permiso" className="text-blue-600 hover:underline">
                                        Tipos de permiso
                                    </Link>.
                                </p>
                                {errors.tipo_permiso_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.tipo_permiso_id}</p>
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
                                        Hasta *
                                    </label>
                                    <input
                                        type="date"
                                        value={data.hasta}
                                        onChange={(e) => setData('hasta', e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                                    />
                                    {errors.hasta && (
                                        <p className="mt-1 text-sm text-red-600">{errors.hasta}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Motivo
                                </label>
                                <input
                                    type="text"
                                    value={data.motivo}
                                    onChange={(e) => setData('motivo', e.target.value)}
                                    placeholder="Ej. Vacaciones programadas de julio"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* ============ PASO 2: empleados ============ */}
                    {paso === 2 && (
                        <div>
                            <div className="text-sm font-medium text-slate-700 mb-2">
                                ¿A quiénes? ({data.empleado_ids.length} marcados) *
                            </div>
                            <input
                                type="text"
                                value={filtro}
                                onChange={(e) => setFiltro(e.target.value)}
                                placeholder="Filtrar empleados..."
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
                            </div>
                            {errors.empleado_ids && (
                                <p className="mt-1 text-sm text-red-600">{errors.empleado_ids}</p>
                            )}
                        </div>
                    )}

                    {/* ============ PASO 3: confirmación ============ */}
                    {paso === 3 && (
                        <div className="space-y-3 text-sm">
                            <h2 className="font-semibold text-slate-800">Revisa antes de otorgar:</h2>
                            <div className="rounded-lg bg-slate-50 p-4 space-y-2">
                                <p>
                                    <span className="text-slate-500">Tipo:</span>{' '}
                                    <span
                                        className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                                        style={{ backgroundColor: tipoElegido?.color }}
                                    >
                                        {tipoElegido?.nombre}
                                    </span>
                                </p>
                                <p>
                                    <span className="text-slate-500">Fechas:</span>{' '}
                                    <strong>{data.desde}</strong> al <strong>{data.hasta}</strong>
                                </p>
                                {data.motivo && (
                                    <p>
                                        <span className="text-slate-500">Motivo:</span> {data.motivo}
                                    </p>
                                )}
                                <p>
                                    <span className="text-slate-500">Empleados ({data.empleado_ids.length}):</span>{' '}
                                    {empleados
                                        .filter((e) => data.empleado_ids.includes(e.id))
                                        .map((e) => `${e.apellidos}, ${e.nombres}`)
                                        .join(' · ')}
                                </p>
                            </div>
                            <p className="text-xs text-slate-400">
                                Se creará como UN lote: si te equivocas, lo anulas completo
                                desde la lista de permisos.
                            </p>
                        </div>
                    )}

                    {/* ----- Navegación del asistente ----- */}
                    <div className="mt-6 flex justify-between">
                        <div>
                            {paso > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setPaso(paso - 1)}
                                    className="rounded-lg border border-slate-300 px-5 py-2 text-sm text-slate-600 hover:bg-slate-50"
                                >
                                    ← Atrás
                                </button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <Link
                                href="/permisos"
                                className="rounded-lg border border-slate-300 px-5 py-2 text-sm text-slate-600 hover:bg-slate-50"
                            >
                                Cancelar
                            </Link>
                            {paso < 3 ? (
                                <button
                                    type="button"
                                    onClick={() => setPaso(paso + 1)}
                                    disabled={!pasoCompleto()}
                                    className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    Siguiente →
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    {processing ? 'Otorgando...' : '✓ Otorgar permiso'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </PanelLayout>
    );
}
