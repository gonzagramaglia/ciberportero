'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X } from 'lucide-react';
import { upsertCountdown } from '@/lib/actions';
import LanguageTabs from './LanguageTabs';

interface CountdownEditorProps {
  countdown?: any;
  slot?: string;
}

export default function CountdownEditor({ countdown, slot }: CountdownEditorProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [activeLang, setActiveLang] = useState<'es' | 'en' | 'pt'>('es');

  // Form state
  const [titles, setTitles] = useState<any>(countdown?.title || { es: '', en: '', pt: '' });
  const [descriptions, setDescriptions] = useState<any>(countdown?.description || { es: '', en: '', pt: '' });
  const [expiredMessages, setExpiredMessages] = useState<any>(countdown?.expiredMessage || { es: '', en: '', pt: '' });
  const [targetDate, setTargetDate] = useState(countdown?.targetDate ? new Date(countdown.targetDate).toISOString().slice(0, 16) : '');
  const [url, setUrl] = useState(countdown?.url || '');
  const [isActive, setIsActive] = useState(countdown?.isActive ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      await upsertCountdown({
        id: countdown?.id,
        slot: slot || countdown?.slot,
        title: titles,
        description: descriptions,
        expiredMessage: expiredMessages,
        targetDate: new Date(targetDate),
        url,
        isActive
      });
      router.push(`/admin/countdowns?success=${encodeURIComponent(titles.es)}&message=${encodeURIComponent('Cuenta regresiva guardada')}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error al guardar la cuenta regresiva');
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

  const updateExpiredMessage = (val: string) => {
    setExpiredMessages({ ...expiredMessages, [activeLang]: val });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12 fade-in">
      <div className="admin-header">
        <div>
          <h2 className="admin-title">{countdown ? 'Editar Cuenta Regresiva Global' : 'Nueva Cuenta Regresiva Global'}</h2>
          <p className="admin-subtitle">Configura el mensaje y el tiempo restante para este aviso global.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" onClick={() => router.push('/admin/countdowns')} className="btn-secondary">
            <X size={18} />
            <span>Cancelar</span>
          </button>
          <button type="submit" disabled={isPending} className="btn-primary">
            <Save size={18} />
            <span>{isPending ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3.5rem' }}>
        <div className="space-y-8">
          <LanguageTabs active={activeLang} onChange={setActiveLang} />

          <section className="admin-card" style={{ padding: '3rem', borderRadius: '32px' }}>
            <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>Mensaje Principal</h3>
            </div>

            <div className="space-y-10">
              <div>
                <label className="admin-label" style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Título ({activeLang})</label>
                <input 
                  className="admin-input"
                  style={{ fontSize: '1.5rem', fontWeight: 900, padding: '1.25rem', borderRadius: '16px' }}
                  value={titles[activeLang] || ''}
                  onChange={e => updateTitle(e.target.value)}
                  placeholder="Ej: Inicio de Inscripciones"
                  required={activeLang === 'es'}
                />
              </div>

              <div>
                <label className="admin-label" style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Descripción / Subtítulo ({activeLang})</label>
                <textarea 
                  className="admin-input"
                  rows={3}
                  style={{ fontSize: '1.1rem', fontWeight: 600, padding: '1.25rem', borderRadius: '16px', lineHeight: 1.6, background: '#f8fafc' }}
                  value={descriptions[activeLang] || ''}
                  onChange={e => updateDescription(e.target.value)}
                  placeholder="Explica brevemente de qué se trata..."
                />
              </div>

              <div>
                <label className="admin-label" style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Mensaje al Expirar ({activeLang})</label>
                <textarea 
                  className="admin-input"
                  rows={2}
                  style={{ fontSize: '1.1rem', fontWeight: 600, padding: '1.25rem', borderRadius: '16px', lineHeight: 1.6, background: '#fff1f2', border: '1px solid #fecdd3' }}
                  value={expiredMessages[activeLang] || ''}
                  onChange={e => updateExpiredMessage(e.target.value)}
                  placeholder="Mensaje que aparecerá cuando el tiempo llegue a cero..."
                />
              </div>

              <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '2px dashed #f1f5f9' }}>
                <label className="admin-label" style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>URL LINK (OPCIONAL)</label>
                <input 
                  type="url"
                  className="admin-input"
                  style={{ fontSize: '1rem', fontWeight: 700, padding: '1.1rem', borderRadius: '16px' }}
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8" style={{ marginTop: '3.9rem' }}>
          <section className="admin-card" style={{ padding: '2.5rem', borderRadius: '28px' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Configuración</h4>
            </div>

            <div className="space-y-8">
              <div>
                <label className="admin-label" style={{ marginBottom: '0.75rem', fontWeight: 800 }}>Fecha y Hora Final</label>
                <input 
                  type="datetime-local"
                  className="admin-input"
                  style={{ fontSize: '0.95rem', fontWeight: 800, padding: '1rem', borderRadius: '12px' }}
                  value={targetDate}
                  onChange={e => setTargetDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="admin-label">Lado del Widget</label>
                <div style={{ 
                  padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', 
                  border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: 900, fontSize: '0.9rem',
                  display: 'flex', alignItems: 'center', gap: '0.75rem'
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }} />
                  { (slot || countdown?.slot) === 'left' ? 'LADO IZQUIERDO' : 'LADO DERECHO' }
                </div>
              </div>

              <div 
                onClick={() => setIsActive(!isActive)}
                style={{ 
                  cursor: 'pointer', padding: '1.5rem', borderRadius: '20px', 
                  background: isActive ? '#f0fdf4' : '#fff1f2',
                  border: `2px solid ${isActive ? '#22c55e' : '#fecdd3'}`,
                  display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  marginTop: '1rem'
                }}
              >
                <div style={{ 
                  width: '44px', height: '24px', borderRadius: '12px', 
                  background: isActive ? '#22c55e' : '#cbd5e1', position: 'relative' 
                }}>
                  <div style={{ 
                    width: '18px', height: '18px', borderRadius: '50%', background: 'white', 
                    position: 'absolute', top: '3px', left: isActive ? '23px' : '3px', transition: 'all 0.2s' 
                  }} />
                </div>
                <span style={{ fontWeight: 900, color: isActive ? '#166534' : '#9f1239', fontSize: '0.95rem' }}>
                  {isActive ? 'HABILITADO' : 'NO HABILITADO'}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
