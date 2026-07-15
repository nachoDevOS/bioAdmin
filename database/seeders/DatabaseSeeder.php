<?php

namespace Database\Seeders;

use App\Models\Cargo;
use App\Models\Configuracion;
use App\Models\Departamento;
use App\Models\Dispositivo;
use App\Models\Empleado;
use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Datos iniciales del sistema: permisos, roles, usuario administrador,
 * configuración por defecto y datos de ejemplo para probar las pantallas.
 *
 * Se ejecuta con: php artisan db:seed  (o migrate:fresh --seed)
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ---------- 1. PERMISOS ----------
        // Un permiso por módulo administrable. Las rutas los exigen
        // (ver routes/web.php) y el menú React oculta lo no permitido.
        $permisos = [
            'gestionar-dispositivos',
            'gestionar-organizacion',
            'gestionar-empleados',
            'ver-marcaciones',
            'gestionar-turnos',
            'ver-asistencia',
            'gestionar-asistencia',
            'gestionar-permisos',
            'ver-reportes',
            'ver-portal',
            'gestionar-usuarios',
            'ver-auditoria',
            'gestionar-configuracion',
        ];

        foreach ($permisos as $permiso) {
            Permission::firstOrCreate(['name' => $permiso]);
        }

        // ---------- 2. ROLES ----------
        // Administrador: acceso total (syncPermissions con todos).
        $administrador = Role::firstOrCreate(['name' => 'Administrador']);
        $administrador->syncPermissions($permisos);

        // RRHH: gestiona personas, organización, turnos y asistencia.
        $rrhh = Role::firstOrCreate(['name' => 'RRHH']);
        $rrhh->syncPermissions([
            'gestionar-organizacion',
            'gestionar-empleados',
            'ver-marcaciones',
            'gestionar-turnos',
            'ver-asistencia',
            'gestionar-asistencia',
            'gestionar-permisos',
            'ver-reportes',
        ]);

        // Supervisor: consulta marcaciones, asistencia y reportes.
        $supervisor = Role::firstOrCreate(['name' => 'Supervisor']);
        $supervisor->syncPermissions(['ver-marcaciones', 'ver-asistencia', 'ver-reportes']);

        // Empleado: solo su propio portal (asistencia, permisos, marcaciones).
        $rolEmpleado = Role::firstOrCreate(['name' => 'Empleado']);
        $rolEmpleado->syncPermissions(['ver-portal']);

        // ---------- 3. USUARIO ADMINISTRADOR ----------
        $admin = User::firstOrCreate(
            ['email' => 'admin@bioadmin.test'],
            [
                'name' => 'Administrador',
                'password' => 'admin1234', // el modelo la cifra automáticamente
            ],
        );
        $admin->syncRoles(['Administrador']);

        // ---------- 4. CONFIGURACIÓN POR DEFECTO ----------
        $configuraciones = [
            'nombre_empresa' => 'Mi Empresa',
            'zona_horaria' => 'America/Lima',
            'tolerancia_entrada_minutos' => '5',
            'correo_notificaciones' => '',
        ];

        foreach ($configuraciones as $clave => $valor) {
            Configuracion::firstOrCreate(['clave' => $clave], ['valor' => $valor]);
        }

        // ---------- 5. DATOS DE EJEMPLO ----------
        // Para que las pantallas no nazcan vacías. Puedes editarlos o
        // borrarlos desde el propio panel.
        $administracion = Departamento::firstOrCreate(
            ['nombre' => 'Administración'],
            ['descripcion' => 'Área administrativa y contable'],
        );
        $operaciones = Departamento::firstOrCreate(
            ['nombre' => 'Operaciones'],
            ['descripcion' => 'Área operativa / producción'],
        );

        $asistente = Cargo::firstOrCreate(['nombre' => 'Asistente']);
        $operario = Cargo::firstOrCreate(['nombre' => 'Operario']);
        Cargo::firstOrCreate(['nombre' => 'Supervisor de área']);

        Empleado::firstOrCreate(
            ['codigo_biometrico' => '1'],
            [
                'nombres' => 'María',
                'apellidos' => 'Ejemplo Quispe',
                'departamento_id' => $administracion->id,
                'cargo_id' => $asistente->id,
                'fecha_ingreso' => '2025-01-15',
            ],
        );
        Empleado::firstOrCreate(
            ['codigo_biometrico' => '2'],
            [
                'nombres' => 'Juan',
                'apellidos' => 'Ejemplo Torres',
                'departamento_id' => $operaciones->id,
                'cargo_id' => $operario->id,
                'fecha_ingreso' => '2025-03-01',
            ],
        );

        // Tipos de permiso básicos (editables desde el panel)
        $tiposPermiso = [
            ['nombre' => 'Vacaciones', 'color' => '#22c55e', 'remunerado' => true],
            ['nombre' => 'Descanso médico', 'color' => '#ef4444', 'remunerado' => true],
            ['nombre' => 'Licencia sin goce', 'color' => '#a855f7', 'remunerado' => false],
            ['nombre' => 'Comisión de servicio', 'color' => '#f59e0b', 'remunerado' => true],
        ];
        foreach ($tiposPermiso as $tipo) {
            \App\Models\TipoPermiso::firstOrCreate(['nombre' => $tipo['nombre']], $tipo);
        }

        // Turno de ejemplo + asignación a los empleados demo, para que
        // el módulo Asistencia tenga algo que calcular desde el día uno.
        $turnoOficina = \App\Models\Turno::firstOrCreate(
            ['nombre' => 'Oficina L-V 08:00-17:00'],
            [
                'tipo' => 'fijo',
                'hora_entrada' => '08:00',
                'hora_salida' => '17:00',
                'tolerancia_entrada_minutos' => 5,
                'dias_laborables' => [1, 2, 3, 4, 5], // lunes a viernes
            ],
        );

        foreach (Empleado::all() as $empleado) {
            \App\Models\AsignacionTurno::firstOrCreate(
                ['empleado_id' => $empleado->id, 'turno_id' => $turnoOficina->id],
                ['desde' => '2026-07-01', 'hasta' => null],
            );
        }

        Dispositivo::firstOrCreate(
            ['ip' => '192.168.1.201'],
            [
                'nombre' => 'Equipo principal',
                'puerto' => 4370,
                'ubicacion' => 'Entrada principal',
                'notas' => 'Equipo de ejemplo. Edita la IP con la de tu ZKTeco real.',
            ],
        );
    }
}
