import { db } from "@/lib/db";
import { Plus, Bell, Clock, Edit } from "lucide-react";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { NotificationToggle } from "@/components/admin/NotificationToggle";
import { CountdownToggle } from "@/components/admin/CountdownToggle";
import { deleteNotification } from "@/lib/actions";

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

      <div style={{ height: '3rem' }} />

      <section className="space-y-8">
        <div className="admin-header">
          <div>
            <h2 className="admin-title">Cuentas Regresivas</h2>
            <p className="admin-subtitle">Configura los dos contadores globales (Izquierda y Derecha).</p>
          </div>
          {countdowns.length < 2 && (
            <Link href="/admin/countdowns/new" className="btn-primary" style={{ textDecoration: 'none' }}>
              <Plus size={18} />
              <span>Inicializar Slot</span>
            </Link>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          {[0, 1].map((index) => {
            const c = countdowns[index];
            const slotName = index === 0 ? "Slot Izquierdo" : "Slot Derecho";
            
            return (
              <div key={index} className="admin-card" style={{ 
                padding: '2rem', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1.5rem',
                border: c ? '1px solid #e2e8f0' : '2px dashed #e2e8f0',
                background: c ? 'white' : 'rgba(248, 250, 252, 0.5)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '12px', 
                      background: c?.isActive ? '#eff6ff' : '#f1f5f9', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: c?.isActive ? '#2563eb' : '#94a3b8'
                    }}>
                      <Clock size={20} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem' }}>
                        {c ? (c.title as any)?.es : slotName}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: c?.isActive ? '#22c55e' : '#64748b', fontWeight: 700 }}>
                        {c ? (c.isActive ? 'Habilitado' : 'No Habilitado') : 'Sin configurar'}
                      </p>
                    </div>
                  </div>
                  {c && <CountdownToggle id={c.id} initialActive={c.isActive} />}
                </div>

                {c ? (
                  <>
                    <div style={{ fontSize: '0.85rem', color: '#475569', minHeight: '1.2em', marginBottom: '0.75rem' }}>
                      {(c.description as any)?.es || 'Sin descripción'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ 
                        flex: 1,
                        fontSize: '0.8rem', fontWeight: 700, padding: '0.75rem 1rem', 
                        background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0',
                        display: 'flex', justifyContent: 'space-between'
                      }}>
                        <span style={{ color: '#64748b' }}>Meta:</span>
                        <span>{new Date(c.targetDate).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                      <Link 
                        href={`/admin/countdowns/${c.id}`} 
                        className="btn-secondary"
                        style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', height: 'fit-content' }}
                      >
                        <Edit size={16} />
                        <span>Editar</span>
                      </Link>
                    </div>
                  </>
                ) : (
                  <Link href="/admin/countdowns/new" style={{ 
                    height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    color: '#94a3b8', textDecoration: 'none', flexDirection: 'column', gap: '0.5rem' 
                  }}>
                    <Plus size={24} />
                    <span>Configurar este slot</span>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
