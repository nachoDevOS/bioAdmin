<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Departamento extends Model
{
    use LogsActivity;

    // Nombre de la tabla explícito: Laravel intenta adivinar el plural
    // en inglés y con palabras en español puede equivocarse.
    protected $table = 'departamentos';

    protected $fillable = ['nombre', 'descripcion'];

    /** Un departamento tiene muchos empleados. */
    public function empleados(): HasMany
    {
        return $this->hasMany(Empleado::class);
    }

    /** Auditoría: registrar cambios de este modelo en la bitácora. */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()      // registra los campos de $fillable
            ->logOnlyDirty()     // solo los que realmente cambiaron
            ->useLogName('organizacion');
    }
}
