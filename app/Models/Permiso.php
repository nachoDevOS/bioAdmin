<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Un empleado dentro de un lote de permisos.
 * Sin auditoría propia: lo auditable es el LOTE.
 */
class Permiso extends Model
{
    protected $table = 'permisos';

    protected $fillable = ['lote_permiso_id', 'empleado_id'];

    public function lote(): BelongsTo
    {
        return $this->belongsTo(LotePermiso::class, 'lote_permiso_id');
    }

    public function empleado(): BelongsTo
    {
        return $this->belongsTo(Empleado::class);
    }
}
