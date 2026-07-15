// ============================================================
// LAYOUT DEL PANEL — el "marco" que envuelve todas las pantallas:
// menú lateral + barra superior + mensajes de éxito/error.
//
// CONCEPTO REACT #1 — PROPS:
// Un componente es una función que recibe un objeto llamado "props"
// (propiedades) y devuelve HTML (JSX). Las props son como los
// parámetros de una función PHP: quien usa el componente decide
// qué valores pasarle. Aquí recibimos:
//   - titulo   : texto para la barra superior
//   - children : TODO lo que se escriba dentro de <PanelLayout>...</PanelLayout>
//                (children = "hijos"; es una prop especial automática)
// ============================================================

import { Link, router, usePage } from '@inertiajs/react';

export default function PanelLayout({ titulo, children }) {
    // ---------------------------------------------------------
    // 1. DATOS (siempre arriba)
    // ---------------------------------------------------------

    // usePage().props trae los datos que Laravel comparte con TODAS
    // las páginas (los definimos en HandleInertiaRequests.php):
    // el usuario conectado y los mensajes flash.
    const { auth, flash } = usePage().props;
    const usuario = auth.usuario;

    // URL actual, para resaltar en el menú la sección donde estamos
    const urlActual = usePage().url;

    // El menú es un simple arreglo de objetos. "permiso" indica qué
    // permiso necesita el usuario para ver esa opción (null = todos).
    const menu = [
        { texto: 'Panel del día', ruta: '/panel', permiso: null },
        { texto: 'Mi portal', ruta: '/portal', permiso: 'ver-portal' },
        { texto: 'Asistencia', ruta: '/asistencias', permiso: 'ver-asistencia' },
        { texto: 'Marcaciones', ruta: '/marcaciones', permiso: 'ver-marcaciones' },
        { texto: 'Permisos', ruta: '/permisos', permiso: 'gestionar-permisos' },
        { texto: 'Calendario', ruta: '/calendario', permiso: 'ver-asistencia' },
        { texto: 'Turnos', ruta: '/turnos', permiso: 'gestionar-turnos' },
        { texto: 'Asignaciones', ruta: '/asignaciones', permiso: 'gestionar-turnos' },
        { texto: 'Cierre de período', ruta: '/cierres', permiso: 'gestionar-asistencia' },
        { texto: 'Reportes', ruta: '/reportes', permiso: 'ver-reportes' },
        { texto: 'Dispositivos', ruta: '/dispositivos', permiso: 'gestionar-dispositivos' },
        { texto: 'Departamentos', ruta: '/departamentos', permiso: 'gestionar-organizacion' },
        { texto: 'Cargos', ruta: '/cargos', permiso: 'gestionar-organizacion' },
        { texto: 'Empleados', ruta: '/empleados', permiso: 'gestionar-empleados' },
        { texto: 'Usuarios', ruta: '/usuarios', permiso: 'gestionar-usuarios' },
        { texto: 'Roles', ruta: '/roles', permiso: 'gestionar-usuarios' },
        { texto: 'Auditoría', ruta: '/auditoria', permiso: 'ver-auditoria' },
        { texto: 'Configuración', ruta: '/configuracion', permiso: 'gestionar-configuracion' },
    ];

    // ---------------------------------------------------------
    // 2. FUNCIONES (siempre al medio)
    // ---------------------------------------------------------

    // ¿El usuario puede ver esta opción del menú?
    function puedeVer(opcion) {
        if (!opcion.permiso) return true; // sin requisito → visible
        return usuario.permisos.includes(opcion.permiso);
    }

    // ¿Esta opción corresponde a la página actual? (para pintarla azul)
    function esActiva(ruta) {
        return (
            urlActual === ruta ||
            urlActual.startsWith(ruta + '/') ||
            urlActual.startsWith(ruta + '?')
        );
    }

    // Cerrar sesión: router.post envía la petición a Laravel sin
    // recargar la página completa (así funciona todo en Inertia).
    function cerrarSesion() {
        router.post('/logout');
    }

    // ---------------------------------------------------------
    // 3. JSX (siempre abajo) — lo que se dibuja en pantalla
    // ---------------------------------------------------------
    //
    // CONCEPTO REACT #2 — LISTAS CON .map():
    // Para repetir HTML por cada elemento de un arreglo se usa .map(),
    // el equivalente del foreach de PHP/Blade. Cada elemento repetido
    // necesita una prop "key" única: React la usa para saber qué fila
    // cambió sin redibujar todas.
    //
    // CONCEPTO REACT #3 — RENDERIZADO CONDICIONAL con &&:
    // {condicion && <div>...</div>} significa: "si la condición es
    // verdadera, dibuja este bloque; si no, no dibujes nada".
    // Es el equivalente de @if de Blade.

    return (
        <div className="flex min-h-screen bg-slate-100">
            {/* ===== MENÚ LATERAL ===== */}
            <aside className="w-64 shrink-0 bg-slate-900 text-slate-100 flex flex-col">
                <div className="px-6 py-5 border-b border-slate-700">
                    <div className="text-xl font-bold">BioAdmin</div>
                    <div className="text-xs text-slate-400">Asistencia biométrica</div>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1">
                    {/* filter deja solo las opciones permitidas; map las dibuja */}
                    {menu.filter(puedeVer).map((opcion) => (
                        <Link
                            key={opcion.ruta}
                            href={opcion.ruta}
                            className={
                                'block rounded-lg px-3 py-2 text-sm transition ' +
                                (esActiva(opcion.ruta)
                                    ? 'bg-blue-600 text-white font-medium'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white')
                            }
                        >
                            {opcion.texto}
                        </Link>
                    ))}
                </nav>

                <div className="px-6 py-4 border-t border-slate-700 text-xs text-slate-400">
                    Conectado como
                    <div className="text-slate-200 font-medium">{usuario.nombre}</div>
                </div>
            </aside>

            {/* ===== ZONA PRINCIPAL ===== */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Barra superior */}
                <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <h1 className="text-lg font-semibold text-slate-800">{titulo}</h1>
                    <button
                        onClick={cerrarSesion}
                        className="text-sm text-slate-500 hover:text-red-600 transition"
                    >
                        Cerrar sesión
                    </button>
                </header>

                {/* Contenido de cada pantalla */}
                <main className="flex-1 p-6">
                    {/* Mensaje de éxito (verde), solo si existe */}
                    {flash.exito && (
                        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
                            {flash.exito}
                        </div>
                    )}

                    {/* Mensaje de error (rojo), solo si existe */}
                    {flash.error && (
                        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                            {flash.error}
                        </div>
                    )}

                    {/* Aquí se inserta la pantalla envuelta por el layout */}
                    {children}
                </main>
            </div>
        </div>
    );
}
