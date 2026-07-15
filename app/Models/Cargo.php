<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Cargo extends Model
{
    use LogsActivity;

    protected $table = 'cargos';

    protected $fillable = ['nombre', 'descripcion'];

    /** Un cargo lo ocupan muchos empleados. */
    public function empleados(): HasMany
    {
        return $this->hasMany(Empleado::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('organizacion');
    }
}
