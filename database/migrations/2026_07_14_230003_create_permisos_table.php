<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Un permiso = un empleado dentro de un lote.
 * Las fechas, el tipo y el motivo viven en el LOTE (así, corregir
 * el lote corrige a todos, y anular el lote anula a todos).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permisos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('lote_permiso_id')
                ->constrained('lotes_permiso')->cascadeOnDelete();

            $table->foreignId('empleado_id')
                ->constrained('empleados')->cascadeOnDelete();

            $table->timestamps();

            // Un empleado no puede estar dos veces en el mismo lote
            $table->unique(['lote_permiso_id', 'empleado_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permisos');
    }
};
