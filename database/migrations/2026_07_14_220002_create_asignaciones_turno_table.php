<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Qué turno tiene cada empleado y DESDE/HASTA cuándo (vigencias).
 *
 * Un empleado puede tener varias filas a lo largo del tiempo:
 *   ene-jun: turno mañana / jul-dic: turno noche  ← eso es un rotativo.
 * Para un día dado, el motor usa la asignación vigente más reciente.
 * hasta = NULL significa "indefinido, hasta nuevo aviso".
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asignaciones_turno', function (Blueprint $table) {
            $table->id();

            // cascade: si se elimina el empleado (no debería: se desactiva),
            // sus asignaciones no tienen sentido y se van con él.
            $table->foreignId('empleado_id')
                ->constrained('empleados')->cascadeOnDelete();

            // restrict: no se puede borrar un turno que alguien tiene asignado
            $table->foreignId('turno_id')
                ->constrained('turnos')->restrictOnDelete();

            $table->date('desde');
            $table->date('hasta')->nullable(); // null = indefinido

            $table->timestamps();

            $table->index(['empleado_id', 'desde']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asignaciones_turno');
    }
};
