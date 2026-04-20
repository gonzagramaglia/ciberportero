'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X } from 'lucide-react';
import { upsertCalendarEvent } from '@/lib/actions';
import { curriculum } from '@/data/curriculum';
import { translations } from '@/lib/translations';
import { toLocalISOString } from '@/lib/utils';

interface CalendarEditorProps {
  event?: any;
}

export default function CalendarEditor({ event }: CalendarEditorProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  // Form state
  const [titles, setTitles] = useState<any>(event?.title || { es: '', en: '', pt: '' });
  const [descriptions, setDescriptions] = useState<any>(event?.description || { es: '', en: '', pt: '' });
  const [startDate, setStartDate] = useState(toLocalISOString(event?.startDate, 10));
  const [endDate, setEndDate] = useState(toLocalISOString(event?.endDate, 10));
  const [url, setUrl] = useState(event?.url || '');

  const typeToCategory: Record<string, string> = {
    'exam': 'Examen / Parcial',
    'quiz_mandatory': 'Autoevaluación (obligatoria)',
    'enrollment': 'Tarea',
    'classes': 'Clase',
    'event': 'Otro'
  };

  const [category, setCategory] = useState(event?.type ? typeToCategory[event.type] || 'Otro' : 'Otro');
  const [period, setPeriod] = useState(event?.period || 'Evento General');
  const [subject, setSubject] = useState(event?.subjectId || 'all');

  const availableSubjects = useMemo(() => {
    return curriculum.filter(sub => {
      // General cases
      if (period === 'Evento General' || period === 'Anual' || period === 'all') return true;

      // Half-year filters (any year)
      if (period === '1er Cuatrimestre') return sub.term === 1;
      if (period === '2do Cuatrimestre') return sub.term === 2;

      // Specific period filters
      const ct = translations.es.calendar;
      if (period === ct.firstPeriod || period === '1er cuatrimestre de 1er año') return sub.year === 1 && sub.term === 1;
      if (period === ct.secondPeriod || period === '2do cuatrimestre de 1er año') return sub.year === 1 && sub.term === 2;
      if (period === ct.thirdPeriod || period === '1er cuatrimestre de 2do año') return sub.year === 2 && sub.term === 1;
      if (period === ct.fourthPeriod || period === '2do cuatrimestre de 2do año') return sub.year === 2 && sub.term === 2;

      return true;
    });
  }, [period]);

  // Reset subject if it's no longer available in the select period
  useEffect(() => {
    if (subject !== 'all' && !availableSubjects.some(s => s.id.toString() === subject)) {
      setSubject('all');
    }
  }, [availableSubjects, subject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    const typeMap: Record<string, string> = {
      'Examen / Parcial': 'exam',
      'Autoevaluación (obligatoria)': 'quiz_mandatory',
      'Tarea': 'enrollment',
      'Clase': 'classes',
      'Otro': 'event'
    };

    try {
      const startParts = startDate.split('-').map(Number);
      const endParts = endDate ? endDate.split('-').map(Number) : null;

      await upsertCalendarEvent({
        id: event?.id,
        title: titles,
        description: descriptions,
        startDate: new Date(startParts[0], startParts[1] - 1, startParts[2]),
        endDate: endParts ? new Date(endParts[0], endParts[1] - 1, endParts[2]) : null,
        type: typeMap[category] || 'event',
        period,
        subject,
        url
      });

      const dateParts = startDate.split('-'); // YYYY-MM-DD
      const now = new Date();
      const currentYear = now.getFullYear().toString();
      
      let calendarLink = `/calendar/${dateParts[2]}/${dateParts[1]}`;
      if (dateParts[0] !== currentYear) {
        calendarLink += `/${dateParts[0]}`;
      }

      router.push(`/admin/calendar?success=${encodeURIComponent(titles.es)}&message=${encodeURIComponent('Evento guardado correctamente')}&slug=${encodeURIComponent(calendarLink)}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error al guardar el evento');
    } finally {
      setIsPending(false);
    }
  };

  const categories = ['Examen / Parcial', 'Autoevaluación (obligatoria)', 'Tarea', 'Clase', 'Otro'];

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
          <section className="admin-card" style={{ padding: '3rem', borderRadius: '32px' }}>
            <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>Información General</h3>
            </div>

            <div className="space-y-10">
                <label className="admin-label" style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>TÍTULO DEL EVENTO</label>
                <input
                  className="admin-input"
                  style={{ fontSize: '1.5rem', fontWeight: 900, padding: '1.25rem', borderRadius: '16px' }}
                  value={titles.es || ''}
                  onChange={e => setTitles({ ...titles, es: e.target.value })}
                  placeholder="Ej: Final de Álgebra"
                  required
                />

                <label className="admin-label" style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>DESCRIPCIÓN DETALLADA</label>
                <textarea
                  className="admin-input"
                  rows={4}
                  style={{ fontSize: '1.1rem', fontWeight: 600, padding: '1.25rem', borderRadius: '16px', lineHeight: 1.6, background: '#f8fafc' }}
                  value={descriptions.es || ''}
                  onChange={e => setDescriptions({ ...descriptions, es: e.target.value })}
                  placeholder="Instrucciones o detalles adicionales..."
                />

                <div style={{ marginTop: '2rem' }}>
                  <label className="admin-label" style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>LINK / URL DEL EVENTO (OPCIONAL)</label>
                  <input
                    className="admin-input"
                    style={{ fontSize: '1.1rem', fontWeight: 600, padding: '1.25rem', borderRadius: '16px', background: '#f8fafc' }}
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://..."
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

          <section className="admin-card" style={{ padding: '3rem', borderRadius: '32px', marginTop: '4rem' }}>
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>Vínculo Académico</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <label className="admin-label" style={{ marginBottom: '0.75rem', fontWeight: 800 }}>CUATRIMESTRE / PERIODO</label>
                <select
                  className="admin-input"
                  style={{ padding: '1rem', borderRadius: '14px', fontSize: '1rem', fontWeight: 700, appearance: 'none', background: '#fff url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E") no-repeat right 1rem center / 1.5rem' }}
                  value={period}
                  onChange={e => setPeriod(e.target.value)}
                >
                  <option value="Evento General">Evento General</option>
                  <option value="1er cuatrimestre de 1er año">1er cuatrimestre de 1er año</option>
                  <option value="2do cuatrimestre de 1er año">2do cuatrimestre de 1er año</option>
                  <option value="1er cuatrimestre de 2do año">1er cuatrimestre de 2do año</option>
                  <option value="2do cuatrimestre de 2do año">2do cuatrimestre de 2do año</option>
                </select>
              </div>
              <div>
                <label className="admin-label" style={{ marginBottom: '0.75rem', fontWeight: 800 }}>MATERIA ESPECÍFICA</label>
                <select
                  className="admin-input"
                  style={{ padding: '1rem', borderRadius: '14px', fontSize: '1rem', fontWeight: 700, appearance: 'none', background: '#fff url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E") no-repeat right 1rem center / 1.5rem' }}
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                >
                  <option value="all">Todas las materias / Evento General</option>
                  {availableSubjects.map(sub => (
                    <option key={sub.id} value={sub.id.toString()}>
                      [{sub.id.toString().padStart(2, '0')}] {(translations.es.plan.subjectNames as any)[sub.id]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="admin-card" style={{ padding: '2.5rem', borderRadius: '28px' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CATEGORÍA</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
