'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X } from 'lucide-react';
import { upsertNotification } from '@/lib/actions';
import LanguageTabs from './LanguageTabs';

interface NotificationEditorProps {
  notification?: any;
}

export default function NotificationEditor({ notification }: NotificationEditorProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [activeLang, setActiveLang] = useState<'es' | 'en' | 'pt'>('es');

  // Form state
  const [messages, setMessages] = useState<any>(notification?.message || { es: '', en: '', pt: '' });
  const [descriptions, setDescriptions] = useState<any>(notification?.description || { es: '', en: '', pt: '' });
  const [type, setType] = useState(notification?.type || 'info');
  const [active, setActive] = useState(notification?.active ?? true);
  const [url, setUrl] = useState(notification?.url || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      await upsertNotification({
        id: notification?.id,
        message: messages,
        description: descriptions,
        type,
        active,
        url
      });
      router.push(`/admin/notifications?success=${encodeURIComponent(messages.es)}&message=${encodeURIComponent('Notificación guardada')}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error al guardar la notificación');
    } finally {
      setIsPending(false);
    }
  };

  const updateMessage = (val: string) => {
    setMessages({ ...messages, [activeLang]: val });
  };

  const updateDescription = (val: string) => {
    setDescriptions({ ...descriptions, [activeLang]: val });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12 fade-in">
      <div className="admin-header">
        <div>
          <h2 className="admin-title">{notification ? 'Editar Notificación' : 'Nueva Notificación Global'}</h2>
          <p className="admin-subtitle">Configura el mensaje que aparecerá en el banner superior.</p>
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

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3.5rem' }}>
        <div className="space-y-8">
          <LanguageTabs active={activeLang} onChange={setActiveLang} />
          
          <section className="admin-card" style={{ padding: '3rem', borderRadius: '32px' }}>
            <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>Mensaje del Banner</h3>
            </div>

            <div className="space-y-10">
              <div>
                <label className="admin-label" style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Título del mensaje ({activeLang})</label>
                <input 
                  className="admin-input"
                  style={{ fontSize: '1.5rem', fontWeight: 900, padding: '1.25rem', borderRadius: '16px' }}
                  value={messages[activeLang] || ''}
                  onChange={e => updateMessage(e.target.value)}
                  placeholder="Ej: ¡Nuevo contenido disponible!"
                  required={activeLang === 'es'}
                />
              </div>

              <div>
                <label className="admin-label" style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Descripción / Texto Extra ({activeLang})</label>
                <textarea 
                  className="admin-input"
                  rows={4}
                  style={{ fontSize: '1.1rem', fontWeight: 600, padding: '1.25rem', borderRadius: '16px', lineHeight: 1.6, background: '#f8fafc' }}
                  value={descriptions[activeLang] || ''}
                  onChange={e => updateDescription(e.target.value)}
                  placeholder="Texto adicional..."
                />
              </div>

              <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '2px dashed #f1f5f9' }}>
                <label className="admin-label" style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>URL de destino (OPCIONAL)</label>
                <input 
                  type="url"
                  className="admin-input"
                  style={{ fontSize: '1rem', fontWeight: 700, padding: '1.1rem', borderRadius: '16px' }}
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://..."
                />
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.75rem', fontStyle: 'italic', fontWeight: 500 }}>
                  * Al hacer click en el banner, se abrirá este link.
                </p>
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
                <label className="admin-label" style={{ marginBottom: '0.75rem', fontWeight: 800 }}>Tipo de Alerta</label>
                <select 
                  className="admin-input" 
                  style={{ padding: '0.8rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                  value={type} 
                  onChange={e => setType(e.target.value)}
                >
                  <option value="info">Info (Azul)</option>
                  <option value="success">Éxito (Verde)</option>
                  <option value="warning">Aviso (Amarillo)</option>
                  <option value="danger">Crítico (Rojo)</option>
                </select>
              </div>

              <div 
                onClick={() => setActive(!active)}
                style={{ 
                  cursor: 'pointer', padding: '1.5rem', borderRadius: '20px', 
                  background: active ? '#f0fdf4' : '#fff1f2',
                  border: `2px solid ${active ? '#22c55e' : '#fecdd3'}`,
                  display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div style={{ 
                  width: '44px', height: '24px', borderRadius: '12px', 
                  background: active ? '#22c55e' : '#cbd5e1', position: 'relative' 
                }}>
                  <div style={{ 
                    width: '18px', height: '18px', borderRadius: '50%', background: 'white', 
                    position: 'absolute', top: '3px', left: active ? '23px' : '3px', transition: 'all 0.2s' 
                  }} />
                </div>
                <span style={{ fontWeight: 900, color: active ? '#166534' : '#9f1239', fontSize: '0.95rem' }}>
                  {active ? 'BANNER ACTIVO' : 'PAUSADO'}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
