<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class TipoPermiso extends Model
{
    use LogsActivity;

    protected $table = 'tipos_permiso';

    protected $fillable = ['nombre', 'color', 'remunerado'];

    protected function casts(): array
    {
        return ['remunerado' => 'boolean'];
    }

    public function lotes(): HasMany
    {
        return $this->hasMany(LotePermiso::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()->logOnlyDirty()->useLogName('permisos');
    }
}
