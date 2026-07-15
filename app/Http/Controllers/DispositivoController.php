<?php

namespace App\Http\Controllers;

use App\Models\Dispositivo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Módulo Dispositivos: administración de los equipos ZKTeco.
 *
 * Estructura estándar que repiten TODOS los módulos del sistema:
 *   index()   → lista con búsqueda y paginación
 *   create()  → muestra el formulario vacío
 *   store()   → guarda el registro nuevo
 *   edit()    → muestra el formulario con datos existentes
 *   update()  → guarda los cambios
 *   destroy() → elimina
 * Entendido uno, entendidos todos.
 */
class DispositivoController extends Controller
{
    public function index(Request $request): Response
    {
        $busqueda = $request->string('buscar')->toString();

        $dispositivos = Dispositivo::query()
            // when(): aplica el filtro SOLO si hay texto de búsqueda
            ->when($busqueda, function ($query) use ($busqueda) {
                $query->where(function ($q) use ($busqueda) {
                    $q->where('nombre', 'like', "%{$busqueda}%")
                        ->orWhere('ip', 'like', "%{$busqueda}%")
                        ->orWhere('ubicacion', 'like', "%{$busqueda}%");
                });
            })
            ->orderBy('nombre')
            ->paginate(10)
            // conserva ?buscar=... al cambiar de página
            ->withQueryString();

        return Inertia::render('Dispositivos/Index', [
            'dispositivos' => $dispositivos,
            'filtros' => ['buscar' => $busqueda],
        ]);
    }

    public function create(): Response
    {
        // Mismo formulario para crear y editar; "dispositivo: null" le dice
        // a React que es un registro nuevo.
        return Inertia::render('Dispositivos/Formulario', [
            'dispositivo' => null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $datos = $this->validar($request);

        Dispositivo::create($datos);

        return redirect('/dispositivos')
            ->with('exito', 'Dispositivo registrado correctamente.');
    }

    public function edit(Dispositivo $dispositivo): Response
    {
        return Inertia::render('Dispositivos/Formulario', [
            'dispositivo' => $dispositivo,
        ]);
    }

    public function update(Request $request, Dispositivo $dispositivo): RedirectResponse
    {
        $datos = $this->validar($request, $dispositivo);

        $dispositivo->update($datos);

        return redirect('/dispositivos')
            ->with('exito', 'Dispositivo actualizado correctamente.');
    }

    public function destroy(Dispositivo $dispositivo): RedirectResponse
    {
        $dispositivo->delete();

        return redirect('/dispositivos')
            ->with('exito', 'Dispositivo eliminado.');
    }

    /**
     * Prueba de conexión EN VIVO con el equipo.
     *
     * Laravel no habla el protocolo ZKTeco: le pide el favor al puente
     * Python (FastAPI) y este intenta conectarse al equipo. El resultado
     * vuelve como mensaje flash (verde si respondió, rojo si no).
     */
    public function probar(Dispositivo $dispositivo): RedirectResponse
    {
        try {
            // timeout(25): el puente a su vez espera hasta ~15s al equipo;
            // le damos margen para que responda antes de rendirnos.
            $respuesta = Http::timeout(25)
                ->post(config('services.puente.url').'/probar-conexion', [
                    'ip' => $dispositivo->ip,
                    'puerto' => $dispositivo->puerto,
                    'clave' => $dispositivo->clave_comunicacion,
                ]);
        } catch (\Illuminate\Http\Client\ConnectionException) {
            // El PUENTE no respondió (no confundir con el equipo)
            return back()->with(
                'error',
                'El servicio puente no está corriendo. Inícialo con iniciar_puente.bat '
                .'(carpeta puente) y vuelve a intentar.',
            );
        }

        $datos = $respuesta->json();

        if (! $respuesta->ok() || ! ($datos['ok'] ?? false)) {
            return back()->with(
                'error',
                'El equipo no respondió: '.($datos['error'] ?? 'error desconocido')
                .'. Verifica IP, red y que el equipo esté encendido.',
            );
        }

        // Éxito: guardar lo aprendido del equipo (sin ensuciar auditoría)
        $dispositivo->ultima_conexion = now();
        $dispositivo->numero_serie = $datos['numero_serie'] ?? $dispositivo->numero_serie;
        $dispositivo->saveQuietly();

        return back()->with(
            'exito',
            "Conexión exitosa con «{$dispositivo->nombre}»: "
            ."{$datos['nombre_equipo']} · serie {$datos['numero_serie']} · "
            ."{$datos['usuarios']} usuarios · {$datos['marcaciones']} marcaciones en memoria.",
        );
    }

    /**
     * Reglas de validación compartidas por store() y update().
     * $existente se pasa al editar, para que la regla "IP única"
     * no choque con el propio registro que se está editando.
     */
    private function validar(Request $request, ?Dispositivo $existente = null): array
    {
        return $request->validate([
            'nombre' => ['required', 'string', 'max:100'],
            'ip' => [
                'required',
                'ip',
                Rule::unique('dispositivos', 'ip')->ignore($existente?->id),
            ],
            'puerto' => ['required', 'integer', 'between:1,65535'],
            'clave_comunicacion' => ['required', 'integer', 'min:0'],
            'ubicacion' => ['nullable', 'string', 'max:150'],
            'activo' => ['boolean'],
            'notas' => ['nullable', 'string', 'max:1000'],
        ], [
            'nombre.required' => 'El nombre es obligatorio.',
            'ip.required' => 'La dirección IP es obligatoria.',
            'ip.ip' => 'La dirección IP no es válida (ej. 192.168.1.201).',
            'ip.unique' => 'Ya existe un dispositivo registrado con esa IP.',
            'puerto.between' => 'El puerto debe estar entre 1 y 65535.',
        ]);
    }
}
