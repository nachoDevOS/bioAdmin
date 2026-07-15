// ============================================================
// DISPOSITIVOS — FORMULARIO (crear y editar en una sola pantalla).
//
// El controlador manda "dispositivo":
//   - null           → estamos CREANDO (formulario vacío)
//   - con datos      → estamos EDITANDO (formulario precargado)
// Este truco se repite en todos los formularios del sistema.
// ============================================================

import { Head, Link, useForm } from '@inertiajs/react';
import PanelLayout from '../../Layouts/PanelLayout';

export default function Formulario({ dispositivo }) {
    // ---------- DATOS ----------
    // ¿Estamos editando? (true si el controlador mandó un dispositivo)
    const editando = dispositivo !== null;

    // useForm precarga los valores existentes al editar,
    // o los valores por defecto al crear (?? = "si es null, usa esto").
    const { data, setData, post, put, processing, errors } = useForm({
        nombre: dispositivo?.nombre ?? '',
        ip: dispositivo?.ip ?? '',
        puerto: dispositivo?.puerto ?? 4370,
        clave_comunicacion: dispositivo?.clave_comunicacion ?? 0,
        ubicacion: dispositivo?.ubicacion ?? '',
        activo: dispositivo?.activo ?? true,
        notas: dispositivo?.notas ?? '',
    });

    // ---------- FUNCIONES ----------
    function guardar(e) {
        e.preventDefault();
        if (editando) {
            put(`/dispositivos/${dispositivo.id}`); // actualizar existente
        } else {
            post('/dispositivos'); // crear nuevo
        }
    }

    // ---------- JSX ----------
    return (
        <PanelLayout titulo={editando ? 'Editar dispositivo' : 'Nuevo dispositivo'}>
            <Head title="Dispositivos" />

            <form
                onSubmit={guardar}
                className="max-w-2xl bg-white rounded-xl border border-slate-200 p-6 space-y-5"
            >
                {/* ----- Nombre ----- */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Nombre del equipo *
                    </label>
                    <input
                        type="text"
                        value={data.nombre}
                        onChange={(e) => setData('nombre', e.target.value)}
                        placeholder="Ej. Puerta principal"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    />
                    {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
                </div>

                {/* ----- IP y puerto en dos columnas ----- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Dirección IP *
                        </label>
                        <input
                            type="text"
                            value={data.ip}
                            onChange={(e) => setData('ip', e.target.value)}
                            placeholder="192.168.1.201"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-blue-500 outline-none"
                        />
                        {errors.ip && <p className="mt-1 text-sm text-red-600">{errors.ip}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Puerto *
                        </label>
                        <input
                            type="number"
                            value={data.puerto}
                            onChange={(e) => setData('puerto', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        />
                        <p className="mt-1 text-xs text-slate-400">4370 salvo que lo hayan cambiado en el equipo.</p>
                        {errors.puerto && <p className="mt-1 text-sm text-red-600">{errors.puerto}</p>}
                    </div>
                </div>

                {/* ----- Comm Key y ubicación ----- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Comm Key
                        </label>
                        <input
                            type="number"
                            value={data.clave_comunicacion}
                            onChange={(e) => setData('clave_comunicacion', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        />
                        <p className="mt-1 text-xs text-slate-400">0 = sin clave (valor de fábrica).</p>
                        {errors.clave_comunicacion && (
                            <p className="mt-1 text-sm text-red-600">{errors.clave_comunicacion}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Ubicación
                        </label>
                        <input
                            type="text"
                            value={data.ubicacion}
                            onChange={(e) => setData('ubicacion', e.target.value)}
                            placeholder="Ej. Planta 2, RRHH"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* ----- Notas ----- */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
                    <textarea
                        value={data.notas}
                        onChange={(e) => setData('notas', e.target.value)}
                        rows="3"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    />
                </div>

                {/* ----- Activo ----- */}
                <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        checked={data.activo}
                        onChange={(e) => setData('activo', e.target.checked)}
                        className="rounded border-slate-300"
                    />
                    Equipo activo (el puente lo consultará cada 5 minutos)
                </label>

                {/* ----- Botones ----- */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {processing ? 'Guardando...' : editando ? 'Guardar cambios' : 'Registrar dispositivo'}
                    </button>
                    <Link
                        href="/dispositivos"
                        className="rounded-lg border border-slate-300 px-5 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        Cancelar
                    </Link>
                </div>
            </form>
        </PanelLayout>
    );
}
