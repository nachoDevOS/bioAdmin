<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

/**
 * Módulo Auditoría (bitácora).
 * Solo lectura: muestra quién hizo qué y cuándo. Los registros los
 * crea automáticamente el trait LogsActivity de cada modelo.
 */
class AuditoriaController extends Controller
{
    public function index(): Response
    {
        $registros = Activity::query()
            ->with('causer:id,name')   // el usuario que hizo el cambio
            ->latest()
            ->paginate(20)
            // through(): transforma cada registro a un formato simple
            // para React, SIN romper la estructura de paginación.
            ->through(fn (Activity $actividad) => [
                'id' => $actividad->id,
                'fecha' => $actividad->created_at->format('d/m/Y H:i:s'),
                'usuario' => $actividad->causer?->name ?? 'Sistema',
                'modulo' => $actividad->log_name,
                'evento' => $this->traducirEvento($actividad->event),
                // Valores antes/después del cambio, para ver el detalle
                'cambios' => $actividad->properties,
            ]);

        return Inertia::render('Auditoria/Index', [
            'registros' => $registros,
        ]);
    }

    private function traducirEvento(?string $evento): string
    {
        return match ($evento) {
            'created' => 'Creación',
            'updated' => 'Modificación',
            'deleted' => 'Eliminación',
            default => $evento ?? '—',
        };
    }
}
