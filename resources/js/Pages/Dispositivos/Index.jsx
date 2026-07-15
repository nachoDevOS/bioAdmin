// ============================================================
// DISPOSITIVOS — LISTA.
// Esta pantalla es el PATRÓN de todas las listas del sistema:
// buscador + tabla + paginación + botones editar/eliminar.
// Entendida esta, entendidas todas.
// ============================================================

import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import Paginacion from '../../Components/Paginacion';
import PanelLayout from '../../Layouts/PanelLayout';

// Props que envía DispositivoController@index:
//   dispositivos = página actual de resultados (con .data y .links)
//   filtros      = lo que se estaba buscando (para no perderlo al recargar)
export default function Index({ dispositivos, filtros }) {
    // ---------- DATOS ----------
    // CONCEPTO REACT #5 — useState:
    // useState crea una variable que React "vigila": cuando cambia con
    // su función set..., React redibuja la pantalla solo. Devuelve un
    // par [valorActual, funciónParaCambiarlo].
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');

    // ---------- FUNCIONES ----------
    function buscarAhora(e) {
        e.preventDefault();
        // Pide a Laravel la misma lista pero filtrada.
        // preserveState: true → no reinicia lo escrito en el buscador.
        router.get('/dispositivos', { buscar }, { preserveState: true, replace: true });
    }

    function eliminar(dispositivo) {
        // Confirmación nativa del navegador: simple y suficiente
        if (confirm(`¿Eliminar el dispositivo "${dispositivo.nombre}"?`)) {
            router.delete(`/dispositivos/${dispositivo.id}`);
        }
    }

    // Pide a Laravel que pruebe la conexión real con el equipo
    // (vía el puente Python). El resultado llega como mensaje flash.
    const [probandoId, setProbandoId] = useState(null);

    function probarConexion(dispositivo) {
        setProbandoId(dispositivo.id); // para mostrar "Probando..." en ese botón
        router.post(
            `/dispositivos/${dispositivo.id}/probar`,
            {},
            {
                preserveScroll: true, // no saltar al inicio de la página
                onFinish: () => setProbandoId(null), // pase lo que pase, soltar el botón
            },
        );
    }

    // ---------- JSX ----------
    return (
        <PanelLayout titulo="Dispositivos">
            <Head title="Dispositivos" />

            {/* Encabezado: buscador a la izquierda, botón crear a la derecha */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <form onSubmit={buscarAhora} className="flex gap-2">
                    <input
                        type="text"
                        value={buscar}
                        onChange={(e) => setBuscar(e.target.value)}
                        placeholder="Buscar por nombre, IP o ubicación..."
                        className="w-72 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    />
                    <button
                        type="submit"
                        className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-800"
                    >
                        Buscar
                    </button>
                </form>

                <Link
                    href="/dispositivos/crear"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    + Nuevo dispositivo
                </Link>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                            <th className="px-4 py-3">Nombre</th>
                            <th className="px-4 py-3">IP : Puerto</th>
                            <th className="px-4 py-3">Ubicación</th>
                            <th className="px-4 py-3">Estado</th>
                            <th className="px-4 py-3">Última conexión</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* dispositivos.data = las filas de la página actual */}
                        {dispositivos.data.map((dispositivo) => (
                            <tr
                                key={dispositivo.id}
                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                            >
                                <td className="px-4 py-3 font-medium text-slate-800">
                                    {dispositivo.nombre}
                                </td>
                                <td className="px-4 py-3 font-mono text-slate-600">
                                    {dispositivo.ip}:{dispositivo.puerto}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                    {dispositivo.ubicacion || '—'}
                                </td>
                                <td className="px-4 py-3">
                                    {/* Insignia verde o gris según activo */}
                                    <span
                                        className={
                                            'rounded-full px-2.5 py-0.5 text-xs font-medium ' +
                                            (dispositivo.activo
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-slate-100 text-slate-500')
                                        }
                                    >
                                        {dispositivo.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-500">
                                    {/* Se llenará cuando el puente se conecte (Fase 3) */}
                                    {dispositivo.ultima_conexion ?? 'Nunca'}
                                </td>
                                <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                                    <button
                                        onClick={() => probarConexion(dispositivo)}
                                        disabled={probandoId === dispositivo.id}
                                        className="text-emerald-600 hover:underline disabled:opacity-50"
                                    >
                                        {probandoId === dispositivo.id ? 'Probando...' : 'Probar'}
                                    </button>
                                    <Link
                                        href={`/dispositivos/${dispositivo.id}/editar`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        Editar
                                    </Link>
                                    <button
                                        onClick={() => eliminar(dispositivo)}
                                        className="text-red-600 hover:underline"
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {/* Si no hay resultados, una fila avisándolo */}
                        {dispositivos.data.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-4 py-8 text-center text-slate-400">
                                    No hay dispositivos que coincidan con la búsqueda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Paginacion links={dispositivos.links} />
        </PanelLayout>
    );
}
