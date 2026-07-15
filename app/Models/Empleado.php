<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Empleado extends Model
{
    use LogsActivity;

    protected $table = 'empleados';

    protected $fillable = [
        'codigo_biometrico',
        'nombres',
        'apellidos',
        'documento',
        'correo',
        'telefono',
        'departamento_id',
        'cargo_id',
        'fecha_ingreso',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'fecha_ingreso' => 'date',
            'activo' => 'boolean',
        ];
    }

    /** Empleado pertenece a un departamento (puede no tener). */
    public function departamento(): BelongsTo
    {
        return $this->belongsTo(Departamento::class);
    }

    /** Empleado ocupa un cargo (puede no tener). */
    public function cargo(): BelongsTo
    {
        return $this->belongsTo(Cargo::class);
    }

    /**
     * Nombre completo listo para mostrar. Se usa como $empleado->nombre_completo.
     * (Laravel convierte automáticamente getNombreCompletoAttribute en eso.)
     */
    public function getNombreCompletoAttribute(): string
    {
        return trim("{$this->nombres} {$this->apellidos}");
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('empleados');
    }
}
