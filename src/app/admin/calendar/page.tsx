import { db } from "@/lib/db";
import { Plus, Calendar as CalendarIcon, Edit } from "lucide-react";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function AdminCalendarPage() {
  const events = await db.calendarEvent.findMany({ orderBy: { date: 'asc' } });

  return (
    <div className="space-y-6">
      <div className="admin-header">
        <div>
          <h2 className="admin-title">Calendario Académico</h2>
          <p className="admin-subtitle">
            Gestiona fechas de exámenes, inscripciones y eventos. Ver{" "}
            <Link href="/calendar" target="_blank" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'underline' }}>
              /calendar
            </Link>.
          </p>
        </div>
        <Link href="/admin/calendar/new" className="btn-primary" style={{ textDecoration: 'none' }}>
          <Plus size={18} />
          <span>Nuevo Evento</span>
        </Link>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Evento</th>
              <th>Descripción</th>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Periodo</th>
              <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '8px', 
                      background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#64748b'
                    }}>
                      <CalendarIcon size={16} />
                    </div>
                    <span style={{ fontWeight: 700 }}>{(event.title as any)?.es || 'Sin título'}</span>
                  </div>
                </td>
                <td>
                  <p style={{ 
                    margin: 0, fontSize: '0.8rem', color: '#64748b', 
                    maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' 
                  }}>
                    {(event.description as any)?.es || '-'}
                  </p>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>
                    {new Date(event.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </td>
                <td>
                  <span style={{ 
                    padding: '0.25rem 0.6rem', 
                    borderRadius: '8px', 
                    fontSize: '10px', 
                    fontWeight: 900, 
                    textTransform: 'uppercase',
                    background: event.type === 'exam' ? '#fff1f2' : event.type === 'class' ? '#eff6ff' : event.type === 'admin' ? '#fffbeb' : '#f1f5f9',
                    color: event.type === 'exam' ? '#be123c' : event.type === 'class' ? '#1d4ed8' : event.type === 'admin' ? '#b45309' : '#475569',
                    border: `1px solid ${event.type === 'exam' ? '#fecdd3' : event.type === 'class' ? '#bfdbfe' : event.type === 'admin' ? '#fde68a' : '#e2e8f0'}`
                  }}>
                    {event.type}
                  </span>
                </td>
                <td style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{event.period || '-'}</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem', paddingRight: '0.5rem' }}>
                    <Link 
                      href={`/admin/calendar/${event.id}`} 
                      style={{ 
                        width: '36px', height: '36px', borderRadius: '50%', background: 'white', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#64748b', border: '1px solid #e2e8f0', transition: 'all 0.2s'
                      }}
                      className="edit-btn-hover"
                    >
                      <Edit size={16} />
                    </Link>
                    <DeleteButton id={event.id} type="event" />
                  </div>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                  No hay eventos programados en el calendario académico.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
