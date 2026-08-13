'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar as CalendarIcon, Edit, Search } from 'lucide-react';
import { DeleteButton } from './DeleteButton';

interface LocalizedText {
  es?: string;
  en?: string;
}

interface Event {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  type: string;
  startDate: string | Date;
  endDate?: string | Date;
  period?: string;
}

interface Props {
  events: Event[];
}

export default function AdminCalendarList({ events }: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  // The events are passed ordered by startDate 'desc' from the server (mas recientes a mas antiguos)
  // We just filter them by search query
  const filteredEvents = events.filter(event => {
    if (!searchQuery) return true;
    const title = event.title?.es?.toLowerCase() || '';
    const desc = event.description?.es?.toLowerCase() || '';
    const type = event.type?.toLowerCase() || '';
    const q = searchQuery.toLowerCase();
    return title.includes(q) || desc.includes(q) || type.includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="admin-card" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #e2e8f0' }}>
        <Search size={20} color="#64748b" />
        <input 
          type="text" 
          placeholder="Buscar eventos por título, descripción o tipo..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '1rem', fontWeight: 600, outline: 'none', color: '#0f172a' }}
        />
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
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: '#64748b', fontWeight: 500 }}>
                  No se encontraron eventos.
                </td>
              </tr>
            ) : (
              filteredEvents.map((event) => (
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
                              {event.title?.es || 'Sin título'}
                            </span>
                          </Link>
                        );
                      })()}
                    </div>
                  </td>
                  <td style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>
                    {event.description?.es || '-'}
                  </td>
                  <td>
                    <span style={{ fontWeight: 900, color: '#0f172a', whiteSpace: 'nowrap' }}>
                      {new Date(event.startDate).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', timeZone: 'UTC' })}
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
