<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Equipos biométricos ZKTeco registrados en el sistema.
 * El puente Python leerá esta lista (vía API, Fase 3) para saber
 * a qué equipos conectarse cada 5 minutos.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dispositivos', function (Blueprint $table) {
            $table->id();

            $table->string('nombre');                    // ej. "Puerta principal"
            $table->string('ip', 45);                    // 45 = soporta IPv6 por si acaso
            $table->unsignedInteger('puerto')->default(4370);

            // Comm Key del equipo (0 = sin clave, valor de fábrica)
            $table->unsignedInteger('clave_comunicacion')->default(0);

            $table->string('numero_serie')->nullable();  // se llena al conectar
            $table->string('ubicacion')->nullable();     // ej. "Planta 2, RRHH"

            // Inactivo = el puente lo ignora (equipo en mantenimiento, retirado...)
            $table->boolean('activo')->default(true);

            // Última vez que el puente logró comunicarse. Sirve para mostrar
            // en el panel si un equipo está "en línea" o lleva horas caído.
            $table->timestamp('ultima_conexion')->nullable();

            $table->text('notas')->nullable();
            $table->timestamps();

            // Una misma IP:puerto no puede registrarse dos veces
            $table->unique(['ip', 'puerto']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dispositivos');
    }
};
