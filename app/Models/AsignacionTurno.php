<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * Vigencia: "este empleado trabaja con este turno desde X hasta Y".
 * hasta = null → indefinido.
 */
class AsignacionTurno extends Model
{
    use LogsActivity;

    protected $table = 'asignaciones_turno';

    protected $fillable = ['empleado_id', 'turno_id', 'desde', 'hasta'];

    protected function casts(): array
    {
        return [
            'desde' => 'date',
            'hasta' => 'date',
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

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('turnos');
    }
}
