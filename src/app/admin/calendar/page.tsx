import { db } from "@/lib/db";
import { Plus, Calendar as CalendarIcon, Edit } from "lucide-react";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import AdminItemNotes from "@/components/admin/AdminItemNotes";

export default async function AdminCalendarPage() {
  const events = (await db.calendarEvent.findMany({ orderBy: { startDate: 'asc' } as any })) as any[];

  return (
    <div className="space-y-6 fade-in">
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

      <div className="admin-card table-container" style={{ borderRadius: '20px' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Evento y Notas</th>
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
                <td style={{ verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div className="admin-flex-center">
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '8px', 
                        background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#64748b', flexShrink: 0
                      }}>
                        <CalendarIcon size={16} />
                      </div>
                      <span style={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{(event.title as any)?.es || 'Sin título'}</span>
                    </div>
                    <AdminItemNotes id={event.id} type="calendarEvent" initialNotes={event.adminNotes} />
                  </div>
                </td>
                <td style={{ verticalAlign: 'top', paddingTop: '1.25rem' }}>
                  <p style={{ 
                    margin: 0, fontSize: '0.8rem', color: '#64748b', 
                    maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' 
                  }}>
                    {(event.description as any)?.es || '-'}
                  </p>
                </td>
                <td style={{ verticalAlign: 'top', paddingTop: '1.25rem' }}>
                  <span style={{ fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
                    {new Date(event.startDate).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                  </span>
                </td>
                <td style={{ verticalAlign: 'top', paddingTop: '1.15rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.6rem', 
                    borderRadius: '8px', 
                    fontSize: '10px', 
                    fontWeight: 900, 
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    background: event.type === 'exam' ? '#fff1f2' : event.type === 'quiz' ? '#fffbeb' : event.type === 'class' ? '#eff6ff' : event.type === 'admin' ? '#f5f3ff' : '#f1f5f9',
                    color: event.type === 'exam' ? '#be123c' : event.type === 'quiz' ? '#b45309' : event.type === 'class' ? '#1d4ed8' : event.type === 'admin' ? '#7c3aed' : '#475569',
                    border: `1px solid ${event.type === 'exam' ? '#fecdd3' : event.type === 'quiz' ? '#fde68a' : event.type === 'class' ? '#bfdbfe' : event.type === 'admin' ? '#ddd6fe' : '#e2e8f0'}`
                  }}>
                    {event.type}
                  </span>
                </td>
                <td style={{ verticalAlign: 'top', paddingTop: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>{event.period || '-'}</td>
                <td style={{ textAlign: 'right', verticalAlign: 'top', paddingTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', paddingRight: '0.5rem' }}>
                    <Link 
                      href={`/admin/calendar/${event.id}`} 
                      style={{ 
                        width: '36px', height: '36px', borderRadius: '50%', background: 'white', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#94a3b8', border: '1px solid #e2e8f0', transition: 'all 0.2s'
                      }}
                    >
                      <Edit size={16} />
                    </Link>
                    <DeleteButton id={event.id} type="event" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
