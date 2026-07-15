<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Symfony\Component\Process\Process;

/**
 * Respaldo de la base de datos con mysqldump.
 *
 * Uso:     php artisan respaldo:crear
 * Salida:  storage/app/respaldos/bioadmin_AAAA-MM-DD_HHmmss.sql
 * Retiene: los últimos 14 respaldos (borra los más viejos).
 *
 * Programado a las 02:00 cada día en routes/console.php
 * (requiere php artisan schedule:work corriendo).
 */
class RespaldoBaseDatos extends Command
{
    protected $signature = 'respaldo:crear';

    protected $description = 'Crea un respaldo .sql de la base de datos y conserva los últimos 14';

    public function handle(): int
    {
        $carpeta = storage_path('app/respaldos');
        File::ensureDirectoryExists($carpeta);

        $archivo = $carpeta.'/bioadmin_'.now()->format('Y-m-d_His').'.sql';

        // mysqldump debe estar en el PATH (Laragon lo agrega). Si no,
        // define MYSQLDUMP_PATH en .env con la ruta completa al .exe
        $binario = env('MYSQLDUMP_PATH', 'mysqldump');

        $proceso = new Process([
            $binario,
            '--host='.config('database.connections.mysql.host'),
            '--port='.config('database.connections.mysql.port'),
            '--user='.config('database.connections.mysql.username'),
            '--password='.config('database.connections.mysql.password'),
            '--result-file='.$archivo,
            '--single-transaction', // respalda sin bloquear las tablas
            config('database.connections.mysql.database'),
        ]);

        $proceso->setTimeout(300);
        $proceso->run();

        if (! $proceso->isSuccessful()) {
            $this->error('El respaldo falló: '.$proceso->getErrorOutput());
            $this->warn('¿mysqldump está en el PATH? Si no, define MYSQLDUMP_PATH en el .env');

            return self::FAILURE;
        }

        $tamano = round(File::size($archivo) / 1024, 1);
        $this->info("Respaldo creado: {$archivo} ({$tamano} KB)");

        // Retención: conservar solo los 14 más recientes
        $respaldos = collect(File::files($carpeta))
            ->sortByDesc(fn ($f) => $f->getMTime())
            ->values();

        foreach ($respaldos->slice(14) as $viejo) {
            File::delete($viejo->getPathname());
            $this->line('Respaldo antiguo eliminado: '.$viejo->getFilename());
        }

        return self::SUCCESS;
    }
}
