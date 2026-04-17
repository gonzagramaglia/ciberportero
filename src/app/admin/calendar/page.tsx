import { db } from "@/lib/db";
import { Plus, Calendar as CalendarIcon, Edit } from "lucide-react";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { getAdminNote } from "@/lib/actions";
import AdminSectionNotes from "@/components/admin/AdminSectionNotes";
import SuccessToast from "@/components/admin/SuccessToast";
import { Suspense } from "react";

export default async function AdminCalendarPage() {
  const [events, note] = await Promise.all([
    db.calendarEvent.findMany({ orderBy: { startDate: 'asc' } as any }),
    getAdminNote('calendar')
  ]);

  return (
    <div className="space-y-12 fade-in">
      <Suspense fallback={null}>
        <SuccessToast />
      </Suspense>
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

      <div className="admin-card table-container" style={{ borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ padding: '1.5rem 2rem' }}>EVENTO</th>
              <th>DESCRIPCIÓN</th>
              <th>FECHA</th>
              <th>TIPO</th>
              <th style={{ minWidth: '150px' }}>PERIODO</th>
              <th style={{ textAlign: 'center' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td style={{ padding: '1.5rem 2rem' }}>
                  <div className="admin-flex-center">
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '12px', 
                      background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#64748b', flexShrink: 0, border: '1px solid #f1f5f9'
                    }}>
                      <CalendarIcon size={18} />
                    </div>
                    {(() => {
                      const d = new Date(event.startDate);
                      const day = d.getUTCDate().toString().padStart(2, '0');
                      const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
                      const year = d.getUTCFullYear();
                      const currentYear = new Date().getFullYear();
                      
                      const publicLink = year === currentYear 
                        ? `/calendar/${day}/${month}`
                        : `/calendar/${day}/${month}/${year}`;
                      
                      return (
                        <Link href={publicLink} target="_blank" style={{ textDecoration: 'none' }}>
                          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem', cursor: 'pointer' }} className="hover-link">
                            {(event.title as any)?.es || 'Sin título'}
                          </span>
                        </Link>
                      );
                    })()}
                  </div>
                </td>
                <td style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>
                  {(event.description as any)?.es || '-'}
                </td>
                <td>
                  <span style={{ fontWeight: 900, color: '#0f172a', whiteSpace: 'nowrap' }}>
                    {new Date(event.startDate).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                  </span>
                </td>
                <td>
                  <span style={{ 
                    padding: '0.3rem 0.6rem', 
                    borderRadius: '8px', 
                    fontSize: '10px', 
                    fontWeight: 900, 
                    textTransform: 'uppercase',
                    background: event.type === 'exam' ? '#fff1f2' : (event.type === 'quiz' || event.type === 'quiz_mandatory') ? '#fffbeb' : event.type === 'classes' ? '#eff6ff' : event.type === 'admin' ? '#f5f3ff' : '#f1f5f9',
                    color: event.type === 'exam' ? '#be123c' : (event.type === 'quiz' || event.type === 'quiz_mandatory') ? '#b45309' : event.type === 'classes' ? '#1d4ed8' : event.type === 'admin' ? '#7c3aed' : '#475569',
                    border: '1px solid currentColor',
                    opacity: 0.8
                  }}>
                    {event.type === 'exam' ? 'Examen' : 
                     (event.type === 'quiz' || event.type === 'quiz_mandatory') ? 'Autoevaluación' : 
                     event.type === 'enrollment' ? 'Tarea' :
                     event.type === 'classes' ? 'Clase' : 
                     event.type === 'admin' ? 'Administrativo' : 'Otro'}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, display: 'block', maxWidth: '200px' }}>
                    {event.period || '-'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                    <Link 
                      href={`/admin/calendar/${event.id}`} 
                      className="btn-secondary"
                      style={{ padding: '0.5rem', borderRadius: '10px', color: '#94a3b8' }}
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

      <AdminSectionNotes section="calendar" initialContent={note?.content || ''} />
    </div>
  );
}
