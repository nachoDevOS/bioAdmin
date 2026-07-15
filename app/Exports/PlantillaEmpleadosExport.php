<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;

/**
 * Genera la plantilla Excel que el usuario descarga, llena y
 * vuelve a subir. Los encabezados deben coincidir EXACTAMENTE
 * con lo que espera EmpleadosImport (no cambiar unos sin los otros).
 */
class PlantillaEmpleadosExport implements FromArray, WithHeadings
{
    public function headings(): array
    {
        return [
            'codigo_biometrico',
            'nombres',
            'apellidos',
            'documento',
            'correo',
            'telefono',
            'departamento',
            'cargo',
            'fecha_ingreso',
        ];
    }

    /** Una fila de ejemplo para que se entienda el formato. */
    public function array(): array
    {
        return [
            [
                '100',
                'Ana',
                'Modelo Pérez',
                '12345678',
                'ana@empresa.com',
                '999888777',
                'Ventas',
                'Vendedor',
                '2025-06-01',
            ],
        ];
    }
}
