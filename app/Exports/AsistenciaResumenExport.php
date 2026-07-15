<?php

namespace App\Exports;

use App\Models\Asistencia;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

/**
 * Reporte RESUMEN: una fila por empleado, con los totales del período.
 * Es el reporte que RRHH usa para la planilla.
 */
class AsistenciaResumenExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(
        private string $desde,
        private string $hasta,
        private ?int $empleadoId = null,
    ) {}

    public function collection(): Collection
    {
        // SUM(estado='x') cuenta cuántos días tuvo cada estado
        // (en MySQL, verdadero = 1 y falso = 0).
        return Asistencia::query()
            ->selectRaw("empleado_id,
                SUM(estado = 'puntual')    AS dias_puntuales,
                SUM(estado = 'tardanza')   AS dias_tardanza,
                SUM(estado = 'falta')      AS dias_falta,
                SUM(estado = 'incompleta') AS dias_incompletos,
                SUM(estado = 'permiso')    AS dias_permiso,
                SUM(minutos_tardanza)      AS total_min_tardanza,
                SUM(horas_trabajadas)      AS total_horas,
                SUM(horas_extra)           AS total_extra")
            ->whereBetween('fecha', [$this->desde, $this->hasta])
            ->when($this->empleadoId, fn ($q) => $q->where('empleado_id', $this->empleadoId))
            ->groupBy('empleado_id')
            ->with('empleado:id,nombres,apellidos,codigo_biometrico')
            ->get()
            ->sortBy(fn ($fila) => $fila->empleado->apellidos)
            ->values();
    }

    public function headings(): array
    {
        return [
            'Código', 'Empleado',
            'Días puntual', 'Días tardanza', 'Días falta', 'Días sin salida', 'Días permiso',
            'Min. tardanza acum.', 'Horas trabajadas', 'Horas extra',
        ];
    }

    public function map($fila): array
    {
        return [
            $fila->empleado->codigo_biometrico,
            "{$fila->empleado->apellidos}, {$fila->empleado->nombres}",
            (int) $fila->dias_puntuales,
            (int) $fila->dias_tardanza,
            (int) $fila->dias_falta,
            (int) $fila->dias_incompletos,
            (int) $fila->dias_permiso,
            (int) $fila->total_min_tardanza,
            (float) $fila->total_horas,
            (float) $fila->total_extra,
        ];
    }
}
