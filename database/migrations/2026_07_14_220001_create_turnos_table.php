<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Turnos de trabajo (horarios).
 *
 * Tipos soportados:
 *  - fijo:     un bloque, ej. 08:00 → 17:00
 *  - partido:  dos bloques, ej. 08:00-12:00 y 14:00-18:00
 *  - nocturno: cruza la medianoche, ej. 22:00 → 06:00 del día siguiente
 *
 * Los turnos ROTATIVOS no son un tipo: se logran asignando distintos
 * turnos por rangos de fechas en asignaciones_turno (vigencias).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('turnos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre')->unique();          // ej. "Oficina L-V"
            $table->string('tipo', 10)->default('fijo'); // fijo | partido | nocturno

            $table->time('hora_entrada');
            $table->time('hora_salida');

            // Solo para tipo "partido": el segundo bloque del día
            $table->time('hora_entrada_2')->nullable();
            $table->time('hora_salida_2')->nullable();

            // true en nocturnos: la salida ocurre al día SIGUIENTE
            $table->boolean('cruza_medianoche')->default(false);

            // Minutos de gracia: llegar hasta N min tarde no cuenta tardanza
            $table->unsignedSmallInteger('tolerancia_entrada_minutos')->default(5);

            // Días que se trabaja con este turno, formato ISO:
            // 1=lunes ... 7=domingo. Ej.: [1,2,3,4,5] = lunes a viernes.
            $table->json('dias_laborables');

            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('turnos');
    }
};
