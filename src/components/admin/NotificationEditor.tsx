'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Bell, Globe } from 'lucide-react';
import { upsertNotification } from '@/lib/actions';

interface NotificationEditorProps {
  notification?: any;
}

export default function NotificationEditor({ notification }: NotificationEditorProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  // Form state
  const [messageEs, setMessageEs] = useState(notification?.message?.es || '');
  const [messageEn, setMessageEn] = useState(notification?.message?.en || '');
  const [messagePt, setMessagePt] = useState(notification?.message?.pt || '');
  
  const [descriptionEs, setDescriptionEs] = useState(notification?.description?.es || '');
  const [descriptionEn, setDescriptionEn] = useState(notification?.description?.en || '');
  const [descriptionPt, setDescriptionPt] = useState(notification?.description?.pt || '');

  const [type, setType] = useState(notification?.type || 'info');
  const [active, setActive] = useState(notification?.active ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      await upsertNotification({
        id: notification?.id,
        message: { es: messageEs, en: messageEn, pt: messagePt },
        description: { es: descriptionEs, en: descriptionEn, pt: descriptionPt },
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

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', paddingBottom: '5rem' }}>
      <div className="admin-header" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="admin-title" style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
            {notification ? 'Editar Alerta' : 'Nueva Alerta'}
          </h2>
          <p className="admin-subtitle" style={{ fontSize: '1.1rem', opacity: 0.6, margin: '0.5rem 0 0' }}>
            Personaliza el banner superior en múltiples idiomas.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="button" onClick={() => router.back()} className="btn-secondary" style={{ padding: '0.8rem 1.5rem', borderRadius: '12px' }}>
            <X size={18} />
            <span>Cancelar</span>
          </button>
          <button type="submit" disabled={isPending} className="btn-primary" style={{ padding: '0.8rem 2rem', borderRadius: '12px', fontWeight: 700 }}>
            <Save size={18} />
            <span>{isPending ? 'Guardando...' : 'Guardar Alerta'}</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '2.5rem' }}>
        {/* Contenido Principal */}
        <div className="space-y-8">
          {/* Idiomas */}
          {[
            { id: 'es', label: '🇦🇷 Español', msg: messageEs, setMsg: setMessageEs, desc: descriptionEs, setDesc: setDescriptionEs },
            { id: 'en', label: '🇺🇸 Inglés', msg: messageEn, setMsg: setMessageEn, desc: descriptionEn, setDesc: setDescriptionEn },
            { id: 'pt', label: '🇧🇷 Portugués', msg: messagePt, setMsg: setMessagePt, desc: descriptionPt, setDesc: setDescriptionPt },
          ].map((lang) => (
            <div key={lang.id} className="admin-card" style={{ padding: '2.5rem', borderRadius: '32px', background: 'white', border: '1px solid #eef2f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{lang.label}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#64748b' }}>Título del mensaje</label>
                  <input 
                    required={lang.id === 'es'}
                    style={{ width: '100%', padding: '1.1rem', borderRadius: '16px', border: '2px solid #f1f5f9', fontSize: '1.1rem', fontWeight: 700 }}
                    value={lang.msg}
                    onChange={e => lang.setMsg(e.target.value)}
                    placeholder="Escribe el titular aquí..."
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#64748b' }}>Descripción (Opcional)</label>
                  <textarea 
                    style={{ width: '100%', padding: '1.1rem', borderRadius: '16px', border: '2px solid #f1f5f9', fontSize: '1rem', minHeight: '80px', fontFamily: 'inherit' }}
                    value={lang.desc}
                    onChange={e => lang.setDesc(e.target.value)}
                    placeholder="Información adicional o instrucciones..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Barra Lateral de Configuración */}
        <div className="space-y-6">
          <div className="admin-card" style={{ padding: '2rem', borderRadius: '32px', background: 'white', border: '1px solid #eef2f6', position: 'sticky', top: '2rem' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>Ajustes</label>
            
            <div className="space-y-6">
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Tipo de Alerta</label>
                <select 
                  style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '2px solid #f1f5f9', fontWeight: 600, fontSize: '0.9rem' }}
                  value={type}
                  onChange={e => setType(e.target.value)}
                >
                  <option value="info">Info (Azul)</option>
                  <option value="warning">Warning (Amarillo)</option>
                  <option value="danger">Danger (Rojo)</option>
                </select>
              </div>

              <div style={{ paddingTop: '1.5rem', borderTop: '2px solid #f8fafc' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox"
                    checked={active}
                    onChange={e => setActive(e.target.checked)}
                    style={{ width: '24px', height: '24px', accentColor: 'var(--accent)', cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: 700 }}>Activar Banner</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Previsualización Multi-idioma */}
      <div style={{ marginTop: '5rem' }}>
        <h3 style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2rem', letterSpacing: '0.1em', textAlign: 'center' }}>Previsualización en Vivo</h3>
        
        <div style={{ display: 'grid', gap: '2rem' }}>
          {[
            { label: 'Español', msg: messageEs, desc: descriptionEs },
            { label: 'English', msg: messageEn, desc: descriptionEn },
            { label: 'Português', msg: messagePt, desc: descriptionPt }
          ].filter(p => p.msg).map((prev, idx) => (
            <div key={idx} style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', top: '-1rem', left: '1rem', fontSize: '10px', fontWeight: 800, background: '#f8fafc', padding: '0 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0', color: '#64748b' }}>{prev.label}</span>
              <div style={{ 
                padding: '1.5rem 2.5rem', 
                borderRadius: '24px', 
                border: '1px solid',
                display: 'flex',
                alignItems: 'center',
                gap: '2rem',
                background: type === 'danger' ? '#fff1f2' : type === 'warning' ? '#fffbeb' : '#eff6ff',
                borderColor: type === 'danger' ? '#fecdd3' : type === 'warning' ? '#fde68a' : '#bfdbfe',
                color: type === 'danger' ? '#9f1239' : type === 'warning' ? '#92400e' : '#1e40af',
                minHeight: '80px'
              }}>
                <Bell size={28} style={{ flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflow: 'hidden' }}>
                  <span style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{prev.msg}</span>
                  {prev.desc && <span style={{ fontSize: '0.9rem', opacity: 0.8, fontWeight: 600 }}>{prev.desc}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
