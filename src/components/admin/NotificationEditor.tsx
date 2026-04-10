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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="admin-header">
        <div>
          <h2 className="admin-title">{notification ? 'Editar Alerta' : 'Nueva Alerta'}</h2>
          <p className="admin-subtitle">Configura el banner de notificación superior.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            type="button" 
            onClick={() => router.back()}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', textDecoration: 'none' }}
          >
            <X size={18} />
            <span>Cancelar</span>
          </button>
          <button 
            type="submit" 
            disabled={isPending}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem' }}
          >
            <Save size={18} />
            <span>{isPending ? 'Guardando...' : 'Guardar Alerta'}</span>
          </button>
        </div>
      </div>

      <div className="admin-card space-y-6" style={{ maxWidth: '800px' }}>
        <div className="space-y-4">
          <label className="admin-label">Mensaje de la Alerta (Traducciones)</label>
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>🇦🇷 Español</span>
            <input 
              required
              className="admin-input"
              value={messageEs}
              onChange={e => setMessageEs(e.target.value)}
              placeholder="Ej: ¡ALERTA DE SEGURIDAD!..."
            />
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>🇺🇸 Inglés</span>
            <input 
              className="admin-input"
              value={messageEn}
              onChange={e => setMessageEn(e.target.value)}
              placeholder="Ej: SECURITY ALERT!..."
            />
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>🇧🇷 Portugués</span>
            <input 
              className="admin-input"
              value={messagePt}
              onChange={e => setMessagePt(e.target.value)}
              placeholder="Ej: ALERTA DE SEGURANÇA!..."
            />
          </div>
        </div>

        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <label className="admin-label">Tipo de Alerta</label>
            <select 
              className="admin-input"
              value={type}
              onChange={e => setType(e.target.value)}
              style={{ padding: '0.75rem' }}
            >
              <option value="info">Info (Azul)</option>
              <option value="warning">Warning (Amarillo)</option>
              <option value="danger">Danger (Rojo)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', height: '100%', paddingTop: '1.5rem' }}>
            <input 
              type="checkbox"
              id="active"
              checked={active}
              onChange={e => setActive(e.target.checked)}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <label htmlFor="active" style={{ fontWeight: 700, cursor: 'pointer' }}>Mostrar alerta ahora</label>
          </div>
        </div>
      </div>

      {/* Preview Card */}
      <h3 style={{ fontSize: '1rem', fontWeight: 800, marginTop: '3rem' }}>Previsualización</h3>
      <div style={{ 
        padding: '1.25rem 1.75rem', 
        borderRadius: '24px', 
        border: '1px solid',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        background: type === 'danger' ? '#fff1f2' : type === 'warning' ? '#fffbeb' : '#eff6ff',
        borderColor: type === 'danger' ? '#fecdd3' : type === 'warning' ? '#fde68a' : '#bfdbfe',
        color: type === 'danger' ? '#9f1239' : type === 'warning' ? '#92400e' : '#1e40af',
        maxWidth: '800px'
      }}>
        <Bell size={22} />
        <span style={{ fontWeight: 900 }}>{messageEs || 'Escribe un mensaje para ver la previsualización...'}</span>
      </div>
    </form>
  );
}
