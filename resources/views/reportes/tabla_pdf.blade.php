{{--
    Plantilla PDF genérica: recibe título, encabezados y filas.
    La usan ambos reportes (detalle y resumen) — una sola plantilla
    que mantener. dompdf solo entiende HTML/CSS sencillo.
--}}
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <style>
        * { font-family: DejaVu Sans, sans-serif; }
        body { font-size: 10px; color: #1e293b; }
        h1 { font-size: 15px; margin: 0; }
        .sub { color: #64748b; margin: 2px 0 12px; font-size: 9px; }
        table { width: 100%; border-collapse: collapse; }
        th {
            background: #1e293b; color: #fff; text-align: left;
            padding: 5px 6px; font-size: 9px;
        }
        td { padding: 4px 6px; border-bottom: 1px solid #e2e8f0; }
        tr:nth-child(even) td { background: #f8fafc; }
        .pie { margin-top: 10px; color: #94a3b8; font-size: 8px; }
    </style>
</head>
<body>
    <h1>{{ $empresa }} — {{ $titulo }}</h1>
    <p class="sub">
        Período: {{ \Carbon\Carbon::parse($desde)->format('d/m/Y') }}
        al {{ \Carbon\Carbon::parse($hasta)->format('d/m/Y') }}
    </p>

    <table>
        <thead>
            <tr>
                @foreach ($encabezados as $encabezado)
                    <th>{{ $encabezado }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @forelse ($filas as $fila)
                <tr>
                    @foreach ($fila as $celda)
                        <td>{{ $celda }}</td>
                    @endforeach
                </tr>
            @empty
                <tr>
                    <td colspan="{{ count($encabezados) }}">Sin datos en el período.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <p class="pie">Generado por BioAdmin el {{ now()->format('d/m/Y H:i') }}</p>
</body>
</html>
