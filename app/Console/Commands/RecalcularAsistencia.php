<?php

namespace App\Console\Commands;

use App\Services\MotorAsistencia;
use Carbon\Carbon;
use Illuminate\Console\Command;

/**
 * Recalcula la asistencia desde la consola (y desde el programador
 * de tareas, para que el "panel del día" se mantenga fresco solo).
 *
 * Uso:
 *   php artisan asistencia:recalcular                        → ayer y hoy
 *   php artisan asistencia:recalcular --desde=2026-07-01 --hasta=2026-07-15
 */
class RecalcularAsistencia extends Command
{
    protected $signature = 'asistencia:recalcular
                            {--desde= : Fecha inicial (AAAA-MM-DD), por defecto ayer}
                            {--hasta= : Fecha final (AAAA-MM-DD), por defecto hoy}';

    protected $description = 'Recalcula el resumen de asistencia de un rango de fechas';

    public function handle(MotorAsistencia $motor): int
    {
        $desde = $this->option('desde')
            ? Carbon::parse($this->option('desde'))
            : today()->subDay();

        $hasta = $this->option('hasta')
            ? Carbon::parse($this->option('hasta'))
            : today();

        $this->info("Recalculando del {$desde->toDateString()} al {$hasta->toDateString()}...");

        $resultado = $motor->recalcularRango($desde, $hasta);

        $this->info(
            "Listo: {$resultado['procesados']} día-empleado procesados, "
            ."{$resultado['saltados_por_cierre']} saltados por período cerrado "
            ."({$resultado['empleados']} empleados activos).",
        );

        return self::SUCCESS;
    }
}
