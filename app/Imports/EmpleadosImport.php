<?php

namespace App\Imports;

use App\Models\Cargo;
use App\Models\Departamento;
use App\Models\Empleado;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use PhpOffice\PhpSpreadsheet\Shared\Date as FechaExcel;

/**
 * Importación masiva de empleados desde Excel.
 *
 * Reglas:
 *  - La fila 1 del archivo son los encabezados (usar la plantilla).
 *  - Si el código biométrico YA existe → se ACTUALIZAN sus datos.
 *  - Si no existe → se CREA el empleado.
 *  - Departamentos y cargos que no existan se crean solos (por nombre).
 *  - Una fila con error NO detiene la importación: se anota el problema
 *    (con su número de fila) y se continúa con la siguiente.
 */
class EmpleadosImport implements ToCollection, WithHeadingRow
{
    // Resultados que el controlador leerá al terminar
    public int $creados = 0;

    public int $actualizados = 0;

    /** @var string[] Errores legibles, ej. "Fila 5: falta el nombre" */
    public array $errores = [];

    public function collection(Collection $filas): void
    {
        foreach ($filas as $indice => $fila) {
            // +2 porque: los índices empiezan en 0 y la fila 1 es el encabezado
            $numeroFila = $indice + 2;

            // Fila totalmente vacía (Excel suele mandar algunas al final): saltar
            if ($fila->filter(fn ($v) => trim((string) $v) !== '')->isEmpty()) {
                continue;
            }

            $datos = [
                'codigo_biometrico' => trim((string) $fila['codigo_biometrico']),
                'nombres' => trim((string) $fila['nombres']),
                'apellidos' => trim((string) $fila['apellidos']),
                'documento' => trim((string) $fila['documento']) ?: null,
                'correo' => trim((string) $fila['correo']) ?: null,
                'telefono' => trim((string) $fila['telefono']) ?: null,
            ];

            // Validación mínima de la fila
            $validador = Validator::make($datos, [
                'codigo_biometrico' => ['required', 'max:24'],
                'nombres' => ['required', 'max:100'],
                'apellidos' => ['required', 'max:100'],
                'correo' => ['nullable', 'email'],
            ], [
                'codigo_biometrico.required' => 'falta el código biométrico',
                'nombres.required' => 'faltan los nombres',
                'apellidos.required' => 'faltan los apellidos',
                'correo.email' => 'el correo no es válido',
            ]);

            if ($validador->fails()) {
                $this->errores[] = "Fila {$numeroFila}: "
                    .implode(', ', $validador->errors()->all());
                continue;
            }

            // Departamento y cargo por NOMBRE; si no existen, se crean
            $nombreDepartamento = trim((string) $fila['departamento']);
            $datos['departamento_id'] = $nombreDepartamento
                ? Departamento::firstOrCreate(['nombre' => $nombreDepartamento])->id
                : null;

            $nombreCargo = trim((string) $fila['cargo']);
            $datos['cargo_id'] = $nombreCargo
                ? Cargo::firstOrCreate(['nombre' => $nombreCargo])->id
                : null;

            $datos['fecha_ingreso'] = $this->convertirFecha($fila['fecha_ingreso']);

            try {
                // updateOrCreate: busca por código; actualiza o crea
                $empleado = Empleado::updateOrCreate(
                    ['codigo_biometrico' => $datos['codigo_biometrico']],
                    $datos,
                );

                // wasRecentlyCreated: true solo si se acaba de insertar
                $empleado->wasRecentlyCreated
                    ? $this->creados++
                    : $this->actualizados++;
            } catch (\Illuminate\Database\QueryException) {
                // Típico: el documento ya pertenece a OTRO empleado
                $this->errores[] = "Fila {$numeroFila}: el documento "
                    ."'{$datos['documento']}' ya está registrado con otro empleado.";
            }
        }
    }

    /**
     * Excel puede entregar la fecha como número interno (45123),
     * como texto "2025-01-15" o "15/01/2025", o vacía.
     * Esta función acepta los tres casos sin reventar.
     */
    private function convertirFecha($valor): ?string
    {
        $valor = trim((string) $valor);
        if ($valor === '') {
            return null;
        }

        try {
            if (is_numeric($valor)) {
                // Número de serie interno de Excel
                return FechaExcel::excelToDateTimeObject((float) $valor)
                    ->format('Y-m-d');
            }

            // Texto: aceptar "15/01/2025" o "2025-01-15"
            if (str_contains($valor, '/')) {
                return Carbon::createFromFormat('d/m/Y', $valor)->format('Y-m-d');
            }

            return Carbon::parse($valor)->format('Y-m-d');
        } catch (\Throwable) {
            return null; // fecha ilegible: mejor sin fecha que importación caída
        }
    }
}
