import { db } from "@/lib/db";
import { Plus, Bell, Clock, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

export default async function AdminNotificationsPage() {
  const notifications = await db.notification.findMany({ orderBy: { createdAt: 'desc' } });
  const countdowns = await db.countdown.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <div className="admin-header">
          <div>
            <h2 className="admin-title">Notificaciones</h2>
            <p className="admin-subtitle">Banners de alerta en la parte superior del sitio.</p>
          </div>
          <button className="btn-primary">
            <Plus size={18} />
            <span>Nueva Alerta</span>
          </button>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {notifications.map(n => (
            <div key={n.id} style={{ 
              padding: '1rem', 
              borderRadius: '16px', 
              border: '1px solid',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: n.type === 'danger' ? '#fff1f2' : n.type === 'warning' ? '#fffbeb' : '#eff6ff',
              borderColor: n.type === 'danger' ? '#fecdd3' : n.type === 'warning' ? '#fde68a' : '#bfdbfe',
              color: n.type === 'danger' ? '#9f1239' : n.type === 'warning' ? '#92400e' : '#1e40af'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Bell size={18} />
                <span style={{ fontWeight: 600 }}>{(n.message as any)?.es || 'Sin mensaje'}</span>
                {n.active ? (
                  <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', padding: '0.1rem 0.4rem', background: '#bbf7d0', color: '#166534', borderRadius: '4px' }}>Activa</span>
                ) : (
                  <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', padding: '0.1rem 0.4rem', background: '#e2e8f0', color: '#475569', borderRadius: '4px' }}>Inactiva</span>
                )}
              </div>
              <button style={{ background: 'none', border: 'none', color: 'inherit', opacity: 0.5, cursor: 'pointer' }}><Trash2 size={16} /></button>
            </div>
          ))}
          {notifications.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontStyle: 'italic' }}>No hay alertas configuradas.</p>}
        </div>
      </section>

      <section className="space-y-6">
        <div className="admin-header">
          <div>
            <h2 className="admin-title">Cuentas Regresivas</h2>
            <p className="admin-subtitle">Widgets laterales con cuenta atrás para fechas importantes.</p>
          </div>
          <button className="btn-primary">
            <Plus size={18} />
            <span>Nuevo Contador</span>
          </button>
        </div>

        <div className="stats-grid">
          {countdowns.map(c => (
            <div key={c.id} className="admin-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                  <Clock size={16} style={{ color: '#2563eb' }} />
                  {(c.title as any)?.es || 'Sin título'}
                </div>
                {c.isActive ? <ToggleRight style={{ color: '#22c55e' }} /> : <ToggleLeft style={{ color: '#94a3b8' }} />}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>{(c.description as any)?.es || '-'}</p>
              <div style={{ fontSize: '0.75rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                Meta: {c.targetDate.toLocaleString()}
              </div>
              <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
