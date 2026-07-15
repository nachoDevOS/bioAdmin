<?php

namespace App\Http\Controllers;

use App\Models\Marcacion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Módulo Marcaciones: consulta del registro crudo que recolecta
 * el puente. SOLO LECTURA: nadie crea ni edita marcaciones a mano
 * (eso destruiría la confianza en el control de asistencia).
 */
class MarcacionController extends Controller
{
    public function index(Request $request): Response
    {
        $busqueda = $request->string('buscar')->toString();
        $fecha = $request->string('fecha')->toString(); // formato AAAA-MM-DD

        $marcaciones = Marcacion::query()
            ->with(['empleado:id,nombres,apellidos', 'dispositivo:id,nombre'])
            ->when($busqueda, function ($query) use ($busqueda) {
                $query->where(function ($q) use ($busqueda) {
                    // Busca por código o por nombre/apellido del empleado
                    $q->where('codigo_biometrico', 'like', "%{$busqueda}%")
                        ->orWhereHas('empleado', function ($sub) use ($busqueda) {
                            $sub->where('nombres', 'like', "%{$busqueda}%")
                                ->orWhere('apellidos', 'like', "%{$busqueda}%");
                        });
                });
            })
            ->when($fecha, fn ($q) => $q->whereDate('marcado_en', $fecha))
            ->orderByDesc('marcado_en')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Marcaciones/Index', [
            'marcaciones' => $marcaciones,
            'filtros' => ['buscar' => $busqueda, 'fecha' => $fecha],
        ]);
    }
}
