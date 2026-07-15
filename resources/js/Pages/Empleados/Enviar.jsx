// ============================================================
// EMPLEADOS — ENVIAR AL EQUIPO ZKTECO.
// Registra a todos los empleados activos (código + nombre) en el
// equipo elegido, para que puedan marcar. La huella se registra
// después, físicamente en el equipo (Menú > Usuarios).
// ============================================================

import { Head, Link, useForm } from '@inertiajs/react';
import PanelLayout from '../../Layouts/PanelLayout';

export default function Enviar({ dispositivos, totalActivos }) {
    // ---------- DATOS ----------
    const { data, setData, post, processing, errors } = useForm({
        dispositivo_id: '',
    });

    // ---------- FUNCIONES ----------
    function enviar(e) {
        e.preventDefault();

        const equipo = dispositivos.find(
            (d) => String(d.id) === String(data.dispositivo_id),
        );

        if (
            confirm(
                `Se enviarán ${totalActivos} empleado(s) activos al equipo ` +
                    `"${equipo?.nombre}".\n\nLos códigos que ya existan en el equipo ` +
                    'se actualizan (no se duplican). ¿Continuar?',
            )
        ) {
            post('/empleados/enviar');
        }
    }

    // ---------- JSX ----------
    return (
        <PanelLayout titulo="Enviar empleados al equipo">
            <Head title="Enviar al equipo" />

            <div className="max-w-2xl space-y-6">
                <form onSubmit={enviar} className="bg-white rounded-xl border border-slate-200 p-6">
                    <p className="text-sm text-slate-600">
                        Se registrarán <strong>{totalActivos} empleado(s) activos</strong> en
                        el equipo que elijas (código + nombre). Esto les permite marcar;
                        la <strong>huella</strong> se registra una sola vez físicamente en
                        el equipo: Menú → Usuarios → elegir al empleado → Registrar huella.
                    </p>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Equipo destino *
                        </label>
                        <select
                            value={data.dispositivo_id}
                            onChange={(e) => setData('dispositivo_id', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        >
                            <option value="">— Selecciona un equipo —</option>
                            {dispositivos.map((dispositivo) => (
                                <option key={dispositivo.id} value={dispositivo.id}>
                                    {dispositivo.nombre} ({dispositivo.ip})
                                    {dispositivo.ubicacion ? ` — ${dispositivo.ubicacion}` : ''}
                                </option>
                            ))}
                        </select>
                        {errors.dispositivo_id && (
                            <p className="mt-1 text-sm text-red-600">{errors.dispositivo_id}</p>
                        )}
                    </div>

                    <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
                        Requisitos: el puente debe estar corriendo (iniciar_puente.bat) y
                        los códigos biométricos deben ser numéricos (1 a 65534). Los que
                        no lo sean se reportarán como error sin detener el resto.
                    </div>

                    <div className="mt-4 flex gap-3">
                        <button
                            type="submit"
                            disabled={processing || !data.dispositivo_id}
                            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? 'Enviando (puede tardar)...' : 'Enviar empleados'}
                        </button>
                        <Link
                            href="/empleados"
                            className="rounded-lg border border-slate-300 px-5 py-2 text-sm text-slate-600 hover:bg-slate-50"
                        >
                            Cancelar
                        </Link>
                    </div>
                </form>

                {dispositivos.length === 0 && (
                    <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                        No hay equipos activos registrados. Ve a Dispositivos y registra uno primero.
                    </div>
                )}
            </div>
        </PanelLayout>
    );
}
