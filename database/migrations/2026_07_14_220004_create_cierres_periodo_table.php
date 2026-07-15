<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Cierres de período (ej. la quincena o el mes ya pagado).
 * Cerrar un rango congela sus asistencias: el motor no las recalcula
 * y así los números que se usaron para pagar no cambian nunca solos.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cierres_periodo', function (Blueprint $table) {
            $table->id();
            $table->date('desde');
            $table->date('hasta');

            // Quién cerró (responsabilidad ante auditoría)
            $table->foreignId('user_id')->constrained('users');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cierres_periodo');
    }
};
