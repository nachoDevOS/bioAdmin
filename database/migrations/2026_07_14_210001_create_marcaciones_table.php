<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Marcaciones crudas recolectadas de los equipos ZKTeco.
 *
 * Esta tabla es el "registro histórico intocable": el puente inserta
 * aquí tal cual lo que el equipo entrega. El motor de asistencia
 * (Fase 5) la LEERÁ para calcular estados del día, pero nunca la modifica.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marcaciones', function (Blueprint $table) {
            $table->id();

            // Equipo del que vino la marcación. restrictOnDelete: MySQL
            // impide borrar un dispositivo que ya tiene marcaciones
            // (protege el historial; el dispositivo se desactiva, no se borra).
            $table->foreignId('dispositivo_id')
                ->constrained('dispositivos')->restrictOnDelete();

            // Código tal cual lo entrega el equipo. Se guarda SIEMPRE,
            // aunque no exista un empleado con ese código todavía.
            $table->string('codigo_biometrico', 24);

            // Empleado resuelto al momento de insertar (null si el código
            // no corresponde a ningún empleado registrado).
            $table->foreignId('empleado_id')->nullable()
                ->constrained('empleados')->nullOnDelete();

            // Fecha y hora EXACTA en que la persona marcó (hora del equipo)
            $table->dateTime('marcado_en');

            // Códigos crudos del protocolo ZKTeco (se interpretan en Fase 5):
            // punch  = tipo de marcación (entrada/salida/etc. según config del equipo)
            // status = método de verificación (huella, rostro, tarjeta, clave)
            $table->unsignedTinyInteger('punch')->nullable();
            $table->unsignedTinyInteger('status')->nullable();

            // created_at = cuándo LLEGÓ al sistema (puede ser minutos después
            // de marcado_en, porque el puente recolecta cada 5 minutos)
            $table->timestamps();

            // ANTI-DUPLICADOS: la misma persona, en el mismo equipo, en el
            // mismo segundo = un solo registro. El puente puede reenviar
            // el lote completo sin miedo: los repetidos se ignoran.
            $table->unique(
                ['dispositivo_id', 'codigo_biometrico', 'marcado_en'],
                'marcacion_unica',
            );

            // Búsquedas frecuentes: por fecha y por empleado
            $table->index('marcado_en');
            $table->index('empleado_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marcaciones');
    }
};
