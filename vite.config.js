import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import tailwindcss from '@tailwindcss/vite';
// Plugin oficial que enseña a Vite a compilar archivos React (.jsx)
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            // app.jsx es ahora el punto de entrada del frontend (antes app.js)
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
            fonts: [
                bunny('Instrument Sans', {
                    weights: [400, 500, 600],
                }),
            ],
        }),
        tailwindcss(),
        react(),
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
