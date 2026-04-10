import { db } from "@/lib/db";
import { Plus, Calendar as CalendarIcon, MapPin, Trash2, Tag } from "lucide-react";

export default async function AdminCalendarPage() {
  const events = await db.calendarEvent.findMany({ orderBy: { date: 'asc' } });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Calendario Académico</h2>
          <p className="text-slate-500 mt-2">Gestiona fechas de exámenes, inscripciones y eventos.</p>
        </div>
        <button className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors">
          <Plus size={18} />
          <span>Nuevo Evento</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Evento</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Periodo</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium text-slate-900">{(event.title as any)?.es || 'Sin título'}</td>
                <td className="p-4 text-slate-500 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarIcon size={14} />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                </td>
                <td className="p-4 text-slate-500 text-sm">
                  <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold ${
                    event.type === 'exam' ? 'bg-rose-100 text-rose-700' :
                    event.type === 'class' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {event.type}
                  </span>
                </td>
                <td className="p-4 text-slate-500 text-sm">{(event.description as any)?.es || '-'}</td>
                <td className="p-4 text-slate-500 text-sm">{event.period || '-'}</td>
                <td className="p-4 text-right">
                  <button className="text-slate-400 hover:text-rose-600 p-2 transition-colors"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-slate-400 italic">No hay eventos programados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
