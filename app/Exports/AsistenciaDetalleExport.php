<?php

namespace App\Exports;

use App\Models\Asistencia;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

/**
 * Reporte DETALLADO de asistencia: una fila por empleado por día.
 */
class AsistenciaDetalleExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(
        private string $desde,
        private string $hasta,
        private ?int $empleadoId = null,
    ) {}

    public function collection(): Collection
    {
        return Asistencia::query()
            ->with(['empleado:id,nombres,apellidos,codigo_biometrico', 'turno:id,nombre'])
            ->whereBetween('fecha', [$this->desde, $this->hasta])
            ->when($this->empleadoId, fn ($q) => $q->where('empleado_id', $this->empleadoId))
            ->orderBy('fecha')
            ->orderBy('empleado_id')
            ->get();
    }

    public function headings(): array
    {
        return [
            'Fecha', 'Código', 'Empleado', 'Turno', 'Estado',
            'Entrada', 'Salida', 'Min. tardanza', 'Horas trabajadas', 'Horas extra',
        ];
    }

    /** Convierte cada Asistencia en una fila del Excel. */
    public function map($asistencia): array
    {
        return [
            $asistencia->fecha->format('d/m/Y'),
            $asistencia->empleado->codigo_biometrico,
            "{$asistencia->empleado->apellidos}, {$asistencia->empleado->nombres}",
            $asistencia->turno?->nombre ?? '—',
            Asistencia::ESTADOS[$asistencia->estado] ?? $asistencia->estado,
            $asistencia->primera_marcacion?->format('H:i:s') ?? '—',
            $asistencia->ultima_marcacion?->format('H:i:s') ?? '—',
            $asistencia->minutos_tardanza,
            (float) $asistencia->horas_trabajadas,
            (float) $asistencia->horas_extra,
        ];
    }
}
