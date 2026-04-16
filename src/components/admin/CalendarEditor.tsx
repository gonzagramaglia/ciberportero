'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X } from 'lucide-react';
import { upsertCalendarEvent } from '@/lib/actions';
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
  const [startDate, setStartDate] = useState(event?.startDate ? new Date(event.startDate).toISOString().slice(0, 10) : '');
  const [endDate, setEndDate] = useState(event?.endDate ? new Date(event.endDate).toISOString().slice(0, 10) : '');
  const [category, setCategory] = useState(event?.category || 'Otro');
  const [period, setPeriod] = useState(event?.period || 'Evento General');
  const [subject, setSubject] = useState(event?.subject || 'Evento General');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      await upsertCalendarEvent({
        id: event?.id,
        title: titles,
        description: descriptions,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        category,
        period,
        subject
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

  const categories = ['Examen / Parcial', 'Autoevaluación Obligatoria', 'Tarea / Entrega', 'Clase', 'Otro'];

  return (
    <form onSubmit={handleSubmit} className="space-y-12 fade-in">
      <div className="admin-header">
        <div>
          <h2 className="admin-title">{event ? 'Editar Evento Académico' : 'Nuevo Evento Académico'}</h2>
          <p className="admin-subtitle">Gestiona las fechas importantes del calendario universitario.</p>
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

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3.5rem' }}>
        <div className="space-y-10">
          <LanguageTabs active={activeLang} onChange={setActiveLang} />

          <section className="admin-card" style={{ padding: '3rem', borderRadius: '32px' }}>
            <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>Información General</h3>
            </div>

            <div className="space-y-10">
              <div>
                <label className="admin-label" style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>TÍTULO DEL EVENTO ({activeLang})</label>
                <input 
                  className="admin-input"
                  style={{ fontSize: '1.5rem', fontWeight: 900, padding: '1.25rem', borderRadius: '16px' }}
                  value={titles[activeLang] || ''}
                  onChange={e => updateTitle(e.target.value)}
                  placeholder="Ej: Final de Álgebra"
                  required={activeLang === 'es'}
                />
              </div>

              <div>
                <label className="admin-label" style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>DESCRIPCIÓN DETALLADA ({activeLang})</label>
                <textarea 
                  className="admin-input"
                  rows={4}
                  style={{ fontSize: '1.1rem', fontWeight: 600, padding: '1.25rem', borderRadius: '16px', lineHeight: 1.6, background: '#f8fafc' }}
                  value={descriptions[activeLang] || ''}
                  onChange={e => updateDescription(e.target.value)}
                  placeholder="Instrucciones o detalles adicionales..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
                <div>
                  <label className="admin-label" style={{ marginBottom: '0.75rem', fontWeight: 800 }}>FECHA DE INICIO</label>
                  <input 
                    type="date"
                    className="admin-input"
                    style={{ padding: '1rem', borderRadius: '14px', fontSize: '1rem', fontWeight: 700 }}
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="admin-label" style={{ marginBottom: '0.75rem', fontWeight: 800 }}>FECHA DE FIN (OPCIONAL)</label>
                  <input 
                    type="date"
                    className="admin-input"
                    style={{ padding: '1rem', borderRadius: '14px', fontSize: '1rem', fontWeight: 700 }}
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="admin-card" style={{ padding: '3rem', borderRadius: '32px' }}>
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>Vínculo Académico</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <label className="admin-label" style={{ marginBottom: '0.75rem', fontWeight: 800 }}>CUATRIMESTRE / PERIODO</label>
                <input 
                  className="admin-input"
                  style={{ padding: '1rem', borderRadius: '14px', fontSize: '1rem', fontWeight: 700 }}
                  value={period}
                  onChange={e => setPeriod(e.target.value)}
                  placeholder="Ej: 1er cuatrimestre"
                />
              </div>
              <div>
                <label className="admin-label" style={{ marginBottom: '0.75rem', fontWeight: 800 }}>MATERIA ESPECÍFICA</label>
                <input 
                  className="admin-input"
                  style={{ padding: '1rem', borderRadius: '14px', fontSize: '1rem', fontWeight: 700 }}
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Materia..."
                />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8" style={{ marginTop: '3.9rem' }}>
          <section className="admin-card" style={{ padding: '2.5rem', borderRadius: '28px' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CATEGORÍA</h4>
            </div>

            <div className="space-y-3">
              {categories.map(cat => (
                <div 
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{ 
                    cursor: 'pointer', padding: '1.25rem', borderRadius: '16px', 
                    background: category === cat ? '#f0fdf4' : '#fff',
                    border: `2px solid ${category === cat ? '#22c55e' : '#f1f5f9'}`,
                    display: 'flex', alignItems: 'center', transition: 'all 0.2s',
                    fontWeight: 800, color: category === cat ? '#166534' : '#64748b', fontSize: '0.9rem',
                    boxShadow: category === cat ? '0 4px 12px rgba(34, 197, 94, 0.1)' : 'none'
                  }}
                >
                  {cat}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
