'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Bell } from 'lucide-react';
import { upsertNotification } from '@/lib/actions';

interface NotificationEditorProps {
  notification?: any;
}

export default function NotificationEditor({ notification }: NotificationEditorProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [activeLang, setActiveLang] = useState<'es' | 'en' | 'pt'>('es');

  // Form state
  const [messages, setMessages] = useState(notification?.message || { es: '', en: '', pt: '' });
  const [descriptions, setDescriptions] = useState(notification?.description || { es: '', en: '', pt: '' });
  const [type, setType] = useState(notification?.type || 'info');
  const [active, setActive] = useState(notification?.active ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messages.es) {
      alert('La versión en español es obligatoria.');
      return;
    }
    setIsPending(true);
    try {
      await upsertNotification({
        id: notification?.id,
        message: messages,
        description: descriptions,
        type,
        active
      });
      router.push('/admin/notifications');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error al guardar la notificación');
    } finally {
      setIsPending(false);
    }
  };

  const langNames = { es: 'Español', en: 'English', pt: 'Português' };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 fade-in">
      <div className="admin-header">
        <div>
          <h2 className="admin-title">{notification ? 'Editar Alerta' : 'Nueva Alerta'}</h2>
          <p className="admin-subtitle">Configura el mensaje que aparecerá en el banner superior.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            <X size={18} />
            <span>Cancelar</span>
          </button>
          <button type="submit" disabled={isPending} className="btn-primary">
            <Save size={18} />
            <span>{isPending ? 'Guardando...' : 'Guardar Alerta'}</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        <div className="space-y-6">
          {/* Selector de Idiomas */}
          <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem', background: '#f1f5f9', borderRadius: '16px', width: 'fit-content' }}>
            {(['es', 'en', 'pt'] as const).map(l => (
              <button
                key={l}
                type="button"
                onClick={() => setActiveLang(l)}
                style={{
                  padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none',
                  background: activeLang === l ? 'white' : 'transparent',
                  color: activeLang === l ? '#0f172a' : '#64748b',
                  fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: activeLang === l ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                {langNames[l]}
              </button>
            ))}
          </div>

          <section className="admin-card" style={{ padding: '2.5rem' }}>
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Contenido en {langNames[activeLang]}</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="admin-label">Mensaje del Banner</label>
                <input 
                  className="admin-input"
                  value={messages[activeLang] || ''}
                  onChange={e => setMessages({...messages, [activeLang]: e.target.value})}
                  placeholder="Ej: Inscripciones abiertas hasta el viernes"
                  required={activeLang === 'es'}
                />
              </div>
              <div>
                <label className="admin-label">Descripción Detallada (Opcional)</label>
                <textarea 
                  className="admin-input"
                  rows={3}
                  value={descriptions[activeLang] || ''}
                  onChange={e => setDescriptions({...descriptions, [activeLang]: e.target.value})}
                  placeholder="Ej: Accede al SIU Guaraní para completar el trámite..."
                />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="admin-card" style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Configuración</h4>
            </div>

            <div className="space-y-6">
              <div>
                <label className="admin-label">Tipo de Alerta</label>
                <select 
                  className="admin-input"
                  value={type}
                  onChange={e => setType(e.target.value)}
                >
                  <option value="info">Info (Azul)</option>
                  <option value="warning">Aviso (Amarillo)</option>
                  <option value="danger">Danger (Rojo)</option>
                  <option value="success">Éxito (Verde)</option>
                </select>
              </div>

              <div 
                onClick={() => setActive(!active)}
                style={{ 
                  cursor: 'pointer', padding: '1.25rem', borderRadius: '16px',
                  background: active ? '#f0fdf4' : '#f8fafc',
                  border: `2px solid ${active ? '#22c55e' : '#e2e8f0'}`,
                  display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'all 0.2s'
                }}
              >
                <div style={{ 
                  width: '20px', height: '20px', borderRadius: '6px', 
                  border: `2px solid ${active ? '#22c55e' : '#cbd5e1'}`,
                  background: active ? '#22c55e' : 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {active && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }} />}
                </div>
                <span style={{ fontWeight: 800, color: active ? '#166534' : '#64748b', fontSize: '0.85rem' }}>
                  {active ? 'Alerta Habilitada' : 'Alerta Desactivada'}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Previsualización Multi-idioma */}
      <div style={{ marginTop: '5rem' }}>
        <h3 style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2rem', letterSpacing: '0.1em', textAlign: 'center' }}>Previsualización en Vivo</h3>
        
        <div style={{ display: 'grid', gap: '2rem' }}>
          {(['es', 'en', 'pt'] as const).map((l, idx) => {
            const msg = messages[l];
            const desc = descriptions[l];
            if (!msg) return null;

            return (
              <div key={idx} style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', top: '-1rem', left: '1rem', fontSize: '10px', fontWeight: 800, background: '#f8fafc', padding: '0 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0', color: '#64748b' }}>{langNames[l]}</span>
                <div style={{ 
                  padding: '1.5rem 2.5rem', 
                  borderRadius: '24px', 
                  border: '1px solid',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  background: type === 'danger' ? '#fff1f2' : type === 'warning' ? '#fffbeb' : type === 'success' ? '#f0fdf4' : '#eff6ff',
                  borderColor: type === 'danger' ? '#fecdd3' : type === 'warning' ? '#fde68a' : type === 'success' ? '#bbf7d0' : '#bfdbfe',
                  color: type === 'danger' ? '#9f1239' : type === 'warning' ? '#92400e' : type === 'success' ? '#166534' : '#1e40af',
                  minHeight: '80px'
                }}>
                  <Bell size={28} style={{ flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflow: 'hidden' }}>
                    <span style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.02em', lineHeight: 1.1 }} dangerouslySetInnerHTML={{ __html: msg }} />
                    {desc && (
                      <span style={{ fontSize: '0.9rem', opacity: 0.8, fontWeight: 600 }} dangerouslySetInnerHTML={{ __html: desc }} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </form>
  );
}
