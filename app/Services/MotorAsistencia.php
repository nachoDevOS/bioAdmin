<?php

namespace App\Services;

use App\Models\AsignacionTurno;
use App\Models\Asistencia;
use App\Models\Empleado;
use App\Models\Marcacion;
use App\Models\Permiso;
use App\Models\Turno;
use Carbon\Carbon;

/**
 * MOTOR DE ASISTENCIA — el corazón del sistema.
 *
 * Toma las marcaciones crudas (lo que el puente recolectó) y produce
 * el resumen diario de cada empleado: puntual, tardanza, falta,
 * horas trabajadas, horas extra.
 *
 * Principios:
 *  1. Las marcaciones crudas JAMÁS se modifican; solo se leen.
 *  2. Recalcular es seguro: borra y rehace el resumen del día
 *     (idempotente, como todo en este sistema).
 *  3. Un día dentro de un período CERRADO no se toca nunca.
 */
class MotorAsistencia
{
    /**
     * Dos huellas del mismo empleado con menos de esta separación se
     * consideran UNA sola (la gente marca doble "por si acaso").
     */
    private const MINUTOS_ANTIDUPLICADO = 2;

    /**
     * Recalcula un rango de fechas para todos los empleados activos
     * (o para uno solo, si se indica). Devuelve un resumen de lo hecho.
     */
    public function recalcularRango(Carbon $desde, Carbon $hasta, ?int $empleadoId = null): array
    {
        $empleados = Empleado::where('activo', true)
            ->when($empleadoId, fn ($q) => $q->where('id', $empleadoId))
            ->get();

        $procesados = 0;
        $saltadosPorCierre = 0;

        // Recorremos día por día, del primero al último
        $fecha = $desde->copy()->startOfDay();
        while ($fecha->lte($hasta)) {
            // El futuro no se calcula: aún no pasó
            if ($fecha->isAfter(today())) {
                break;
            }

            foreach ($empleados as $empleado) {
                $this->calcularDia($empleado, $fecha)
                    ? $procesados++
                    : $saltadosPorCierre++;
            }

            $fecha->addDay();
        }

        return [
            'procesados' => $procesados,
            'saltados_por_cierre' => $saltadosPorCierre,
            'empleados' => $empleados->count(),
        ];
    }

    /**
     * Calcula (o recalcula) el día de UN empleado.
     * Devuelve false si el día está cerrado y no se tocó.
     */
    public function calcularDia(Empleado $empleado, Carbon $fecha): bool
    {
        $fecha = $fecha->copy()->startOfDay();

        // Regla de oro: los días de un período cerrado son intocables
        $existente = Asistencia::where('empleado_id', $empleado->id)
            ->whereDate('fecha', $fecha)
            ->first();

        if ($existente?->cerrado) {
            return false;
        }

        $turno = $this->turnoVigente($empleado, $fecha);
        $marcaciones = $this->marcacionesDelDia($empleado, $fecha, $turno);

        $datos = $this->evaluar($fecha, $turno, $marcaciones);

        // PERMISOS (Fase 6): si el empleado tenía un permiso vigente ese
        // día, ni la falta ni la tardanza cuentan en su contra. El estado
        // pasa a "permiso" (pero descanso y sin_turno se respetan tal cual).
        $nombrePermiso = $this->nombrePermisoVigente($empleado, $fecha);
        if ($nombrePermiso && in_array($datos['estado'], ['falta', 'tardanza', 'incompleta', 'puntual'], true)) {
            $datos['estado'] = 'permiso';
            $datos['minutos_tardanza'] = 0;
            $datos['observacion'] = "Permiso: {$nombrePermiso}";
        }

        // updateOrCreate: rehace el resumen del día sin duplicar filas
        Asistencia::updateOrCreate(
            ['empleado_id' => $empleado->id, 'fecha' => $fecha->toDateString()],
            $datos,
        );

        return true;
    }

    // ============================================================
    // PASO 1: ¿qué turno le tocaba ese día?
    // ============================================================

    private function turnoVigente(Empleado $empleado, Carbon $fecha): ?Turno
    {
        // La asignación cuya vigencia cubre la fecha. Si hay varias
        // que se superponen, gana la que empezó más recientemente.
        $asignacion = AsignacionTurno::query()
            ->where('empleado_id', $empleado->id)
            ->whereDate('desde', '<=', $fecha)
            ->where(function ($q) use ($fecha) {
                $q->whereNull('hasta')->orWhereDate('hasta', '>=', $fecha);
            })
            ->orderByDesc('desde')
            ->with('turno')
            ->first();

        return $asignacion?->turno;
    }

    /**
     * Nombre del tipo de permiso vigente ese día (null si no hay).
     * Solo cuentan los lotes NO anulados cuyo rango cubre la fecha.
     */
    private function nombrePermisoVigente(Empleado $empleado, Carbon $fecha): ?string
    {
        $permiso = Permiso::query()
            ->where('empleado_id', $empleado->id)
            ->whereHas('lote', function ($q) use ($fecha) {
                $q->whereNull('anulado_en')
                    ->whereDate('desde', '<=', $fecha)
                    ->whereDate('hasta', '>=', $fecha);
            })
            ->with('lote.tipo:id,nombre')
            ->first();

        return $permiso?->lote->tipo->nombre;
    }

    // ============================================================
    // PASO 2: las marcaciones del día (con anti-duplicados)
    // ============================================================

    /**
     * @return Carbon[] horas de marcación ordenadas y sin duplicados
     */
    private function marcacionesDelDia(Empleado $empleado, Carbon $fecha, ?Turno $turno): array
    {
        // Ventana de búsqueda:
        //  - turno normal: el día calendario completo
        //  - turno nocturno: desde las 00:00 del día hasta el mediodía
        //    del día SIGUIENTE (la salida ocurre de madrugada)
        $inicio = $fecha->copy()->startOfDay();
        $fin = ($turno && $turno->cruza_medianoche)
            ? $fecha->copy()->addDay()->setTime(12, 0)
            : $fecha->copy()->endOfDay();

        $horas = Marcacion::query()
            ->where('empleado_id', $empleado->id)
            ->whereBetween('marcado_en', [$inicio, $fin])
            ->orderBy('marcado_en')
            ->pluck('marcado_en');

        // ANTI-DUPLICADOS: descartar marcaciones pegadas a la anterior
        $limpias = [];
        foreach ($horas as $hora) {
            $ultima = end($limpias);
            if ($ultima && $hora->diffInMinutes($ultima, true) < self::MINUTOS_ANTIDUPLICADO) {
                continue; // marcó doble: se ignora la repetida
            }
            $limpias[] = $hora;
        }

        return $limpias;
    }

    // ============================================================
    // PASO 3: evaluar el día y producir el resumen
    // ============================================================

    /**
     * @param Carbon[] $marcaciones
     */
    private function evaluar(Carbon $fecha, ?Turno $turno, array $marcaciones): array
    {
        $primera = $marcaciones[0] ?? null;
        $ultima = count($marcaciones) > 1 ? end($marcaciones) : null;

        // Base del resumen; cada caso de abajo la completa
        $datos = [
            'turno_id' => $turno?->id,
            'estado' => 'sin_turno',
            'primera_marcacion' => $primera,
            'ultima_marcacion' => $ultima ?? $primera,
            'minutos_tardanza' => 0,
            'horas_trabajadas' => 0,
            'horas_extra' => 0,
            'observacion' => null,
        ];

        // --- Sin turno asignado: solo dejamos constancia de las huellas ---
        if (! $turno) {
            $datos['observacion'] = $primera
                ? 'Marcó sin tener turno asignado.'
                : 'Sin turno asignado.';

            return $datos;
        }

        // --- Día de descanso según el turno (ej. domingo) ---
        // isoWeekday(): 1=lunes ... 7=domingo (igual que dias_laborables)
        if (! in_array($fecha->isoWeekday(), $turno->dias_laborables ?? [], true)) {
            $datos['estado'] = 'descanso';
            if ($primera) {
                $datos['observacion'] = 'Marcó en su día de descanso.';
                // Trabajó en descanso: todo cuenta como horas extra
                if ($ultima) {
                    $horas = round($primera->diffInMinutes($ultima, true) / 60, 2);
                    $datos['horas_trabajadas'] = $horas;
                    $datos['horas_extra'] = $horas;
                }
            }

            return $datos;
        }

        // --- Día laborable sin ninguna marcación: FALTA ---
        if (! $primera) {
            $datos['estado'] = 'falta';

            return $datos;
        }

        // Horarios programados del día, como fechas completas
        $entradaProgramada = $fecha->copy()->setTimeFromTimeString($turno->hora_entrada);
        $salidaProgramada = $fecha->copy()->setTimeFromTimeString($turno->hora_salida);
        if ($turno->cruza_medianoche) {
            $salidaProgramada->addDay(); // nocturno: se sale al día siguiente
        }

        // --- Tardanza: llegó después de la hora + tolerancia ---
        $minutosTarde = $primera->gt($entradaProgramada)
            ? (int) round($entradaProgramada->diffInMinutes($primera, true))
            : 0;

        if ($minutosTarde > $turno->tolerancia_entrada_minutos) {
            $datos['estado'] = 'tardanza';
            $datos['minutos_tardanza'] = $minutosTarde;
        } else {
            $datos['estado'] = 'puntual';
        }

        // --- Solo una marcación: entró pero no registró salida ---
        if (! $ultima) {
            $datos['estado'] = 'incompleta';
            $datos['observacion'] = 'Solo registró una marcación (falta la salida).';

            return $datos;
        }

        // --- Horas trabajadas ---
        if ($turno->tipo === 'partido' && count($marcaciones) >= 4) {
            // Turno partido con las 4 marcas: bloque mañana + bloque tarde
            // (la pausa del medio no cuenta como trabajo)
            $bloque1 = $marcaciones[0]->diffInMinutes($marcaciones[1], true);
            $bloque2 = $marcaciones[count($marcaciones) - 2]
                ->diffInMinutes(end($marcaciones), true);
            $minutosTrabajados = $bloque1 + $bloque2;
        } else {
            // Caso general: de la primera a la última marcación
            $minutosTrabajados = $primera->diffInMinutes($ultima, true);
        }
        $datos['horas_trabajadas'] = round($minutosTrabajados / 60, 2);

        // --- Horas extra: lo trabajado DESPUÉS de la salida programada ---
        if ($ultima->gt($salidaProgramada)) {
            $datos['horas_extra'] = round(
                $salidaProgramada->diffInMinutes($ultima, true) / 60,
                2,
            );
        }

        return $datos;
    }
}
