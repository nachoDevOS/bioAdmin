<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Marcación cruda de un equipo biométrico.
 * SIN LogsActivity a propósito: pueden llegar miles al día y
 * llenarían la bitácora de auditoría de ruido inútil.
 */
class Marcacion extends Model
{
    protected $table = 'marcaciones';

    protected $fillable = [
        'dispositivo_id',
        'codigo_biometrico',
        'empleado_id',
        'marcado_en',
        'punch',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'marcado_en' => 'datetime',
        ];
    }

    public function dispositivo(): BelongsTo
    {
        return $this->belongsTo(Dispositivo::class);
    }

    public function empleado(): BelongsTo
    {
        return $this->belongsTo(Empleado::class);
    }
}
