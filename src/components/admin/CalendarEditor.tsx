'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Calendar as CalendarIcon, Info, Tag, Book } from 'lucide-react';
import { upsertCalendarEvent } from '@/lib/actions';
import { translations } from '@/lib/translations';

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

  const [startDate, setStartDate] = useState(
    event?.startDate 
      ? new Date(event.startDate).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0]
  );
  
  const [endDate, setEndDate] = useState(
    event?.endDate 
      ? new Date(event.endDate).toISOString().split('T')[0] 
      : ''
  );
  
  const [period, setPeriod] = useState(event?.period || '1er cuatrimestre de 1er año');
  const [type, setType] = useState(event?.type || 'event');
  const [subjectId, setSubjectId] = useState<string | null>(event?.subjectId || null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      await upsertCalendarEvent({
        id: event?.id,
        title: titles,
        description: descriptions,
        startDate,
        endDate: endDate || null,
        period,
        type,
        subjectId
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
    { id: 'exam', label: 'Examen / Parcial', color: '#ef4444', bg: '#fef2f2' },
    { id: 'quiz_mandatory', label: 'Autoevaluación Obligatoria', color: '#f97316', bg: '#fff7ed' },
    { id: 'quiz', label: 'Autoevaluación', color: '#f59e0b', bg: '#fffbeb' },
    { id: 'enrollment', label: 'Tarea / Entrega', color: '#2563eb', bg: '#eff6ff' },
    { id: 'classes', label: 'Clase', color: '#8b5cf6', bg: '#f5f3ff' },
    { id: 'event', label: 'Otro', color: '#10b981', bg: '#ecfdf5' },
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

            <div style={{ display: 'grid', gap: '2.5rem' }}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <label className="admin-label" style={{ color: '#1a1a1a' }}>Título del Evento</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
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

              <div style={{ display: 'grid', gap: '1rem' }}>
                <label className="admin-label" style={{ color: '#1a1a1a' }}>Descripción (Opcional)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
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
              <Book size={20} color="#1a1a1a" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Materia Vinculada</h3>
            </div>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label className="admin-label">1. Seleccionar Cuatrimestre</label>
                <select 
                  className="admin-input" 
                  value={period} 
                  onChange={e => {
                    setPeriod(e.target.value);
                    setSubjectId(null);
                  }}
                  style={{ cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2rem' }}
                >
                  <option value="all">Todos los cuatrimestres</option>
                  <option value="1er cuatrimestre de 1er año">1er cuatrimestre de 1er año</option>
                  <option value="2do cuatrimestre de 1er año">2do cuatrimestre de 1er año</option>
                  <option value="1er cuatrimestre de 2do año">1er cuatrimestre de 2do año</option>
                  <option value="2do cuatrimestre de 2do año">2do cuatrimestre de 2do año</option>
                </select>
              </div>

              <div>
                <label className="admin-label">2. Seleccionar Materia (Opcional)</label>
                <select 
                  className="admin-input" 
                  value={subjectId || ''} 
                  onChange={e => setSubjectId(e.target.value || null)}
                  style={{ cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2rem' }}
                >
                  <option value="">Ninguna (Evento General)</option>
                  {Object.entries(translations.es.plan.subjectNames)
                    .filter(([id]) => {
                      const numId = parseInt(id);
                      if (period === '1er cuatrimestre de 1er año') return numId >= 1 && numId <= 5;
                      if (period === '2do cuatrimestre de 1er año') return numId >= 6 && numId <= 10;
                      if (period === '1er cuatrimestre de 2do año') return numId >= 11 && numId <= 15;
                      if (period === '2do cuatrimestre de 2do año') return numId >= 16 && numId <= 20;
                      return numId >= 1 && numId <= 37;
                    })
                    .map(([id, name]) => (
                      <option key={id} value={id}>[{id.padStart(2, '0')}] {name as string}</option>
                  ))}
                </select>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                  Esto permite que el evento aparezca cuando se filtra por esta materia.
                </p>
              </div>
            </div>
          </section>

          <section className="admin-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <CalendarIcon size={20} color="#1a1a1a" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Fecha</h3>
            </div>
            
            <div style={{ display: 'grid', gap: '1.75rem' }}>
              <div style={{ display: 'grid', gap: '1.75rem' }}>
                <div>
                  <label className="admin-label">Fecha de Inicio</label>
                  <input 
                    type="date" 
                    className="admin-input" 
                    value={startDate} 
                    onChange={e => setStartDate(e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <label className="admin-label">Fecha de Fin (Opcional)</label>
                  <input 
                    type="date" 
                    className="admin-input" 
                    value={endDate} 
                    onChange={e => setEndDate(e.target.value)} 
                    min={startDate}
                  />
                </div>
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
