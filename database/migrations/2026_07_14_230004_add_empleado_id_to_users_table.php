<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Vincula un usuario del panel con un empleado (para el PORTAL):
 * el empleado entra con su usuario y ve SU asistencia, SUS permisos
 * y SUS marcaciones. Un usuario sin vínculo no ve el portal.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('empleado_id')->nullable()
                ->after('email')
                ->constrained('empleados')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('empleado_id');
        });
    }
};
