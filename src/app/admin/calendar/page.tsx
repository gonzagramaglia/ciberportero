import { db } from "@/lib/db";
import { Plus, Calendar as CalendarIcon, Trash2 } from "lucide-react";

export default async function AdminCalendarPage() {
  const events = await db.calendarEvent.findMany({ orderBy: { date: 'asc' } });

  return (
    <div className="space-y-6">
      <div className="admin-header">
        <div>
          <h2 className="admin-title">Calendario Académico</h2>
          <p className="admin-subtitle">Gestiona fechas de exámenes, inscripciones y eventos.</p>
        </div>
        <button className="btn-primary">
          <Plus size={18} />
          <span>Nuevo Evento</span>
        </button>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Evento</th>
              <th>Descripción (ES)</th>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Periodo</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td style={{ fontWeight: 600 }}>{(event.title as any)?.es || 'Sin título'}</td>
                <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{(event.description as any)?.es || '-'}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CalendarIcon size={14} />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                </td>
                <td>
                  <span style={{ 
                    padding: '0.2rem 0.5rem', 
                    borderRadius: '6px', 
                    fontSize: '10px', 
                    fontWeight: 800, 
                    textTransform: 'uppercase',
                    background: event.type === 'exam' ? '#ffe4e6' : event.type === 'class' ? '#dbeafe' : '#f1f5f9',
                    color: event.type === 'exam' ? '#9f1239' : event.type === 'class' ? '#1e40af' : '#475569'
                  }}>
                    {event.type}
                  </span>
                </td>
                <td>{event.period || '-'}</td>
                <td style={{ textAlign: 'right' }}>
                  <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>No hay eventos programados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
