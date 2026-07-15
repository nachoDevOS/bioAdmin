<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Turno extends Model
{
    use LogsActivity;

    protected $table = 'turnos';

    protected $fillable = [
        'nombre',
        'tipo',
        'hora_entrada',
        'hora_salida',
        'hora_entrada_2',
        'hora_salida_2',
        'cruza_medianoche',
        'tolerancia_entrada_minutos',
        'dias_laborables',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            // json de la BD ↔ arreglo PHP automáticamente
            'dias_laborables' => 'array',
            'cruza_medianoche' => 'boolean',
            'activo' => 'boolean',
        ];
    }

    public function asignaciones(): HasMany
    {
        return $this->hasMany(AsignacionTurno::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('turnos');
    }
}
