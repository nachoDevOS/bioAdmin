// ============================================================
// TIPOS DE PERMISO — catálogo pequeño: lista + alta en la misma
// pantalla (no amerita páginas separadas).
// ============================================================

import { Head, Link, router, useForm } from '@inertiajs/react';
import PanelLayout from '../../Layouts/PanelLayout';

export default function Index({ tipos }) {
    // ---------- DATOS ----------
    const { data, setData, post, processing, errors, reset } = useForm({
        nombre: '',
        color: '#3b82f6',
        remunerado: true,
    });

    // ---------- FUNCIONES ----------
    function crear(e) {
        e.preventDefault();
        post('/tipos-permiso', {
            preserveScroll: true,
            onSuccess: () => reset('nombre'), // limpiar el campo tras crear
        });
    }

    function eliminar(tipo) {
        if (confirm(`¿Eliminar el tipo "${tipo.nombre}"?`)) {
            router.delete(`/tipos-permiso/${tipo.id}`, { preserveScroll: true });
        }
    }

    // ---------- JSX ----------
    return (
        <PanelLayout titulo="Tipos de permiso">
            <Head title="Tipos de permiso" />

            <div className="max-w-2xl space-y-4">
                <Link href="/permisos" className="text-sm text-blue-600 hover:underline">
                    ← Volver a permisos
                </Link>

                {/* Alta rápida */}
                <form
                    onSubmit={crear}
                    className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-end gap-3"
                >
                    <div className="flex-1 min-w-40">
                        <label className="block text-xs text-slate-500 mb-1">Nombre *</label>
                        <input
                            type="text"
                            value={data.nombre}
                            onChange={(e) => setData('nombre', e.target.value)}
                            placeholder="Ej. Permiso por estudios"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        />
                        {errors.nombre && (
                            <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Color</label>
                        <input
                            type="color"
                            value={data.color}
                            onChange={(e) => setData('color', e.target.value)}
                            className="h-9 w-14 cursor-pointer rounded border border-slate-300"
                        />
                    </div>
                    <label className="flex items-center gap-2 pb-2 text-sm text-slate-700">
                        <input
                            type="checkbox"
                            checked={data.remunerado}
                            onChange={(e) => setData('remunerado', e.target.checked)}
                            className="rounded border-slate-300"
                        />
                        Remunerado
                    </label>
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        + Agregar
                    </button>
                </form>

                {/* Lista */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                                <th className="px-4 py-3">Tipo</th>
                                <th className="px-4 py-3">Remunerado</th>
                                <th className="px-4 py-3">Lotes emitidos</th>
                                <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tipos.map((tipo) => (
                                <tr
                                    key={tipo.id}
                                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                >
                                    <td className="px-4 py-3">
                                        <span
                                            className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                                            style={{ backgroundColor: tipo.color }}
                                        >
                                            {tipo.nombre}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">
                                        {tipo.remunerado ? 'Sí' : 'No'}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{tipo.lotes_count}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => eliminar(tipo)}
                                            className="text-red-600 hover:underline"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </PanelLayout>
    );
}
