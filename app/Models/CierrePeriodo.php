<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * Cierre de período: congela las asistencias de un rango de fechas.
 * CON auditoría: cerrar/reabrir un período es un acto administrativo
 * serio (afecta pagos) y debe quedar registrado quién lo hizo.
 */
class CierrePeriodo extends Model
{
    use LogsActivity;

    protected $table = 'cierres_periodo';

    protected $fillable = ['desde', 'hasta', 'user_id'];

    protected function casts(): array
    {
        return [
            'desde' => 'date',
            'hasta' => 'date',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('cierres');
    }
}
