// ============================================================
// PUNTO DE ENTRADA DEL FRONTEND
// Este archivo arranca React y lo conecta con Laravel vía Inertia.
// Solo se toca una vez; el trabajo diario ocurre en Pages/ y Layouts/.
// ============================================================

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

createInertiaApp({
    // Cuando Laravel dice "muestra la página 'Empleados/Index'",
    // esta función busca el archivo ./Pages/Empleados/Index.jsx.
    // import.meta.glob registra TODOS los .jsx de Pages/ de una vez.
    resolve: (nombre) => {
        const paginas = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        return paginas[`./Pages/${nombre}.jsx`];
    },

    // Monta la aplicación React dentro del <div id="app"> del blade raíz.
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },

    // Barra de progreso azul que aparece arriba al navegar entre páginas.
    progress: {
        color: '#2563eb',
    },
});
