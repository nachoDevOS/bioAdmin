// ============================================================
// EMPLEADOS — FORMULARIO (crear/editar). Patrón estándar.
// Novedad: <select> alimentados con las listas de departamentos
// y cargos que envía el controlador.
// ============================================================

import { Head, Link, useForm } from '@inertiajs/react';
import PanelLayout from '../../Layouts/PanelLayout';

export default function Formulario({ empleado, departamentos, cargos }) {
    // ---------- DATOS ----------
    const editando = empleado !== null;

    const { data, setData, post, put, processing, errors } = useForm({
        codigo_biometrico: empleado?.codigo_biometrico ?? '',
        nombres: empleado?.nombres ?? '',
        apellidos: empleado?.apellidos ?? '',
        documento: empleado?.documento ?? '',
        correo: empleado?.correo ?? '',
        telefono: empleado?.telefono ?? '',
        // Los select trabajan con texto; '' significa "sin asignar"
        departamento_id: empleado?.departamento_id ?? '',
        cargo_id: empleado?.cargo_id ?? '',
        // La fecha llega como "2025-01-15T00:00:00..."; el input date
        // solo acepta "2025-01-15", por eso cortamos los primeros 10.
        fecha_ingreso: empleado?.fecha_ingreso?.substring(0, 10) ?? '',
        activo: empleado?.activo ?? true,
    });

    // ---------- FUNCIONES ----------
    function guardar(e) {
        e.preventDefault();

        // Inertia permite transformar los datos justo antes de enviar:
        // convertimos '' en null para los campos opcionales.
        const opciones = {
            // nada especial por ahora
        };

        if (editando) {
            put(`/empleados/${empleado.id}`, opciones);
        } else {
            post('/empleados', opciones);
        }
    }

    // ---------- JSX ----------
    return (
        <PanelLayout titulo={editando ? 'Editar empleado' : 'Nuevo empleado'}>
            <Head title="Empleados" />

            <form
                onSubmit={guardar}
                className="max-w-3xl bg-white rounded-xl border border-slate-200 p-6 space-y-5"
            >
                {/* ----- Código biométrico ----- */}
                <div className="max-w-xs">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Código biométrico *
                    </label>
                    <input
                        type="text"
                        value={data.codigo_biometrico}
                        onChange={(e) => setData('codigo_biometrico', e.target.value)}
                        placeholder="Ej. 25"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-blue-500 outline-none"
                    />
                    <p className="mt-1 text-xs text-slate-400">
                        El ID con el que el empleado marca en el equipo ZKTeco. Debe coincidir exactamente.
                    </p>
                    {errors.codigo_biometrico && (
                        <p className="mt-1 text-sm text-red-600">{errors.codigo_biometrico}</p>
                    )}
                </div>

                {/* ----- Nombres y apellidos ----- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Nombres *
                        </label>
                        <input
                            type="text"
                            value={data.nombres}
                            onChange={(e) => setData('nombres', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        />
                        {errors.nombres && (
                            <p className="mt-1 text-sm text-red-600">{errors.nombres}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Apellidos *
                        </label>
                        <input
                            type="text"
                            value={data.apellidos}
                            onChange={(e) => setData('apellidos', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        />
                        {errors.apellidos && (
                            <p className="mt-1 text-sm text-red-600">{errors.apellidos}</p>
                        )}
                    </div>
                </div>

                {/* ----- Documento, correo, teléfono ----- */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Documento
                        </label>
                        <input
                            type="text"
                            value={data.documento}
                            onChange={(e) => setData('documento', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        />
                        {errors.documento && (
                            <p className="mt-1 text-sm text-red-600">{errors.documento}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Correo
                        </label>
                        <input
                            type="email"
                            value={data.correo}
                            onChange={(e) => setData('correo', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        />
                        {errors.correo && (
                            <p className="mt-1 text-sm text-red-600">{errors.correo}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Teléfono
                        </label>
                        <input
                            type="text"
                            value={data.telefono}
                            onChange={(e) => setData('telefono', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* ----- Departamento y cargo ----- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Departamento
                        </label>
                        <select
                            value={data.departamento_id}
                            onChange={(e) => setData('departamento_id', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        >
                            <option value="">— Sin departamento —</option>
                            {/* Las opciones salen de la lista que mandó el controlador */}
                            {departamentos.map((departamento) => (
                                <option key={departamento.id} value={departamento.id}>
                                    {departamento.nombre}
                                </option>
                            ))}
                        </select>
                        {errors.departamento_id && (
                            <p className="mt-1 text-sm text-red-600">{errors.departamento_id}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Cargo
                        </label>
                        <select
                            value={data.cargo_id}
                            onChange={(e) => setData('cargo_id', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        >
                            <option value="">— Sin cargo —</option>
                            {cargos.map((cargo) => (
                                <option key={cargo.id} value={cargo.id}>
                                    {cargo.nombre}
                                </option>
                            ))}
                        </select>
                        {errors.cargo_id && (
                            <p className="mt-1 text-sm text-red-600">{errors.cargo_id}</p>
                        )}
                    </div>
                </div>

                {/* ----- Fecha de ingreso y estado ----- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Fecha de ingreso
                        </label>
                        <input
                            type="date"
                            value={data.fecha_ingreso}
                            onChange={(e) => setData('fecha_ingreso', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        />
                        {errors.fecha_ingreso && (
                            <p className="mt-1 text-sm text-red-600">{errors.fecha_ingreso}</p>
                        )}
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-700 pb-2">
                        <input
                            type="checkbox"
                            checked={data.activo}
                            onChange={(e) => setData('activo', e.target.checked)}
                            className="rounded border-slate-300"
                        />
                        Empleado activo
                    </label>
                </div>

                {/* ----- Botones ----- */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {processing ? 'Guardando...' : editando ? 'Guardar cambios' : 'Registrar empleado'}
                    </button>
                    <Link
                        href="/empleados"
                        className="rounded-lg border border-slate-300 px-5 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        Cancelar
                    </Link>
                </div>
            </form>
        </PanelLayout>
    );
}
