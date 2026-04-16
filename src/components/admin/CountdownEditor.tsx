'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Clock } from 'lucide-react';
import { upsertCountdown } from '@/lib/actions';

interface CountdownEditorProps {
  countdown?: any;
}

export default function CountdownEditor({ countdown }: CountdownEditorProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  // Form state
  const [titleEs, setTitleEs] = useState(countdown?.title?.es || '');
  const [titleEn, setTitleEn] = useState(countdown?.title?.en || '');
  const [titlePt, setTitlePt] = useState(countdown?.title?.pt || '');
  
  const [descEs, setDescEs] = useState(countdown?.description?.es || '');
  const [descEn, setDescEn] = useState(countdown?.description?.en || '');
  const [descPt, setDescPt] = useState(countdown?.description?.pt || '');

  const [targetDate, setTargetDate] = useState(
    countdown?.targetDate 
      ? new Date(countdown.targetDate).toISOString().slice(0, 16) 
      : ''
  );
  
  const [isActive, setIsActive] = useState(countdown?.isActive ?? true);
  const [url, setUrl] = useState(countdown?.url || '');
  const [slot, setSlot] = useState(countdown?.slot || 'left');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      await upsertCountdown({
        id: countdown?.id,
        title: { es: titleEs, en: titleEn, pt: titlePt },
        description: { es: descEs, en: descEn, pt: descPt },
        targetDate,
        isActive,
        url,
        slot
      });
      router.push('/admin/notifications');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error al guardar el contador');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="admin-header">
        <div>
          <h2 className="admin-title">{countdown ? 'Editar Contador' : 'Nuevo Contador'}</h2>
          <p className="admin-subtitle">Configura la fecha límite y el mensaje del widget.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            <X size={18} />
            <span>Cancelar</span>
          </button>
          <button type="submit" disabled={isPending} className="btn-primary">
            <Save size={18} />
            <span>{isPending ? 'Guardando...' : 'Guardar'}</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '2rem' }}>
        {/* Sección: Textos y Traducciones */}
        <section className="admin-card" style={{ padding: '2.5rem' }}>
          <div style={{ marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Información del Contador</h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>Define los textos que verán los usuarios en cada idioma.</p>
          </div>

          <div style={{ display: 'grid', gap: '2rem' }}>
            <div className="space-y-4">
              <label className="admin-label" style={{ color: '#1a1a1a' }}>Títulos</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem' }}>🇦🇷</span>
                  <input className="admin-input" value={titleEs} onChange={e => setTitleEs(e.target.value)} placeholder="Inscripción a Materias" style={{ paddingLeft: '3rem' }} required />
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem' }}>🇺🇸</span>
                  <input className="admin-input" value={titleEn} onChange={e => setTitleEn(e.target.value)} placeholder="Subject Enrollment" style={{ paddingLeft: '3rem' }} />
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem' }}>🇧🇷</span>
                  <input className="admin-input" value={titlePt} onChange={e => setTitlePt(e.target.value)} placeholder="Inscrição em Matérias" style={{ paddingLeft: '3rem' }} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="admin-label" style={{ color: '#1a1a1a' }}>Descripciones (Opcional)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '1rem', fontSize: '1.2rem' }}>🇦🇷</span>
                  <textarea className="admin-input" value={descEs} onChange={e => setDescEs(e.target.value)} placeholder="Descripción en Español" rows={3} style={{ paddingLeft: '3rem' }} />
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '1rem', fontSize: '1.2rem' }}>🇺🇸</span>
                  <textarea className="admin-input" value={descEn} onChange={e => setDescEn(e.target.value)} placeholder="Description in English" rows={3} style={{ paddingLeft: '3rem' }} />
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '1rem', fontSize: '1.2rem' }}>🇧🇷</span>
                  <textarea className="admin-input" value={descPt} onChange={e => setDescPt(e.target.value)} placeholder="Descrição em Português" rows={3} style={{ paddingLeft: '3rem' }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección: Configuración Técnica */}
        <section style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
          <div className="admin-card" style={{ padding: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Clock size={20} color="#1a1a1a" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Fecha y Hora Meta</h3>
            </div>
            <input 
              type="datetime-local" 
              className="admin-input" 
              value={targetDate} 
              onChange={e => setTargetDate(e.target.value)} 
              required 
              style={{ fontSize: '1.1rem', padding: '1rem' }}
            />
            <div style={{ marginTop: '2rem' }}>
              <label className="admin-label" style={{ color: '#1a1a1a', marginBottom: '0.75rem', display: 'block' }}>Posición del Widget</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setSlot('left')}
                  style={{ 
                    flex: 1, padding: '0.75rem', borderRadius: '12px', border: '2px solid',
                    background: slot === 'left' ? '#eff6ff' : 'white',
                    borderColor: slot === 'left' ? '#3b82f6' : '#e2e8f0',
                    fontWeight: 700, color: slot === 'left' ? '#1e40af' : '#64748b'
                  }}
                >
                  Izquierda
                </button>
                <button 
                  type="button" 
                  onClick={() => setSlot('right')}
                  style={{ 
                    flex: 1, padding: '0.75rem', borderRadius: '12px', border: '2px solid',
                    background: slot === 'right' ? '#eff6ff' : 'white',
                    borderColor: slot === 'right' ? '#3b82f6' : '#e2e8f0',
                    fontWeight: 700, color: slot === 'right' ? '#1e40af' : '#64748b'
                  }}
                >
                  Derecha
                </button>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <label className="admin-label" style={{ color: '#1a1a1a', marginBottom: '0.75rem', display: 'block' }}>Link al clickear (URL)</label>
              <input 
                type="url"
                className="admin-input" 
                value={url} 
                onChange={e => setUrl(e.target.value)} 
                placeholder="https://ejemplo.com"
                style={{ fontSize: '1rem', padding: '0.8rem' }}
              />
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '1rem' }}>
              El contador se actualizará automáticamente y llegará a cero en este instante exacto.
            </p>
          </div>

          <div className="admin-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div 
              onClick={() => setIsActive(!isActive)}
              style={{ 
                cursor: 'pointer',
                padding: '1.5rem',
                borderRadius: '16px',
                background: isActive ? '#f0fdf4' : '#f8fafc',
                border: `2px solid ${isActive ? '#22c55e' : '#e2e8f0'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ 
                width: '24px', height: '24px', borderRadius: '6px', 
                border: `2px solid ${isActive ? '#22c55e' : '#cbd5e1'}`,
                background: isActive ? '#22c55e' : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {isActive && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
              </div>
              <span style={{ fontWeight: 800, color: isActive ? '#166534' : '#64748b' }}>
                {isActive ? 'Contador Activo' : 'Contador Inactivo'}
              </span>
            </div>
          </div>
        </section>
      </div>
    </form>
  );
}
