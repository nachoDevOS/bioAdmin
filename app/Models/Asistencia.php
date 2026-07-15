<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Resumen diario producido por el motor de asistencia.
 * SIN LogsActivity: lo escribe el motor a cada recálculo, llenaría
 * la auditoría de ruido. Lo auditable es el CIERRE de período.
 */
class Asistencia extends Model
{
    protected $table = 'asistencias';

    /** Estados posibles y su significado (para pantallas y reportes). */
    public const ESTADOS = [
        'puntual' => 'Puntual',
        'tardanza' => 'Tardanza',
        'falta' => 'Falta',
        'incompleta' => 'Sin salida',
        'permiso' => 'Permiso',
        'descanso' => 'Descanso',
        'sin_turno' => 'Sin turno',
    ];

    protected $fillable = [
        'empleado_id',
        'fecha',
        'turno_id',
        'estado',
        'primera_marcacion',
        'ultima_marcacion',
        'minutos_tardanza',
        'horas_trabajadas',
        'horas_extra',
        'observacion',
        'cerrado',
    ];

    protected function casts(): array
    {
        return [
            'fecha' => 'date',
            'primera_marcacion' => 'datetime',
            'ultima_marcacion' => 'datetime',
            'cerrado' => 'boolean',
        ];
    }

    public function empleado(): BelongsTo
    {
        return $this->belongsTo(Empleado::class);
    }

    public function turno(): BelongsTo
    {
        return $this->belongsTo(Turno::class);
    }
}
