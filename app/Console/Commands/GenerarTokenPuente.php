<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

/**
 * Genera (o regenera) el token de API que el puente Python usa para
 * autenticarse contra Laravel.
 *
 * Uso:  php artisan puente:token
 *
 * El token se muestra UNA sola vez: cópialo a puente/.env
 * (variable TOKEN_PUENTE). Si se pierde, se ejecuta de nuevo el
 * comando y los tokens anteriores quedan revocados.
 */
class GenerarTokenPuente extends Command
{
    protected $signature = 'puente:token';

    protected $description = 'Genera el token de API para el puente Python (revoca los anteriores)';

    public function handle(): int
    {
        // Usuario "de servicio": no es una persona, no tiene roles del
        // panel; solo existe para que el token del puente cuelgue de él.
        $usuario = User::firstOrCreate(
            ['email' => 'puente@bioadmin.interno'],
            [
                'name' => 'Servicio Puente',
                // Contraseña aleatoria imposible de adivinar: este usuario
                // JAMÁS inicia sesión por el formulario web.
                'password' => bin2hex(random_bytes(32)),
            ],
        );

        // Revocar todos los tokens previos: solo puede existir uno vigente
        $usuario->tokens()->delete();

        $token = $usuario->createToken('puente')->plainTextToken;

        $this->info('Token generado. Cópialo a puente/.env como TOKEN_PUENTE=');
        $this->newLine();
        $this->line($token);
        $this->newLine();
        $this->warn('Se muestra solo esta vez. Los tokens anteriores quedaron revocados.');

        return self::SUCCESS;
    }
}
