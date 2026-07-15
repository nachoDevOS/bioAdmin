<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Resultado del MOTOR DE ASISTENCIA: una fila por empleado por día.
 *
 * Las marcaciones crudas (tabla marcaciones) nunca se tocan; el motor
 * las LEE y produce este resumen diario. Recalcular un día borra y
 * rehace su resumen — excepto si el día pertenece a un período CERRADO.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asistencias', function (Blueprint $table) {
            $table->id();

            $table->foreignId('empleado_id')
                ->constrained('empleados')->cascadeOnDelete();

            $table->date('fecha');

            // Turno con el que se evaluó ese día (null = no tenía turno)
            $table->foreignId('turno_id')->nullable()
                ->constrained('turnos')->nullOnDelete();

            // puntual | tardanza | falta | incompleta | descanso | sin_turno
            // ("permiso" se sumará en la Fase 6)
            $table->string('estado', 12);

            $table->dateTime('primera_marcacion')->nullable();
            $table->dateTime('ultima_marcacion')->nullable();

            $table->unsignedSmallInteger('minutos_tardanza')->default(0);
            $table->decimal('horas_trabajadas', 5, 2)->default(0);
            $table->decimal('horas_extra', 5, 2)->default(0);

            $table->string('observacion')->nullable();

            // true cuando el período fue cerrado: el motor ya no lo toca
            $table->boolean('cerrado')->default(false);

            $table->timestamps();

            // Un empleado solo puede tener UN resumen por día
            $table->unique(['empleado_id', 'fecha']);
            $table->index('fecha');
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asistencias');
    }
};
