<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Recalcular la asistencia de ayer y hoy cada 10 minutos, para que el
// "panel del día" se mantenga fresco sin que nadie presione Recalcular.
// Requiere tener corriendo:  php artisan schedule:work
Schedule::command('asistencia:recalcular')->everyTenMinutes();

// Respaldo diario de la base de datos a las 02:00
Schedule::command('respaldo:crear')->dailyAt('02:00');
