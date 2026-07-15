<!DOCTYPE html>
{{--
    Plantilla raíz de Inertia.
    Es la ÚNICA página HTML real de todo el sistema: Laravel la entrega
    una sola vez y, a partir de ahí, React toma el control y va cambiando
    el contenido de <div id="app"> sin recargar el navegador.
--}}
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    {{-- El título lo puede cambiar cada página React con <Head> --}}
    <title inertia>{{ config('app.name', 'BioAdmin') }}</title>

    {{-- Habilita el refresco instantáneo de React durante el desarrollo --}}
    @viteReactRefresh

    {{-- Carga los estilos y el JavaScript compilados por Vite --}}
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])

    @inertiaHead
</head>
<body class="font-sans antialiased bg-slate-100">
    {{-- Aquí "vive" toda la aplicación React --}}
    @inertia
</body>
</html>
