<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * Lote de permisos (la unidad que se crea y se anula).
 * CON auditoría: otorgar/anular permisos afecta la asistencia y pagos.
 */
class LotePermiso extends Model
{
    use LogsActivity;

    protected $table = 'lotes_permiso';

    protected $fillable = [
        'tipo_permiso_id',
        'desde',
        'hasta',
        'motivo',
        'user_id',
        'anulado_en',
        'anulado_por_id',
    ];

    protected function casts(): array
    {
        return [
            'desde' => 'date',
            'hasta' => 'date',
            'anulado_en' => 'datetime',
        ];
    }

    public function tipo(): BelongsTo
    {
        return $this->belongsTo(TipoPermiso::class, 'tipo_permiso_id');
    }

    public function permisos(): HasMany
    {
        return $this->hasMany(Permiso::class, 'lote_permiso_id');
    }

    public function creador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function anuladoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'anulado_por_id');
    }

    /** ¿El lote sigue teniendo efecto? */
    public function getVigenteAttribute(): bool
    {
        return $this->anulado_en === null;
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()->logOnlyDirty()->useLogName('permisos');
    }
}
