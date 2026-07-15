<?php

namespace App\Http\Controllers;

use App\Exports\PlantillaEmpleadosExport;
use App\Imports\EmpleadosImport;
use App\Models\Cargo;
use App\Models\Departamento;
use App\Models\Dispositivo;
use App\Models\Empleado;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;

/**
 * Módulo Empleados.
 * Mismo patrón estándar + filtro por estado (activos/inactivos).
 *
 * Pendiente para fases siguientes: importación desde Excel y
 * envío de empleados a los equipos ZKTeco (necesita el puente, Fase 3/4).
 */
class EmpleadoController extends Controller
{
    public function index(Request $request): Response
    {
        $busqueda = $request->string('buscar')->toString();
        $estado = $request->string('estado', 'todos')->toString();

        $empleados = Empleado::query()
            // with(): carga departamento y cargo en la misma consulta
            // para no hacer una consulta extra por cada fila de la tabla.
            ->with(['departamento', 'cargo'])
            ->when($busqueda, function ($query) use ($busqueda) {
                $query->where(function ($q) use ($busqueda) {
                    $q->where('nombres', 'like', "%{$busqueda}%")
                        ->orWhere('apellidos', 'like', "%{$busqueda}%")
                        ->orWhere('codigo_biometrico', 'like', "%{$busqueda}%")
                        ->orWhere('documento', 'like', "%{$busqueda}%");
                });
            })
            ->when($estado === 'activos', fn ($q) => $q->where('activo', true))
            ->when($estado === 'inactivos', fn ($q) => $q->where('activo', false))
            ->orderBy('apellidos')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Empleados/Index', [
            'empleados' => $empleados,
            'filtros' => ['buscar' => $busqueda, 'estado' => $estado],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Empleados/Formulario', [
            'empleado' => null,
            // Listas para los <select> del formulario
            'departamentos' => Departamento::orderBy('nombre')->get(['id', 'nombre']),
            'cargos' => Cargo::orderBy('nombre')->get(['id', 'nombre']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $datos = $this->validar($request);

        Empleado::create($datos);

        return redirect('/empleados')
            ->with('exito', 'Empleado registrado correctamente.');
    }

    public function edit(Empleado $empleado): Response
    {
        return Inertia::render('Empleados/Formulario', [
            'empleado' => $empleado,
            'departamentos' => Departamento::orderBy('nombre')->get(['id', 'nombre']),
            'cargos' => Cargo::orderBy('nombre')->get(['id', 'nombre']),
        ]);
    }

    public function update(Request $request, Empleado $empleado): RedirectResponse
    {
        $datos = $this->validar($request, $empleado);

        $empleado->update($datos);

        return redirect('/empleados')
            ->with('exito', 'Empleado actualizado correctamente.');
    }

    /**
     * "Eliminar" un empleado = DESACTIVARLO.
     * Nunca se borra de verdad: sus marcaciones históricas deben
     * seguir siendo consultables en reportes de períodos pasados.
     */
    public function destroy(Empleado $empleado): RedirectResponse
    {
        $empleado->update(['activo' => false]);

        return redirect('/empleados')
            ->with('exito', "Empleado {$empleado->nombre_completo} desactivado. Su historial se conserva.");
    }

    /** Reactivar a un empleado desactivado. */
    public function reactivar(Empleado $empleado): RedirectResponse
    {
        $empleado->update(['activo' => true]);

        return redirect('/empleados')
            ->with('exito', "Empleado {$empleado->nombre_completo} reactivado.");
    }

    // ============================================================
    // IMPORTACIÓN DESDE EXCEL
    // ============================================================

    /** Pantalla de importación (con el resultado de la última, si lo hay). */
    public function importar(): Response
    {
        return Inertia::render('Empleados/Importar', [
            // El resultado viaja en la sesión (flash) desde procesarImportacion
            'resultado' => session('resultado_importacion'),
        ]);
    }

    /** Descarga la plantilla Excel lista para llenar. */
    public function plantilla()
    {
        return Excel::download(new PlantillaEmpleadosExport, 'plantilla_empleados.xlsx');
    }

    /** Procesa el archivo subido. */
    public function procesarImportacion(Request $request): RedirectResponse
    {
        $request->validate([
            'archivo' => ['required', 'file', 'mimes:xlsx,xls', 'max:10240'], // máx 10 MB
        ], [
            'archivo.required' => 'Selecciona un archivo Excel.',
            'archivo.mimes' => 'El archivo debe ser .xlsx o .xls.',
        ]);

        $importacion = new EmpleadosImport;

        try {
            Excel::import($importacion, $request->file('archivo'));
        } catch (\Throwable $error) {
            // Archivo corrupto o formato irreconocible
            return back()->with('error', 'No se pudo leer el archivo: '.$error->getMessage());
        }

        return redirect('/empleados/importar')->with('resultado_importacion', [
            'creados' => $importacion->creados,
            'actualizados' => $importacion->actualizados,
            'errores' => $importacion->errores,
        ]);
    }

    // ============================================================
    // ENVÍO DE EMPLEADOS AL EQUIPO ZKTECO (vía puente Python)
    // ============================================================

    /** Pantalla para elegir a qué equipo enviar. */
    public function enviarFormulario(): Response
    {
        return Inertia::render('Empleados/Enviar', [
            'dispositivos' => Dispositivo::where('activo', true)
                ->orderBy('nombre')
                ->get(['id', 'nombre', 'ip', 'ubicacion']),
            'totalActivos' => Empleado::where('activo', true)->count(),
        ]);
    }

    /** Envía todos los empleados ACTIVOS al equipo elegido. */
    public function enviarAlEquipo(Request $request): RedirectResponse
    {
        $datos = $request->validate([
            'dispositivo_id' => ['required', 'exists:dispositivos,id'],
        ]);

        $dispositivo = Dispositivo::findOrFail($datos['dispositivo_id']);

        // Lo que el equipo necesita: código + nombre visible en pantalla
        $empleados = Empleado::where('activo', true)
            ->get()
            ->map(fn (Empleado $e) => [
                'codigo' => $e->codigo_biometrico,
                'nombre' => $e->nombre_completo,
            ])
            ->values();

        if ($empleados->isEmpty()) {
            return back()->with('error', 'No hay empleados activos que enviar.');
        }

        try {
            // Hasta 90s: escribir cientos de usuarios en el equipo toma tiempo
            $respuesta = Http::timeout(90)
                ->post(config('services.puente.url').'/enviar-empleados', [
                    'ip' => $dispositivo->ip,
                    'puerto' => $dispositivo->puerto,
                    'clave' => $dispositivo->clave_comunicacion,
                    'empleados' => $empleados,
                ]);
        } catch (\Illuminate\Http\Client\ConnectionException) {
            return back()->with(
                'error',
                'El servicio puente no está corriendo. Inícialo con iniciar_puente.bat y reintenta.',
            );
        }

        $resultado = $respuesta->json();

        if (! $respuesta->ok() || ! ($resultado['ok'] ?? false)) {
            return back()->with(
                'error',
                "El equipo «{$dispositivo->nombre}» no respondió: "
                .($resultado['error'] ?? 'error desconocido'),
            );
        }

        $mensaje = "{$resultado['enviados']} empleado(s) enviados a «{$dispositivo->nombre}». "
            .'Ahora solo falta registrar la huella de cada uno EN el equipo (Menú > Usuarios).';

        if (! empty($resultado['errores'])) {
            $mensaje .= ' Con errores: '.implode(' | ', array_slice($resultado['errores'], 0, 5));
        }

        return back()->with('exito', $mensaje);
    }

    private function validar(Request $request, ?Empleado $existente = null): array
    {
        return $request->validate([
            'codigo_biometrico' => [
                'required', 'string', 'max:24',
                Rule::unique('empleados', 'codigo_biometrico')->ignore($existente?->id),
            ],
            'nombres' => ['required', 'string', 'max:100'],
            'apellidos' => ['required', 'string', 'max:100'],
            'documento' => [
                'nullable', 'string', 'max:20',
                Rule::unique('empleados', 'documento')->ignore($existente?->id),
            ],
            'correo' => ['nullable', 'email', 'max:150'],
            'telefono' => ['nullable', 'string', 'max:20'],
            // exists: el id enviado debe existir de verdad en la tabla
            'departamento_id' => ['nullable', 'exists:departamentos,id'],
            'cargo_id' => ['nullable', 'exists:cargos,id'],
            'fecha_ingreso' => ['nullable', 'date'],
            'activo' => ['boolean'],
        ], [
            'codigo_biometrico.required' => 'El código biométrico es obligatorio (es el ID con el que marca en el equipo).',
            'codigo_biometrico.unique' => 'Ese código biométrico ya pertenece a otro empleado.',
            'nombres.required' => 'Los nombres son obligatorios.',
            'apellidos.required' => 'Los apellidos son obligatorios.',
            'documento.unique' => 'Ese documento ya está registrado.',
            'correo.email' => 'El correo no tiene un formato válido.',
        ]);
    }
}
