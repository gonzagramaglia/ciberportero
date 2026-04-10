import { db } from "@/lib/db";
import { Plus, Bell, Clock, Edit } from "lucide-react";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { NotificationToggle } from "@/components/admin/NotificationToggle";

export default async function AdminNotificationsPage() {
  const notifications = await db.notification.findMany({ orderBy: { createdAt: 'desc' } });
  const countdowns = await db.countdown.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="space-y-16">
      <section className="space-y-8">
        <div className="admin-header">
          <div>
            <h2 className="admin-title">Notificaciones</h2>
            <p className="admin-subtitle">Banners de alerta en la parte superior del sitio.</p>
          </div>
          <Link href="/admin/notifications/new" className="btn-primary" style={{ textDecoration: 'none' }}>
            <Plus size={18} />
            <span>Nueva Alerta</span>
          </Link>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {notifications.map(n => (
            <div key={n.id} style={{ 
              padding: '1.25rem 1.75rem', 
              borderRadius: '24px', 
              border: '1px solid',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: n.type === 'danger' ? '#fff1f2' : n.type === 'warning' ? '#fffbeb' : '#eff6ff',
              borderColor: n.type === 'danger' ? '#fecdd3' : n.type === 'warning' ? '#fde68a' : '#bfdbfe',
              color: n.type === 'danger' ? '#9f1239' : n.type === 'warning' ? '#92400e' : '#1e40af'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <Bell size={22} style={{ color: n.type === 'danger' ? '#9f1239' : 'inherit' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                  <span style={{ 
                    fontWeight: 900, 
                    fontSize: '1rem', 
                    letterSpacing: '-0.01em',
                    color: n.type === 'danger' ? '#9f1239' : 'inherit' 
                  }}>
                    {(n.message as any)?.es || 'Sin mensaje'}
                  </span>
                  <span style={{ fontSize: '11px', opacity: 0.7, fontWeight: 700, textTransform: 'uppercase' }}>Tipo: {n.type}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: 'white', padding: '0.4rem 0.6rem', borderRadius: '12px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <NotificationToggle id={n.id} initialActive={n.active} />
                </div>
                <Link 
                  href={`/admin/notifications/${n.id}`} 
                  style={{ 
                    width: '38px', height: '38px', borderRadius: '50%', background: 'white', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#64748b', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'all 0.2s'
                  }}
                >
                  <Edit size={18} />
                </Link>
                <div style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderRadius: '50%', background: 'white' }}>
                  <DeleteButton id={n.id} type="notification" />
                </div>
              </div>
            </div>
          ))}
          {notifications.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontStyle: 'italic' }}>No hay alertas configuradas.</p>}
        </div>
      </section>

      <div style={{ height: '2rem' }} /> {/* Espaciador extra solicitado */}

      <section className="space-y-8">
        <div className="admin-header">
          <div>
            <h2 className="admin-title">Cuentas Regresivas</h2>
            <p className="admin-subtitle">Widgets laterales con cuenta atrás para fechas importantes.</p>
          </div>
          <Link href="/admin/countdowns/new" className="btn-primary" style={{ textDecoration: 'none' }}>
            <Plus size={18} />
            <span>Nuevo Contador</span>
          </Link>
        </div>

        <div className="stats-grid">
          {countdowns.map(c => (
            <div key={c.id} className="admin-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                  <Clock size={16} style={{ color: '#2563eb' }} />
                  {(c.title as any)?.es || 'Sin título'}
                </div>
                {/* Aquí también podríamos poner un toggle */}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>{(c.description as any)?.es || '-'}</p>
              <div style={{ fontSize: '0.75rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                Meta: {c.targetDate.toLocaleString()}
              </div>
              <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <Link href={`/admin/countdowns/${c.id}`} style={{ color: '#94a3b8', padding: '0.5rem' }}>
                  <Edit size={18} />
                </Link>
                {/* Reutilizaremos DeleteButton cuando lo extendamos */}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
