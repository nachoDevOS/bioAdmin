<?php

namespace App\Http\Controllers;

use App\Models\Asistencia;
use App\Models\CierrePeriodo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Cierre de período: congela las asistencias de un rango de fechas
 * para que el recálculo no las toque (los números ya se usaron para
 * pagar). Reabrir es posible, pero queda registrado en auditoría.
 */
class CierrePeriodoController extends Controller
{
    public function index(): Response
    {
        $cierres = CierrePeriodo::query()
            ->with('usuario:id,name')
            ->orderByDesc('desde')
            ->get()
            ->map(fn (CierrePeriodo $cierre) => [
                'id' => $cierre->id,
                'desde' => $cierre->desde->format('d/m/Y'),
                'hasta' => $cierre->hasta->format('d/m/Y'),
                'usuario' => $cierre->usuario->name,
                'fecha_cierre' => $cierre->created_at->format('d/m/Y H:i'),
            ]);

        return Inertia::render('Cierres/Index', [
            'cierres' => $cierres,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $datos = $request->validate([
            'desde' => ['required', 'date'],
            'hasta' => ['required', 'date', 'after_or_equal:desde'],
        ], [
            'hasta.after_or_equal' => 'La fecha final no puede ser anterior a la inicial.',
        ]);

        // No cerrar el futuro: aún no hay nada que congelar
        if ($datos['hasta'] > today()->toDateString()) {
            return back()->with('error', 'No se puede cerrar un período que incluye fechas futuras.');
        }

        $cierre = CierrePeriodo::create([
            'desde' => $datos['desde'],
            'hasta' => $datos['hasta'],
            'user_id' => $request->user()->id,
        ]);

        // Congelar todas las asistencias del rango
        $congeladas = Asistencia::whereBetween('fecha', [$datos['desde'], $datos['hasta']])
            ->update(['cerrado' => true]);

        return redirect('/cierres')->with(
            'exito',
            "Período cerrado ({$cierre->desde->format('d/m/Y')} – {$cierre->hasta->format('d/m/Y')}). "
            ."{$congeladas} registros de asistencia quedaron congelados.",
        );
    }

    /** Reabrir un período (queda en auditoría quién lo hizo). */
    public function destroy(CierrePeriodo $cierre): RedirectResponse
    {
        // Descongelar las asistencias del rango...
        Asistencia::whereBetween('fecha', [
            $cierre->desde->toDateString(),
            $cierre->hasta->toDateString(),
        ])->update(['cerrado' => false]);

        // ...pero respetar OTROS cierres que se superpongan con este
        foreach (CierrePeriodo::where('id', '!=', $cierre->id)->get() as $otro) {
            Asistencia::whereBetween('fecha', [
                $otro->desde->toDateString(),
                $otro->hasta->toDateString(),
            ])->update(['cerrado' => true]);
        }

        $cierre->delete();

        return redirect('/cierres')->with(
            'exito',
            'Período reabierto: sus asistencias pueden recalcularse de nuevo. La reapertura quedó en auditoría.',
        );
    }
}
