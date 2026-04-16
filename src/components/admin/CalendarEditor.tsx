'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Calendar as CalendarIcon, Tag, Book } from 'lucide-react';
import { upsertCalendarEvent } from '@/lib/actions';
import { translations } from '@/lib/translations';
import LanguageTabs from './LanguageTabs';

interface CalendarEditorProps {
  event?: any;
}

export default function CalendarEditor({ event }: CalendarEditorProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [activeLang, setActiveLang] = useState<'es' | 'en' | 'pt'>('es');

  // Form state
  const [titles, setTitles] = useState<any>(event?.title || { es: '', en: '', pt: '' });
  const [descriptions, setDescriptions] = useState<any>(event?.description || { es: '', en: '', pt: '' });
  const [startDate, setStartDate] = useState(event?.startDate ? new Date(event.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(event?.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '');
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
        subjectId,
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

  const updateTitle = (val: string) => {
    setTitles({ ...titles, [activeLang]: val });
  };

  const updateDescription = (val: string) => {
    setDescriptions({ ...descriptions, [activeLang]: val });
  };

  const eventTypes = [
    { id: 'exam', label: 'Examen / Parcial', color: '#ef4444', bg: '#fef2f2' },
    { id: 'quiz_mandatory', label: 'Autoevaluación Obligatoria', color: '#f97316', bg: '#fff7ed' },
    { id: 'enrollment', label: 'Tarea / Entrega', color: '#2563eb', bg: '#eff6ff' },
    { id: 'classes', label: 'Clase', color: '#8b5cf6', bg: '#f5f3ff' },
    { id: 'event', label: 'Otro', color: '#10b981', bg: '#ecfdf5' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8 fade-in">
      <div className="admin-header">
        <div>
          <h2 className="admin-title">{event ? 'Editar Evento' : 'Nuevo Evento'}</h2>
          <p className="admin-subtitle">Configura la fecha y los detalles del calendario académico.</p>
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

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem' }}>
        <div className="space-y-6">
          <LanguageTabs active={activeLang} onChange={setActiveLang} />

          <section className="admin-card" style={{ padding: '2.5rem', borderRadius: '24px' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>Información General</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="admin-label">Título del Evento</label>
                <input 
                  className="admin-input"
                  value={titles[activeLang] || ''}
                  onChange={e => updateTitle(e.target.value)}
                  placeholder="Ej: Final de Álgebra"
                  required={activeLang === 'es'}
                />
              </div>

              <div>
                <label className="admin-label">Descripción Detallada (Opcional)</label>
                <textarea 
                  className="admin-input"
                  rows={4}
                  value={descriptions[activeLang] || ''}
                  onChange={e => updateDescription(e.target.value)}
                  placeholder="Instrucciones o detalles adicionales..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                <div>
                  <label className="admin-label">Fecha de Inicio</label>
                  <input type="date" className="admin-input" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                </div>
                <div>
                  <label className="admin-label">Fecha de Fin (Opcional)</label>
                  <input type="date" className="admin-input" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} />
                </div>
              </div>
            </div>
          </section>

          <section className="admin-card" style={{ padding: '2.5rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <Book size={20} className="text-secondary" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>Vínculo Académico</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label className="admin-label">Cuatrimestre / Periodo</label>
                <select className="admin-input" value={period} onChange={e => setPeriod(e.target.value)}>
                  <option value="all">Todos los periodos</option>
                  <option value="1er cuatrimestre de 1er año">1er cuatrimestre de 1er año</option>
                  <option value="2do cuatrimestre de 1er año">2do cuatrimestre de 1er año</option>
                  <option value="1er cuatrimestre de 2do año">1er cuatrimestre de 2do año</option>
                  <option value="2do cuatrimestre de 2do año">2do cuatrimestre de 2do año</option>
                </select>
              </div>

              <div>
                <label className="admin-label">Materia Específica (Opcional)</label>
                <select className="admin-input" value={subjectId || ''} onChange={e => setSubjectId(e.target.value || null)}>
                  <option value="">Evento General</option>
                  {Object.entries((translations.es as any).plan.subjectNames).map(([id, name]) => (
                    <option key={id} value={id}>[{id.padStart(2, '0')}] {name as string}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6" style={{ marginTop: '4.5rem' }}>
          <section className="admin-card" style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categoría</h4>
            </div>

            <div className="space-y-4">
              {eventTypes.map(t => (
                <div 
                  key={t.id}
                  onClick={() => setType(t.id)}
                  style={{ 
                    cursor: 'pointer', padding: '1rem', borderRadius: '14px',
                    background: type === t.id ? t.bg : 'white',
                    border: `2px solid ${type === t.id ? t.color : '#e2e8f0'}`,
                    display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.2s'
                  }}
                >
                  <Tag size={16} style={{ color: type === t.id ? t.color : '#94a3b8' }} />
                  <span style={{ fontWeight: 800, color: type === t.id ? t.color : '#64748b', fontSize: '0.85rem' }}>{t.label}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
