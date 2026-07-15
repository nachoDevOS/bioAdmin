// ============================================================
// CARGOS — FORMULARIO (crear/editar). Patrón estándar.
// ============================================================

import { Head, Link, useForm } from '@inertiajs/react';
import PanelLayout from '../../Layouts/PanelLayout';

export default function Formulario({ cargo }) {
    // ---------- DATOS ----------
    const editando = cargo !== null;

    const { data, setData, post, put, processing, errors } = useForm({
        nombre: cargo?.nombre ?? '',
        descripcion: cargo?.descripcion ?? '',
    });

    // ---------- FUNCIONES ----------
    function guardar(e) {
        e.preventDefault();
        if (editando) {
            put(`/cargos/${cargo.id}`);
        } else {
            post('/cargos');
        }
    }

    // ---------- JSX ----------
    return (
        <PanelLayout titulo={editando ? 'Editar cargo' : 'Nuevo cargo'}>
            <Head title="Cargos" />

            <form
                onSubmit={guardar}
                className="max-w-xl bg-white rounded-xl border border-slate-200 p-6 space-y-5"
            >
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Nombre *
                    </label>
                    <input
                        type="text"
                        value={data.nombre}
                        onChange={(e) => setData('nombre', e.target.value)}
                        placeholder="Ej. Operario"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        autoFocus
                    />
                    {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Descripción
                    </label>
                    <input
                        type="text"
                        value={data.descripcion}
                        onChange={(e) => setData('descripcion', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    />
                    {errors.descripcion && (
                        <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>
                    )}
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {processing ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear cargo'}
                    </button>
                    <Link
                        href="/cargos"
                        className="rounded-lg border border-slate-300 px-5 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        Cancelar
                    </Link>
                </div>
            </form>
        </PanelLayout>
    );
}
