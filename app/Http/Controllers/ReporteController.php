<?php

namespace App\Http\Controllers;

use App\Exports\AsistenciaDetalleExport;
use App\Exports\AsistenciaResumenExport;
use App\Models\Configuracion;
use App\Models\Empleado;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;

/**
 * Módulo Reportes: asistencia detallada o resumen por empleado,
 * en Excel o PDF, por rango de fechas (y opcionalmente un empleado).
 */
class ReporteController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Reportes/Index', [
            'empleados' => Empleado::orderBy('apellidos')
                ->get(['id', 'nombres', 'apellidos', 'codigo_biometrico']),
        ]);
    }

    /**
     * Genera y DESCARGA el reporte. Es un GET normal (no Inertia):
     * el navegador recibe el archivo directamente.
     */
    public function descargar(Request $request)
    {
        $datos = $request->validate([
            'tipo' => ['required', 'in:detalle,resumen'],
            'formato' => ['required', 'in:excel,pdf'],
            'desde' => ['required', 'date'],
            'hasta' => ['required', 'date', 'after_or_equal:desde'],
            'empleado_id' => ['nullable', 'exists:empleados,id'],
        ]);

        $empleadoId = $datos['empleado_id'] ?? null;
        $nombreArchivo = "asistencia_{$datos['tipo']}_{$datos['desde']}_{$datos['hasta']}";

        // ---------- EXCEL ----------
        if ($datos['formato'] === 'excel') {
            $export = $datos['tipo'] === 'detalle'
                ? new AsistenciaDetalleExport($datos['desde'], $datos['hasta'], $empleadoId)
                : new AsistenciaResumenExport($datos['desde'], $datos['hasta'], $empleadoId);

            return Excel::download($export, "{$nombreArchivo}.xlsx");
        }

        // ---------- PDF ----------
        // Reutilizamos los MISMOS exportadores para obtener las filas:
        // una sola fuente de datos para ambos formatos.
        $export = $datos['tipo'] === 'detalle'
            ? new AsistenciaDetalleExport($datos['desde'], $datos['hasta'], $empleadoId)
            : new AsistenciaResumenExport($datos['desde'], $datos['hasta'], $empleadoId);

        $filas = $export->collection()->map(fn ($fila) => $export->map($fila));

        $pdf = Pdf::loadView('reportes.tabla_pdf', [
            'titulo' => $datos['tipo'] === 'detalle'
                ? 'Reporte detallado de asistencia'
                : 'Resumen de asistencia por empleado',
            'empresa' => Configuracion::valor('nombre_empresa', 'BioAdmin'),
            'desde' => $datos['desde'],
            'hasta' => $datos['hasta'],
            'encabezados' => $export->headings(),
            'filas' => $filas,
        ])->setPaper('a4', 'landscape'); // horizontal: la tabla es ancha

        return $pdf->download("{$nombreArchivo}.pdf");
    }
}
