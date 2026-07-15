// ============================================================
// CONFIGURACIÓN GENERAL.
// Los campos NO están escritos aquí: llegan del controlador
// (ConfiguracionController::CAMPOS). Agregar un campo nuevo allá
// hace que esta pantalla lo pinte sola. Un solo formulario, un
// solo botón Guardar.
// ============================================================

import { Head, useForm } from '@inertiajs/react';
import PanelLayout from '../../Layouts/PanelLayout';

export default function Index({ campos, valores }) {
    // ---------- DATOS ----------
    // data.valores es un objeto {clave: valor} con TODOS los campos.
    const { data, setData, post, processing, errors } = useForm({
        valores: Object.fromEntries(
            // Por cada campo definido, tomamos su valor guardado (o '')
            campos.map((campo) => [campo.clave, valores[campo.clave] ?? '']),
        ),
    });

    // ---------- FUNCIONES ----------
    // Cambia UNA clave dentro del objeto valores. Los ... copian el
    // objeto anterior y [clave] sobrescribe solo la que cambió
    // (en React el estado nunca se modifica: se reemplaza).
    function cambiarValor(clave, valor) {
        setData('valores', { ...data.valores, [clave]: valor });
    }

    function guardar(e) {
        e.preventDefault();
        post('/configuracion');
    }

    // ---------- JSX ----------
    return (
        <PanelLayout titulo="Configuración general">
            <Head title="Configuración" />

            <form
                onSubmit={guardar}
                className="max-w-xl bg-white rounded-xl border border-slate-200 p-6 space-y-5"
            >
                {campos.map((campo) => (
                    <div key={campo.clave}>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {campo.etiqueta}
                        </label>
                        <input
                            type="text"
                            value={data.valores[campo.clave]}
                            onChange={(e) => cambiarValor(campo.clave, e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        />
                        <p className="mt-1 text-xs text-slate-400">{campo.ayuda}</p>
                        {errors[`valores.${campo.clave}`] && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors[`valores.${campo.clave}`]}
                            </p>
                        )}
                    </div>
                ))}

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {processing ? 'Guardando...' : 'Guardar configuración'}
                    </button>
                </div>
            </form>
        </PanelLayout>
    );
}
