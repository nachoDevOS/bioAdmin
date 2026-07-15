<?php

namespace App\Http\Controllers;

use App\Models\Configuracion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Módulo Configuración general del sistema.
 * Los valores viven en la tabla configuraciones (clave → valor).
 */
class ConfiguracionController extends Controller
{
    /**
     * Campos configurables. Definidos AQUÍ (no en la base de datos) para
     * que agregar uno nuevo sea añadir una línea, y la pantalla React
     * los pinte sola sin tocarla.
     */
    private const CAMPOS = [
        [
            'clave' => 'nombre_empresa',
            'etiqueta' => 'Nombre de la empresa',
            'ayuda' => 'Aparecerá en los reportes Excel y PDF.',
        ],
        [
            'clave' => 'zona_horaria',
            'etiqueta' => 'Zona horaria',
            'ayuda' => 'Ej.: America/Lima, America/Mexico_City, America/Bogota.',
        ],
        [
            'clave' => 'tolerancia_entrada_minutos',
            'etiqueta' => 'Tolerancia de entrada (minutos)',
            'ayuda' => 'Minutos de gracia antes de marcar tardanza. Los turnos podrán definir la suya propia.',
        ],
        [
            'clave' => 'correo_notificaciones',
            'etiqueta' => 'Correo para notificaciones',
            'ayuda' => 'Aquí llegarán avisos del sistema (equipos caídos, respaldos).',
        ],
    ];

    public function index(): Response
    {
        // pluck crea un objeto {clave: valor} con lo guardado en la BD
        $valores = Configuracion::pluck('valor', 'clave');

        return Inertia::render('Configuracion/Index', [
            'campos' => self::CAMPOS,
            'valores' => $valores,
        ]);
    }

    public function guardar(Request $request): RedirectResponse
    {
        $datos = $request->validate([
            'valores' => ['required', 'array'],
            'valores.*' => ['nullable', 'string', 'max:500'],
        ]);

        // Solo aceptamos claves definidas en CAMPOS: nadie puede colar
        // configuraciones inventadas manipulando la petición.
        $clavesPermitidas = array_column(self::CAMPOS, 'clave');

        foreach ($datos['valores'] as $clave => $valor) {
            if (! in_array($clave, $clavesPermitidas, true)) {
                continue;
            }

            // updateOrCreate: actualiza si la clave existe, crea si no
            Configuracion::updateOrCreate(
                ['clave' => $clave],
                ['valor' => $valor],
            );
        }

        return redirect('/configuracion')
            ->with('exito', 'Configuración guardada correctamente.');
    }
}
