<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Catálogo de tipos de permiso: Vacaciones, Descanso médico,
 * Licencia sin goce, Comisión de servicio, etc.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tipos_permiso', function (Blueprint $table) {
            $table->id();
            $table->string('nombre')->unique();
            // Color para pintarlo en el calendario (formato #rrggbb)
            $table->string('color', 7)->default('#3b82f6');
            // ¿Se paga? (útil para reportes de planilla)
            $table->boolean('remunerado')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tipos_permiso');
    }
};
