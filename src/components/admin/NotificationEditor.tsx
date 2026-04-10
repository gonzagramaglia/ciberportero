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

  // Form state
  const [messageEs, setMessageEs] = useState(notification?.message?.es || '');
  const [messageEn, setMessageEn] = useState(notification?.message?.en || '');
  const [messagePt, setMessagePt] = useState(notification?.message?.pt || '');
  const [type, setType] = useState(notification?.type || 'info');
  const [active, setActive] = useState(notification?.active ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      await upsertNotification({
        id: notification?.id,
        message: { es: messageEs, en: messageEn, pt: messagePt },
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
    <form onSubmit={handleSubmit} style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '5rem' }}>
      <div className="admin-header" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="admin-title" style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0 }}>
            {notification ? 'Editar Alerta' : 'Nueva Alerta'}
          </h2>
          <p className="admin-subtitle" style={{ fontSize: '1.1rem', opacity: 0.6, margin: '0.5rem 0 0' }}>
            Configura el banner superior del sitio.
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

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2.5rem' }}>
        {/* Contenido */}
        <div className="admin-card" style={{ padding: '2.5rem', borderRadius: '32px', background: 'white', border: '1px solid #eef2f6' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '2rem', color: '#1e293b' }}>Mensaje de la Alerta</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>🇦🇷 Español</label>
              <input 
                required
                style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '2px solid #f1f5f9', fontSize: '1rem' }}
                value={messageEs}
                onChange={e => setMessageEs(e.target.value)}
                placeholder="¡ALERTA DE SEGURIDAD!..."
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>🇺🇸 Inglés</label>
              <input 
                style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '2px solid #f1f5f9', fontSize: '1rem' }}
                value={messageEn}
                onChange={e => setMessageEn(e.target.value)}
                placeholder="Security alert message..."
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>🇧🇷 Portugués</label>
              <input 
                style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '2px solid #f1f5f9', fontSize: '1rem' }}
                value={messagePt}
                onChange={e => setMessagePt(e.target.value)}
                placeholder="Alerta de segurança..."
              />
            </div>
          </div>
        </div>

        {/* Configuración */}
        <div className="space-y-6">
          <div className="admin-card" style={{ padding: '2rem', borderRadius: '32px', background: 'white', border: '1px solid #eef2f6' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1rem' }}>Tipo de Alerta</label>
            <select 
              style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '2px solid #f1f5f9', fontWeight: 600 }}
              value={type}
              onChange={e => setType(e.target.value)}
            >
              <option value="info">Info (Azul)</option>
              <option value="warning">Warning (Amarillo)</option>
              <option value="danger">Danger (Rojo)</option>
            </select>

            <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '2px solid #f8fafc' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox"
                  checked={active}
                  onChange={e => setActive(e.target.checked)}
                  style={{ width: '22px', height: '22px', accentColor: 'var(--accent)' }}
                />
                <span style={{ fontWeight: 700 }}>Mostrar alerta ahora</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '4rem' }}>
        <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Previsualización en vivo</h4>
        <div style={{ 
          padding: '1.5rem 2.5rem', 
          borderRadius: '24px', 
          border: '1px solid',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          background: type === 'danger' ? '#fff1f2' : type === 'warning' ? '#fffbeb' : '#eff6ff',
          borderColor: type === 'danger' ? '#fecdd3' : type === 'warning' ? '#fde68a' : '#bfdbfe',
          color: type === 'danger' ? '#9f1239' : type === 'warning' ? '#92400e' : '#1e40af',
        }}>
          <Bell size={24} />
          <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>{messageEs || 'Escribe un mensaje...'}</span>
        </div>
      </div>
    </form>
  );
}
