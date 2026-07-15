// ============================================================
// EMPLEADOS — IMPORTACIÓN DESDE EXCEL.
//
// CONCEPTO REACT #6 — SUBIR ARCHIVOS:
// Un input de archivo NO puede ser "controlado" como los de texto
// (el navegador no permite ponerle valor por seguridad). Por eso
// solo escuchamos onChange y guardamos el archivo elegido:
// e.target.files[0] = el primer (y único) archivo seleccionado.
// Inertia detecta que hay un archivo y lo envía como formulario
// multipart automáticamente.
// ============================================================

import { Head, Link, useForm } from '@inertiajs/react';
import PanelLayout from '../../Layouts/PanelLayout';

export default function Importar({ resultado }) {
    // ---------- DATOS ----------
    const { data, setData, post, processing, errors } = useForm({
        archivo: null,
    });

    // ---------- FUNCIONES ----------
    function subir(e) {
        e.preventDefault();
        post('/empleados/importar');
    }

    // ---------- JSX ----------
    return (
        <PanelLayout titulo="Importar empleados desde Excel">
            <Head title="Importar empleados" />

            <div className="max-w-2xl space-y-6">
                {/* ----- Paso 1: plantilla ----- */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="font-semibold text-slate-800">1. Descarga la plantilla</h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Llénala en Excel: una fila por empleado. Columnas obligatorias:
                        <span className="font-mono text-xs"> codigo_biometrico, nombres, apellidos</span>.
                        Las demás son opcionales. Si un departamento o cargo no existe,
                        se crea solo. Si el código ya existe, se actualizan sus datos.
                    </p>
                    {/* <a> normal (no <Link>): es una descarga de archivo,
                        no una navegación dentro de la aplicación */}
                    <a
                        href="/empleados/plantilla"
                        className="mt-3 inline-block rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                        ⬇ Descargar plantilla_empleados.xlsx
                    </a>
                </div>

                {/* ----- Paso 2: subir ----- */}
                <form
                    onSubmit={subir}
                    className="bg-white rounded-xl border border-slate-200 p-6"
                >
                    <h2 className="font-semibold text-slate-800">2. Sube el archivo llenado</h2>

                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => setData('archivo', e.target.files[0])}
                        className="mt-3 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {errors.archivo && (
                        <p className="mt-2 text-sm text-red-600">{errors.archivo}</p>
                    )}

                    <div className="mt-4 flex gap-3">
                        <button
                            type="submit"
                            disabled={processing || !data.archivo}
                            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? 'Importando...' : 'Importar empleados'}
                        </button>
                        <Link
                            href="/empleados"
                            className="rounded-lg border border-slate-300 px-5 py-2 text-sm text-slate-600 hover:bg-slate-50"
                        >
                            Volver a empleados
                        </Link>
                    </div>
                </form>

                {/* ----- Paso 3: resultado (solo si acaba de importarse algo) ----- */}
                {resultado && (
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h2 className="font-semibold text-slate-800">Resultado</h2>

                        <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                            <div className="rounded-lg bg-green-50 p-3">
                                <div className="text-2xl font-bold text-green-700">
                                    {resultado.creados}
                                </div>
                                <div className="text-xs text-green-700">creados</div>
                            </div>
                            <div className="rounded-lg bg-blue-50 p-3">
                                <div className="text-2xl font-bold text-blue-700">
                                    {resultado.actualizados}
                                </div>
                                <div className="text-xs text-blue-700">actualizados</div>
                            </div>
                            <div className="rounded-lg bg-red-50 p-3">
                                <div className="text-2xl font-bold text-red-700">
                                    {resultado.errores.length}
                                </div>
                                <div className="text-xs text-red-700">filas con error</div>
                            </div>
                        </div>

                        {resultado.errores.length > 0 && (
                            <ul className="mt-4 space-y-1 text-sm text-red-700">
                                {resultado.errores.map((error, indice) => (
                                    <li key={indice} className="rounded bg-red-50 px-3 py-1.5">
                                        {error}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </PanelLayout>
    );
}
