<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Configuracion extends Model
{
    use LogsActivity;

    protected $table = 'configuraciones';

    protected $fillable = ['clave', 'valor'];

    /**
     * Atajo para leer una configuración desde cualquier parte del sistema:
     *   Configuracion::valor('zona_horaria', 'America/Lima')
     */
    public static function valor(string $clave, ?string $porDefecto = null): ?string
    {
        return static::where('clave', $clave)->value('valor') ?? $porDefecto;
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('configuracion');
    }
}
