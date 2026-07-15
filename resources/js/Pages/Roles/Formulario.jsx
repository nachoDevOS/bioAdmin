// ============================================================
// ROLES — FORMULARIO (crear/editar).
// Novedad: lista de casillas (checkboxes) para elegir permisos.
// El estado guarda un ARREGLO de textos: los permisos marcados.
// ============================================================

import { Head, Link, useForm } from '@inertiajs/react';
import PanelLayout from '../../Layouts/PanelLayout';

// Descripciones amigables de cada permiso técnico
const DESCRIPCIONES = {
    'gestionar-dispositivos': 'Registrar y administrar equipos ZKTeco',
    'gestionar-organizacion': 'Administrar departamentos y cargos',
    'gestionar-empleados': 'Registrar y administrar empleados',
    'gestionar-usuarios': 'Administrar usuarios y roles del sistema',
    'ver-auditoria': 'Consultar la bitácora de auditoría',
    'gestionar-configuracion': 'Cambiar la configuración general',
};

export default function Formulario({ rol, permisosDisponibles }) {
    // ---------- DATOS ----------
    const editando = rol !== null;

    const { data, setData, post, put, processing, errors } = useForm({
        name: rol?.name ?? '',
        // permisos ya asignados al editar, o ninguno al crear
        permisos: rol?.permisos ?? [],
    });

    // ---------- FUNCIONES ----------
    // Marcar/desmarcar una casilla = agregar/quitar el permiso del arreglo.
    // Regla de React: NUNCA modificar el arreglo existente; siempre crear
    // uno nuevo (por eso filter y [...data.permisos] en vez de push).
    function alternarPermiso(permiso) {
        if (data.permisos.includes(permiso)) {
            setData('permisos', data.permisos.filter((p) => p !== permiso));
        } else {
            setData('permisos', [...data.permisos, permiso]);
        }
    }

    function guardar(e) {
        e.preventDefault();
        if (editando) {
            put(`/roles/${rol.id}`);
        } else {
            post('/roles');
        }
    }

    // ---------- JSX ----------
    return (
        <PanelLayout titulo={editando ? 'Editar rol' : 'Nuevo rol'}>
            <Head title="Roles" />

            <form
                onSubmit={guardar}
                className="max-w-xl bg-white rounded-xl border border-slate-200 p-6 space-y-5"
            >
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Nombre del rol *
                    </label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Ej. Jefe de planta"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        autoFocus
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                    <div className="text-sm font-medium text-slate-700 mb-2">Permisos</div>
                    <div className="space-y-2">
                        {permisosDisponibles.map((permiso) => (
                            <label
                                key={permiso}
                                className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={data.permisos.includes(permiso)}
                                    onChange={() => alternarPermiso(permiso)}
                                    className="mt-0.5 rounded border-slate-300"
                                />
                                <span>
                                    <span className="block text-sm font-medium text-slate-800">
                                        {DESCRIPCIONES[permiso] ?? permiso}
                                    </span>
                                    <span className="block text-xs text-slate-400 font-mono">
                                        {permiso}
                                    </span>
                                </span>
                            </label>
                        ))}
                    </div>
                    {errors.permisos && (
                        <p className="mt-1 text-sm text-red-600">{errors.permisos}</p>
                    )}
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {processing ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear rol'}
                    </button>
                    <Link
                        href="/roles"
                        className="rounded-lg border border-slate-300 px-5 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        Cancelar
                    </Link>
                </div>
            </form>
        </PanelLayout>
    );
}
