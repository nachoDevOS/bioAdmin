// ============================================================
// TURNOS — FORMULARIO (crear/editar).
//
// CONCEPTO REACT #7 — CAMPOS CONDICIONALES:
// El formulario CAMBIA según lo elegido: si el tipo es "partido"
// aparece el segundo bloque de horas. No hay magia: es el mismo
// renderizado condicional {condicion && <div>...} de siempre,
// pero ahora la condición depende del propio estado del formulario.
// ============================================================

import { Head, Link, useForm } from '@inertiajs/react';
import PanelLayout from '../../Layouts/PanelLayout';

// Días de la semana en orden ISO (1=lunes ... 7=domingo)
const DIAS = [
    { numero: 1, nombre: 'Lunes' },
    { numero: 2, nombre: 'Martes' },
    { numero: 3, nombre: 'Miércoles' },
    { numero: 4, nombre: 'Jueves' },
    { numero: 5, nombre: 'Viernes' },
    { numero: 6, nombre: 'Sábado' },
    { numero: 7, nombre: 'Domingo' },
];

export default function Formulario({ turno }) {
    // ---------- DATOS ----------
    const editando = turno !== null;

    const { data, setData, post, put, processing, errors } = useForm({
        nombre: turno?.nombre ?? '',
        tipo: turno?.tipo ?? 'fijo',
        // La BD guarda "08:00:00"; el input time usa "08:00"
        hora_entrada: turno?.hora_entrada?.substring(0, 5) ?? '08:00',
        hora_salida: turno?.hora_salida?.substring(0, 5) ?? '17:00',
        hora_entrada_2: turno?.hora_entrada_2?.substring(0, 5) ?? '',
        hora_salida_2: turno?.hora_salida_2?.substring(0, 5) ?? '',
        tolerancia_entrada_minutos: turno?.tolerancia_entrada_minutos ?? 5,
        dias_laborables: turno?.dias_laborables ?? [1, 2, 3, 4, 5],
        activo: turno?.activo ?? true,
    });

    // ---------- FUNCIONES ----------
    // Igual que los permisos en Roles: agregar/quitar del arreglo
    // creando siempre un arreglo NUEVO (regla de React).
    function alternarDia(numero) {
        if (data.dias_laborables.includes(numero)) {
            setData('dias_laborables', data.dias_laborables.filter((d) => d !== numero));
        } else {
            setData('dias_laborables', [...data.dias_laborables, numero]);
        }
    }

    function guardar(e) {
        e.preventDefault();
        if (editando) {
            put(`/turnos/${turno.id}`);
        } else {
            post('/turnos');
        }
    }

    // ---------- JSX ----------
    return (
        <PanelLayout titulo={editando ? 'Editar turno' : 'Nuevo turno'}>
            <Head title="Turnos" />

            <form
                onSubmit={guardar}
                className="max-w-2xl bg-white rounded-xl border border-slate-200 p-6 space-y-5"
            >
                {/* ----- Nombre y tipo ----- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Nombre *
                        </label>
                        <input
                            type="text"
                            value={data.nombre}
                            onChange={(e) => setData('nombre', e.target.value)}
                            placeholder="Ej. Oficina L-V"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                            autoFocus
                        />
                        {errors.nombre && (
                            <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Tipo *
                        </label>
                        <select
                            value={data.tipo}
                            onChange={(e) => setData('tipo', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        >
                            <option value="fijo">Fijo (un bloque, ej. 08:00–17:00)</option>
                            <option value="partido">Partido (dos bloques con pausa)</option>
                            <option value="nocturno">Nocturno (sale al día siguiente)</option>
                        </select>
                    </div>
                </div>

                {/* ----- Bloque 1 de horario ----- */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Hora de entrada *
                        </label>
                        <input
                            type="time"
                            value={data.hora_entrada}
                            onChange={(e) => setData('hora_entrada', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        />
                        {errors.hora_entrada && (
                            <p className="mt-1 text-sm text-red-600">{errors.hora_entrada}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Hora de salida *
                        </label>
                        <input
                            type="time"
                            value={data.hora_salida}
                            onChange={(e) => setData('hora_salida', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        />
                        {data.tipo === 'nocturno' && (
                            <p className="mt-1 text-xs text-violet-600">
                                Salida del día siguiente (cruza medianoche).
                            </p>
                        )}
                        {errors.hora_salida && (
                            <p className="mt-1 text-sm text-red-600">{errors.hora_salida}</p>
                        )}
                    </div>
                </div>

                {/* ----- Bloque 2: SOLO aparece si el tipo es "partido" ----- */}
                {data.tipo === 'partido' && (
                    <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Entrada del 2.º bloque *
                            </label>
                            <input
                                type="time"
                                value={data.hora_entrada_2}
                                onChange={(e) => setData('hora_entrada_2', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                            />
                            {errors.hora_entrada_2 && (
                                <p className="mt-1 text-sm text-red-600">{errors.hora_entrada_2}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Salida del 2.º bloque *
                            </label>
                            <input
                                type="time"
                                value={data.hora_salida_2}
                                onChange={(e) => setData('hora_salida_2', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                            />
                            {errors.hora_salida_2 && (
                                <p className="mt-1 text-sm text-red-600">{errors.hora_salida_2}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* ----- Tolerancia ----- */}
                <div className="max-w-xs">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Tolerancia de entrada (minutos) *
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="120"
                        value={data.tolerancia_entrada_minutos}
                        onChange={(e) => setData('tolerancia_entrada_minutos', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    />
                    <p className="mt-1 text-xs text-slate-400">
                        Llegar hasta N minutos tarde no cuenta como tardanza.
                    </p>
                    {errors.tolerancia_entrada_minutos && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.tolerancia_entrada_minutos}
                        </p>
                    )}
                </div>

                {/* ----- Días laborables ----- */}
                <div>
                    <div className="text-sm font-medium text-slate-700 mb-2">
                        Días laborables *
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {DIAS.map((dia) => (
                            <label
                                key={dia.numero}
                                className={
                                    'cursor-pointer rounded-lg border px-3 py-1.5 text-sm transition ' +
                                    (data.dias_laborables.includes(dia.numero)
                                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                                        : 'border-slate-200 text-slate-500 hover:bg-slate-50')
                                }
                            >
                                {/* checkbox invisible: la etiqueta entera es el botón */}
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={data.dias_laborables.includes(dia.numero)}
                                    onChange={() => alternarDia(dia.numero)}
                                />
                                {dia.nombre}
                            </label>
                        ))}
                    </div>
                    {errors.dias_laborables && (
                        <p className="mt-1 text-sm text-red-600">{errors.dias_laborables}</p>
                    )}
                </div>

                {/* ----- Activo ----- */}
                <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        checked={data.activo}
                        onChange={(e) => setData('activo', e.target.checked)}
                        className="rounded border-slate-300"
                    />
                    Turno activo (disponible para asignar)
                </label>

                {/* ----- Botones ----- */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {processing ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear turno'}
                    </button>
                    <Link
                        href="/turnos"
                        className="rounded-lg border border-slate-300 px-5 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        Cancelar
                    </Link>
                </div>
            </form>
        </PanelLayout>
    );
}
