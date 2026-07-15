<?php

namespace App\Http\Controllers;

use App\Models\LotePermiso;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Calendario: muestra los permisos vigentes como eventos de color.
 * (FullCalendar en el frontend; aquí solo se preparan los eventos.)
 */
class CalendarioController extends Controller
{
    public function index(): Response
    {
        // Lotes NO anulados de una ventana amplia (3 meses atrás, 9 adelante)
        $lotes = LotePermiso::query()
            ->whereNull('anulado_en')
            ->whereDate('hasta', '>=', today()->subMonths(3))
            ->whereDate('desde', '<=', today()->addMonths(9))
            ->with(['tipo:id,nombre,color', 'permisos.empleado:id,nombres,apellidos'])
            ->get();

        // Un evento por EMPLEADO del lote, con el color del tipo
        $eventos = [];
        foreach ($lotes as $lote) {
            foreach ($lote->permisos as $permiso) {
                $eventos[] = [
                    'title' => "{$permiso->empleado->apellidos}, {$permiso->empleado->nombres}"
                        ." · {$lote->tipo->nombre}",
                    'start' => $lote->desde->toDateString(),
                    // FullCalendar excluye el día "end": sumamos 1 para
                    // que el evento cubra hasta el último día inclusive
                    'end' => $lote->hasta->copy()->addDay()->toDateString(),
                    'color' => $lote->tipo->color,
                ];
            }
        }

        return Inertia::render('Calendario/Index', [
            'eventos' => $eventos,
        ]);
    }
}
