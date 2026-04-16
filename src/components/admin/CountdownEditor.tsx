'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Clock, Link as LinkIcon } from 'lucide-react';
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
        targetDate: new Date(targetDate),
        url,
        isActive
      });
      router.push('/admin/notifications');
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

  return (
    <form onSubmit={handleSubmit} className="space-y-8 fade-in">
      <div className="admin-header">
        <div>
          <h2 className="admin-title">{countdown ? 'Editar Cuenta Regresiva Global' : 'Nueva Cuenta Regresiva Global'}</h2>
          <p className="admin-subtitle">Configura el mensaje y el tiempo restante para este aviso global.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            <X size={18} />
            <span>Cancelar</span>
          </button>
          <button type="submit" disabled={isPending} className="btn-primary">
            <Save size={18} />
            <span>{isPending ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem' }}>
        <div className="space-y-6">
          <LanguageTabs active={activeLang} onChange={setActiveLang} />

          <section className="admin-card" style={{ padding: '2.5rem', borderRadius: '24px' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>Contenido de la Cuenta Regresiva</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="admin-label">Título del mensaje</label>
                <input 
                  className="admin-input"
                  value={titles[activeLang] || ''}
                  onChange={e => updateTitle(e.target.value)}
                  placeholder="Ej: Inicio de Clases"
                  required={activeLang === 'es'}
                />
              </div>

              <div>
                <label className="admin-label">Texto descriptivo (Opcional)</label>
                <textarea 
                  className="admin-input"
                  rows={3}
                  value={descriptions[activeLang] || ''}
                  onChange={e => updateDescription(e.target.value)}
                  placeholder="Ej: Prepárate para el nuevo ciclo lectivo..."
                />
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <LinkIcon size={14} /> URL LINK (OPCIONAL)
                </label>
                <input 
                  type="url"
                  className="admin-input"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://ejemplo.com"
                />
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                  Al hacer click en la cuenta regresiva, se abrirá este link.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6" style={{ marginTop: '4.5rem' }}>
          <section className="admin-card" style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2.5rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Configuración</h4>
            </div>

            <div className="space-y-6">
              <div>
                <label className="admin-label">Fecha y Hora Objetivo</label>
                <input 
                  type="datetime-local"
                  className="admin-input"
                  value={targetDate}
                  onChange={e => setTargetDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="admin-label">Posición (Bloqueada)</label>
                <div style={{ 
                  padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '12px', 
                  border: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700, fontSize: '0.9rem' 
                }}>
                  { (slot || countdown?.slot) === 'left' ? 'LADO IZQUIERDO' : 'LADO DERECHO' }
                </div>
              </div>

              <div 
                onClick={() => setIsActive(!isActive)}
                style={{ 
                  cursor: 'pointer', padding: '1.25rem', borderRadius: '16px', 
                  background: isActive ? '#f0fdf4' : '#fff1f2',
                  border: `2px solid ${isActive ? '#22c55e' : '#fecdd3'}`,
                  display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.2s'
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
                <span style={{ fontWeight: 800, color: isActive ? '#166534' : '#9f1239', fontSize: '0.9rem' }}>
                  {isActive ? 'HABILITADO' : 'DESACTIVADO'}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
