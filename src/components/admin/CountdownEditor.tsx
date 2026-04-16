'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Clock, Edit3, Globe, Link as LinkIcon, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
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
  const [adminNotes, setAdminNotes] = useState(countdown?.adminNotes || '');

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
        slot,
        adminNotes
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
    <form onSubmit={handleSubmit} className="space-y-8 fade-in">
      <div className="admin-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <Clock size={24} className="text-accent" />
            <h2 className="admin-title">{countdown ? 'Editar Widget de Contador' : 'Nuevo Widget de Contador'}</h2>
          </div>
          <p className="admin-subtitle">Este contador aparecerá en la página principal según la posición elegida.</p>
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
        <div className="space-y-8">
          {/* SECCIÓN PRINCIPAL: CONTENIDO */}
          <section className="admin-card" style={{ padding: '2.5rem', borderRadius: '24px' }}>
            <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Globe size={20} className="text-accent" />
                Contenido Multilingüe
              </h3>
            </div>

            <div className="space-y-8">
              {/* Bloque de Idiomas */}
              <div style={{ display: 'grid', gap: '2rem' }}>
                {['es', 'en', 'pt'].map((lang) => (
                  <div key={lang} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>{lang === 'es' ? '🇦🇷' : lang === 'en' ? '🇺🇸' : '🇧🇷'}</span>
                      <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Versión {lang.toUpperCase()}</span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="admin-label" style={{ fontSize: '0.75rem' }}>Título del Contador</label>
                        <input 
                          className="admin-input" 
                          value={lang === 'es' ? titleEs : lang === 'en' ? titleEn : titlePt} 
                          onChange={e => {
                            if(lang === 'es') setTitleEs(e.target.value);
                            if(lang === 'en') setTitleEn(e.target.value);
                            if(lang === 'pt') setTitlePt(e.target.value);
                          }} 
                          placeholder="Ej: Inicio de Clases" 
                          required={lang === 'es'} 
                        />
                      </div>
                      <div>
                        <label className="admin-label" style={{ fontSize: '0.75rem' }}>Breve descripción</label>
                        <textarea 
                          className="admin-input" 
                          rows={2}
                          value={lang === 'es' ? descEs : lang === 'en' ? descEn : descPt} 
                          onChange={e => {
                            if(lang === 'es') setDescEs(e.target.value);
                            if(lang === 'en') setDescEn(e.target.value);
                            if(lang === 'pt') setDescPt(e.target.value);
                          }} 
                          placeholder="Ej: Falta poco para volver a la facultad."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* MIS NOTAS */}
          <section className="admin-card" style={{ padding: '2rem', borderRadius: '24px', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Edit3 size={18} className="text-accent" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>Mis Notas</h3>
            </div>
            <textarea 
              className="admin-input" 
              rows={4} 
              value={adminNotes} 
              onChange={e => setAdminNotes(e.target.value)} 
              placeholder="Recordatorios personales sobre este contador..."
              style={{ fontSize: '0.95rem', background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '1.25rem' }}
            />
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '1rem' }}>Estas notas son privadas y solo tú puedes verlas en el panel.</p>
          </section>
        </div>

        <div className="space-y-8">
          {/* SECCIÓN CONFIGURACIÓN */}
          <section className="admin-card" style={{ padding: '2rem', borderRadius: '24px' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Configuración del Widget</h4>
            </div>

            <div className="space-y-6">
              <div>
                <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={14} /> Fecha del Deadline
                </label>
                <input 
                  type="datetime-local" 
                  className="admin-input" 
                  value={targetDate} 
                  onChange={e => setTargetDate(e.target.value)} 
                  required 
                  style={{ fontWeight: 700 }}
                />
              </div>

              <div>
                <label className="admin-label">Posición Bloqueada</label>
                <div style={{ 
                  padding: '1rem', background: '#f1f5f9', borderRadius: '16px', border: '1px solid #e2e8f0',
                  display: 'flex', alignItems: 'center', gap: '0.75rem'
                }}>
                  <div style={{ 
                    width: '10px', height: '10px', borderRadius: '50%', 
                    background: slot === 'left' ? '#3b82f6' : '#8b5cf6',
                    boxShadow: `0 0 10px ${slot === 'left' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(139, 92, 246, 0.4)'}`
                  }} />
                  <span style={{ fontWeight: 900, fontSize: '0.9rem', color: slot === 'left' ? '#1e40af' : '#5b21b6' }}>
                    {slot === 'left' ? 'IZQUIERDA' : 'DERECHA'}
                  </span>
                </div>
              </div>

              <div>
                <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <LinkIcon size={14} /> URL Link (Opcional)
                </label>
                <input 
                  type="url" 
                  className="admin-input" 
                  value={url} 
                  onChange={e => setUrl(e.target.value)} 
                  placeholder="https://siu.unpaz.edu.ar/..." 
                />
              </div>

              <div 
                onClick={() => setIsActive(!isActive)}
                style={{ 
                  cursor: 'pointer', padding: '1.25rem', borderRadius: '20px', 
                  background: isActive ? '#f0fdf4' : '#fff1f2',
                  border: `2px solid ${isActive ? '#22c55e' : '#fecdd3'}`,
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div style={{ 
                  width: '44px', height: '24px', borderRadius: '12px', 
                  background: isActive ? '#22c55e' : '#cbd5e1', 
                  position: 'relative' 
                }}>
                  <div style={{ 
                    width: '18px', height: '18px', borderRadius: '50%', background: 'white', 
                    position: 'absolute', top: '3px', left: isActive ? '23px' : '3px', 
                    transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' 
                  }} />
                </div>
                <div>
                  <span style={{ fontWeight: 900, color: isActive ? '#166534' : '#9f1239', fontSize: '0.9rem', display: 'block' }}>
                    {isActive ? 'WIDGET ACTIVO' : 'WIDGET INACTIVO'}
                  </span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.7, color: isActive ? '#166534' : '#9f1239' }}>{isActive ? 'Visible en la home' : 'Oculto al público'}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Tips de Ayuda */}
          <div style={{ padding: '1.5rem', background: '#eff6ff', borderRadius: '24px', border: '1px solid #dbeafe' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <CheckCircle size={18} style={{ color: '#2563eb', flexShrink: 0 }} />
              <div>
                <h5 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 900, color: '#1e40af' }}>Tip de uso</h5>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#1e40af', opacity: 0.8, lineHeight: 1.4 }}>
                  Asegúrate de configurar los tres idiomas para que la experiencia sea fluida en todos los países.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
