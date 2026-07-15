// ============================================================
// PAGINACIÓN — botones "Anterior 1 2 3 Siguiente".
// Recibe por props el objeto "links" que Laravel genera al usar
// ->paginate() en el controlador. Cada link trae:
//   { url: "...?page=2" o null, label: "2", active: true/false }
// Sirve igual para TODAS las tablas del sistema.
// ============================================================

import { Link } from '@inertiajs/react';

export default function Paginacion({ links }) {
    // ---------- DATOS ----------
    // Con una sola página no hay nada que paginar (links trae
    // solo "anterior, 1, siguiente" = 3 elementos).
    if (!links || links.length <= 3) return null;

    // ---------- FUNCIONES ----------
    // Laravel manda las etiquetas en inglés y con códigos HTML
    // (&laquo; = «). Las traducimos a texto simple.
    function etiqueta(texto) {
        return texto
            .replace('&laquo; Previous', '« Anterior')
            .replace('Next &raquo;', 'Siguiente »');
    }

    // ---------- JSX ----------
    return (
        <div className="mt-4 flex flex-wrap gap-1">
            {links.map((link, indice) =>
                link.url ? (
                    <Link
                        key={indice}
                        href={link.url}
                        className={
                            'rounded-md px-3 py-1.5 text-sm border transition ' +
                            (link.active
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50')
                        }
                    >
                        {etiqueta(link.label)}
                    </Link>
                ) : (
                    // Link sin URL = deshabilitado (ej. "Anterior" en la página 1)
                    <span
                        key={indice}
                        className="rounded-md px-3 py-1.5 text-sm border border-slate-100 text-slate-300"
                    >
                        {etiqueta(link.label)}
                    </span>
                ),
            )}
        </div>
    );
}
