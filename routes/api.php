<?php

use App\Http\Controllers\Api\PuenteController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API para el puente Python
|--------------------------------------------------------------------------
| Todas las rutas exigen un token Sanctum válido (Authorization: Bearer ...).
| El token se genera con:  php artisan puente:token
| Las URL completas llevan el prefijo /api, ej.: /api/puente/dispositivos
*/

Route::middleware('auth:sanctum')->prefix('puente')->group(function () {
    // Equipos activos que el puente debe consultar cada 5 minutos
    Route::get('/dispositivos', [PuenteController::class, 'dispositivos']);

    // Lote de marcaciones recolectadas de un equipo
    Route::post('/marcaciones', [PuenteController::class, 'guardarMarcaciones']);

    // Aviso "el equipo respondió" (aunque no haya marcaciones nuevas)
    Route::post('/dispositivos/{dispositivo}/latido', [PuenteController::class, 'latido']);
});
