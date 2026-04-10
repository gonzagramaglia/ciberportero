'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Calendar as CalendarIcon, Info, Tag } from 'lucide-react';
import { upsertCalendarEvent } from '@/lib/actions';

interface CalendarEditorProps {
  event?: any;
}

export default function CalendarEditor({ event }: CalendarEditorProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  // Form state
  const [titles, setTitles] = useState({
    es: event?.title?.es || '',
    en: event?.title?.en || '',
    pt: event?.title?.pt || '',
  });
  
  const [descriptions, setDescriptions] = useState({
    es: event?.description?.es || '',
    en: event?.description?.en || '',
    pt: event?.description?.pt || '',
  });

  const [date, setDate] = useState(
    event?.date 
      ? new Date(event.date).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0]
  );
  
  const [period, setPeriod] = useState(event?.period || '');
  const [type, setType] = useState(event?.type || 'event');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      await upsertCalendarEvent({
        id: event?.id,
        title: titles,
        description: descriptions,
        date,
        period,
        type
      });
      router.push('/admin/calendar');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error al guardar el evento');
    } finally {
      setIsPending(false);
    }
  };

  const eventTypes = [
    { id: 'event', label: 'Evento General', color: '#64748b', bg: '#f1f5f9' },
    { id: 'exam', label: 'Examen / Parcial', color: '#be123c', bg: '#fff1f2' },
    { id: 'class', label: 'Clase / Inscripción', color: '#1d4ed8', bg: '#eff6ff' },
    { id: 'admin', label: 'Administrativo', color: '#b45309', bg: '#fffbeb' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="admin-header">
        <div>
          <h2 className="admin-title">{event ? 'Editar Evento' : 'Nuevo Evento'}</h2>
          <p className="admin-subtitle">Configura la fecha y los detalles del calendario.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            <X size={18} />
            <span>Cancelar</span>
          </button>
          <button type="submit" disabled={isPending} className="btn-primary">
            <Save size={18} />
            <span>{isPending ? 'Guardando...' : 'Guardar Evento'}</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '2rem' }}>
        {/* Sección: Títulos y Descripciones */}
        <section className="admin-card" style={{ padding: '2.5rem' }}>
          <div style={{ marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Información del Evento</h3>
          </div>

          <div style={{ display: 'grid', gap: '2rem' }}>
            <div className="space-y-4">
              <label className="admin-label" style={{ color: '#1a1a1a' }}>Título del Evento</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem' }}>🇦🇷</span>
                  <input className="admin-input" value={titles.es} onChange={e => setTitles({...titles, es: e.target.value})} placeholder="Final de Álgebra" style={{ paddingLeft: '3rem' }} required />
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem' }}>🇺🇸</span>
                  <input className="admin-input" value={titles.en} onChange={e => setTitles({...titles, en: e.target.value})} placeholder="Algebra Final Exam" style={{ paddingLeft: '3rem' }} />
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem' }}>🇧🇷</span>
                  <input className="admin-input" value={titles.pt} onChange={e => setTitles({...titles, pt: e.target.value})} placeholder="Final de Álgebra" style={{ paddingLeft: '3rem' }} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="admin-label" style={{ color: '#1a1a1a' }}>Descripción (Opcional)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '1rem', fontSize: '1.2rem' }}>🇦🇷</span>
                  <textarea className="admin-input" value={descriptions.es} onChange={e => setDescriptions({...descriptions, es: e.target.value})} placeholder="Detalles en español..." rows={3} style={{ paddingLeft: '3rem' }} />
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '1rem', fontSize: '1.2rem' }}>🇺🇸</span>
                  <textarea className="admin-input" value={descriptions.en} onChange={e => setDescriptions({...descriptions, en: e.target.value})} placeholder="English details..." rows={3} style={{ paddingLeft: '3rem' }} />
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '1rem', fontSize: '1.2rem' }}>🇧🇷</span>
                  <textarea className="admin-input" value={descriptions.pt} onChange={e => setDescriptions({...descriptions, pt: e.target.value})} placeholder="Detalhes em português..." rows={3} style={{ paddingLeft: '3rem' }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección: Configuración Técnica */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <section className="admin-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <CalendarIcon size={20} color="#1a1a1a" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Fecha y Periodo</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="admin-label">Fecha del Evento</label>
                <input 
                  type="date" 
                  className="admin-input" 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                  required 
                />
              </div>
              <div>
                <label className="admin-label">Periodo (Ej: 1er Cuatrimestre)</label>
                <input 
                  className="admin-input" 
                  value={period} 
                  onChange={e => setPeriod(e.target.value)} 
                  placeholder="2024 - 1er Cuatrimestre"
                />
              </div>
            </div>
          </section>

          <section className="admin-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Tag size={20} color="#1a1a1a" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Tipo de Evento</h3>
            </div>
            
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {eventTypes.map(t => (
                <div 
                  key={t.id}
                  onClick={() => setType(t.id)}
                  style={{ 
                    cursor: 'pointer',
                    padding: '1rem',
                    borderRadius: '12px',
                    background: type === t.id ? t.bg : 'white',
                    border: `2px solid ${type === t.id ? t.color : '#e2e8f0'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ 
                    width: '18px', height: '18px', borderRadius: '50%', 
                    border: `2px solid ${type === t.id ? t.color : '#cbd5e1'}`,
                    background: type === t.id ? t.color : 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {type === t.id && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }} />}
                  </div>
                  <span style={{ fontWeight: 800, color: type === t.id ? t.color : '#64748b' }}>
                    {t.label}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
