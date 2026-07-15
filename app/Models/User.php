<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'password', 'empleado_id'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    // HasApiTokens: permite emitir tokens de API (Sanctum). Lo usa el
    // usuario especial "puente" para autenticar el servicio Python.
    use HasApiTokens;

    // HasRoles: le da al usuario los métodos de roles y permisos
    // (assignRole, hasPermissionTo, getRoleNames...) de spatie/laravel-permission.
    use HasRoles;

    // LogsActivity: registra automáticamente en la bitácora de auditoría
    // cada vez que se crea, edita o elimina un usuario.
    use LogsActivity;

    /**
     * Qué campos se guardan en la bitácora.
     * Solo name y email: NUNCA registrar contraseñas (ni siquiera cifradas).
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'email'])
            ->logOnlyDirty()          // solo lo que cambió
            ->useLogName('usuarios');
    }

    /** Empleado vinculado (para el portal). Puede ser null. */
    public function empleado(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Empleado::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
