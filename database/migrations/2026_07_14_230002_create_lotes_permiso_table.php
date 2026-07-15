<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Lote de permisos: UNA operación de otorgamiento.
 *
 * Un permiso individual es un lote con 1 empleado; uno grupal, con N.
 * El lote es la unidad ANULABLE: anular el lote quita el permiso a
 * todos sus empleados de una vez (y queda quién/cuándo lo anuló).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lotes_permiso', function (Blueprint $table) {
            $table->id();

            $table->foreignId('tipo_permiso_id')
                ->constrained('tipos_permiso')->restrictOnDelete();

            $table->date('desde');
            $table->date('hasta');
            $table->string('motivo')->nullable();

            // Quién otorgó el permiso
            $table->foreignId('user_id')->constrained('users');

            // Anulación: si tiene fecha, el lote NO aplica
            $table->timestamp('anulado_en')->nullable();
            $table->foreignId('anulado_por_id')->nullable()->constrained('users');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lotes_permiso');
    }
};
