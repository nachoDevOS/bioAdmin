<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Dispositivo extends Model
{
    use LogsActivity;

    protected $table = 'dispositivos';

    protected $fillable = [
        'nombre',
        'ip',
        'puerto',
        'clave_comunicacion',
        'numero_serie',
        'ubicacion',
        'activo',
        'ultima_conexion',
        'notas',
    ];

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
            'ultima_conexion' => 'datetime',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('dispositivos');
    }
}
