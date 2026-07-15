// ============================================================
// CALENDARIO — permisos del personal como eventos de color.
// Usa FullCalendar (librería externa): le pasamos el arreglo de
// eventos que preparó CalendarioController y ella dibuja el mes.
// ============================================================

import { Head } from '@inertiajs/react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import PanelLayout from '../../Layouts/PanelLayout';

// Textos del calendario en español (FullCalendar viene en inglés)
const TEXTOS_ES = {
    today: 'Hoy',
    month: 'Mes',
};

export default function Index({ eventos }) {
    // ---------- JSX ----------
    return (
        <PanelLayout titulo="Calendario de permisos">
            <Head title="Calendario" />

            <div className="bg-white rounded-xl border border-slate-200 p-4">
                {eventos.length === 0 && (
                    <p className="mb-3 text-sm text-slate-400">
                        No hay permisos vigentes para mostrar. Los que otorgues
                        aparecerán aquí con el color de su tipo.
                    </p>
                )}

                <FullCalendar
                    // Plugin de vista mensual (cuadrícula de días)
                    plugins={[dayGridPlugin]}
                    initialView="dayGridMonth"
                    // Los eventos que preparó el controlador
                    events={eventos}
                    locale="es"
                    buttonText={TEXTOS_ES}
                    firstDay={1}          // la semana empieza en lunes
                    height="auto"
                    dayMaxEventRows={4}   // máximo 4 eventos visibles por día
                    moreLinkText={(n) => `+${n} más`}
                />
            </div>
        </PanelLayout>
    );
}
