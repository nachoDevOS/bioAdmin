<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dispositivo;
use App\Models\Empleado;
use App\Models\Marcacion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * API que consume el puente Python (servicio FastAPI).
 * Protegida con token Sanctum: solo el puente puede llamarla.
 *
 * Flujo cada 5 minutos:
 *   1. El puente pide GET /api/puente/dispositivos  → a qué equipos conectarse
 *   2. Se conecta a cada equipo, lee sus marcaciones
 *   3. Las envía en lote a POST /api/puente/marcaciones
 *   4. Reporta que el equipo respondió con POST .../latido
 */
class PuenteController extends Controller
{
    /**
     * Lista de equipos ACTIVOS que el puente debe consultar.
     */
    public function dispositivos(): JsonResponse
    {
        $dispositivos = Dispositivo::where('activo', true)
            ->get(['id', 'nombre', 'ip', 'puerto', 'clave_comunicacion']);

        return response()->json(['dispositivos' => $dispositivos]);
    }

    /**
     * Recibe un lote de marcaciones de UN dispositivo.
     *
     * Es IDEMPOTENTE: el puente puede reenviar el mismo lote mil veces
     * y cada marcación se guarda una sola vez (índice único + insertOrIgnore).
     * Así, si internet se cae a mitad de un envío, el puente simplemente
     * reintenta todo sin generar duplicados.
     */
    public function guardarMarcaciones(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'dispositivo_id' => ['required', 'exists:dispositivos,id'],
            'marcaciones' => ['required', 'array', 'max:5000'],
            'marcaciones.*.codigo' => ['required', 'string', 'max:24'],
            'marcaciones.*.marcado_en' => ['required', 'date'],
            'marcaciones.*.punch' => ['nullable', 'integer', 'between:0,255'],
            'marcaciones.*.status' => ['nullable', 'integer', 'between:0,255'],
        ]);

        // Mapa código → id de empleado, UNA sola consulta para todo el lote
        // (evita mil consultas si llegan mil marcaciones).
        $codigos = collect($datos['marcaciones'])->pluck('codigo')->unique();
        $empleadosPorCodigo = Empleado::whereIn('codigo_biometrico', $codigos)
            ->pluck('id', 'codigo_biometrico');

        $ahora = now();

        // Preparamos las filas para insertarlas todas juntas
        $filas = collect($datos['marcaciones'])->map(fn ($m) => [
            'dispositivo_id' => $datos['dispositivo_id'],
            'codigo_biometrico' => $m['codigo'],
            'empleado_id' => $empleadosPorCodigo[$m['codigo']] ?? null,
            'marcado_en' => $m['marcado_en'],
            'punch' => $m['punch'] ?? null,
            'status' => $m['status'] ?? null,
            'created_at' => $ahora,
            'updated_at' => $ahora,
        ]);

        $nuevas = 0;
        // Insertar en bloques de 500 filas. insertOrIgnore respeta el
        // índice único: los duplicados se saltan sin dar error, y
        // devuelve cuántas filas SÍ eran nuevas.
        foreach ($filas->chunk(500) as $bloque) {
            $nuevas += Marcacion::insertOrIgnore($bloque->all());
        }

        // El equipo respondió: actualizar su "última conexión"
        Dispositivo::where('id', $datos['dispositivo_id'])
            ->update(['ultima_conexion' => $ahora]);

        return response()->json([
            'recibidas' => count($datos['marcaciones']),
            'nuevas' => $nuevas,
            'duplicadas' => count($datos['marcaciones']) - $nuevas,
        ]);
    }

    /**
     * "Latido" del equipo: el puente logró conectarse aunque no hubiera
     * marcaciones nuevas. Actualiza última conexión y, si el puente la
     * envía, guarda el número de serie real del equipo.
     */
    public function latido(Request $request, Dispositivo $dispositivo): JsonResponse
    {
        $datos = $request->validate([
            'numero_serie' => ['nullable', 'string', 'max:100'],
        ]);

        $dispositivo->ultima_conexion = now();
        if (! empty($datos['numero_serie'])) {
            $dispositivo->numero_serie = $datos['numero_serie'];
        }
        // saveQuietly: sin registrar en auditoría (pasaría cada 5 min;
        // sería puro ruido en la bitácora).
        $dispositivo->saveQuietly();

        return response()->json(['ok' => true]);
    }
}
