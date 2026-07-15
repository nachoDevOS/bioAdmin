<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Empleados de la empresa.
 *
 * Campo clave: codigo_biometrico = el "ID de usuario" dentro del equipo
 * ZKTeco. Cuando el equipo entrega una marcación, viene con ese código;
 * así sabremos a qué empleado pertenece cada huella.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('empleados', function (Blueprint $table) {
            $table->id();

            // Código con el que el empleado marca en el biométrico. Único:
            // dos empleados no pueden compartirlo o las marcaciones se mezclarían.
            $table->string('codigo_biometrico', 24)->unique();

            $table->string('nombres');
            $table->string('apellidos');
            $table->string('documento', 20)->nullable()->unique();
            $table->string('correo')->nullable();
            $table->string('telefono', 20)->nullable();

            // nullOnDelete: si se borra el departamento, el empleado NO se
            // borra; solo queda "sin departamento". Nunca perder personas
            // por limpiar la organización.
            $table->foreignId('departamento_id')->nullable()
                ->constrained('departamentos')->nullOnDelete();
            $table->foreignId('cargo_id')->nullable()
                ->constrained('cargos')->nullOnDelete();

            $table->date('fecha_ingreso')->nullable();

            // Inactivo = ya no trabaja aquí, pero conservamos su historial
            // de asistencia. Por eso nunca se borra: se desactiva.
            $table->boolean('activo')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('empleados');
    }
};
