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

        <div className="space-y-8">
          {notifications.map(n => (
            <div key={n.id} className="admin-card-row" style={{ 
              padding: '1.25rem 1.75rem', 
              borderRadius: '24px', 
              border: '1px solid',
              background: n.type === 'danger' ? '#fff1f2' : n.type === 'warning' ? '#fffbeb' : '#f8fafc',
              borderColor: n.type === 'danger' ? '#fecdd3' : n.type === 'warning' ? '#fde68a' : '#e2e8f0',
              color: n.type === 'danger' ? '#9f1239' : n.type === 'warning' ? '#92400e' : '#1e40af'
            }}>
              <div className="admin-flex-center" style={{ minWidth: 0, flex: 1 }}>
                <Bell size={20} style={{ color: n.type === 'danger' ? '#9f1239' : 'inherit', flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', minWidth: 0 }}>
                  <span style={{ 
                    fontWeight: 900, 
                    fontSize: '0.95rem', 
                    lineHeight: '1.2',
                    letterSpacing: '-0.01em',
                    color: n.type === 'danger' ? '#9f1239' : 'inherit',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {(n.message as any)?.es || 'Sin mensaje'}
                  </span>
                  <span style={{ fontSize: '10px', opacity: 0.7, fontWeight: 700, textTransform: 'uppercase' }}>{n.type}</span>
                </div>
              </div>
              <div className="admin-card-actions">
                <div style={{ background: 'white', padding: '0.3rem 0.5rem', borderRadius: '10px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                  <NotificationToggle id={n.id} initialActive={n.active} />
                </div>
                <Link 
                  href={`/admin/notifications/${n.id}`} 
                  style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', background: 'white', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#64748b', border: '1px solid #e2e8f0', transition: 'all 0.2s'
                  }}
                  title="Editar"
                >
                  <Edit size={14} />
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
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
                <div className="admin-card-row">
                  <div className="admin-flex-center">
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '12px', 
                      background: c?.isActive ? '#eff6ff' : '#f1f5f9', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: c?.isActive ? '#2563eb' : '#94a3b8'
                    }}>
                      <Clock size={20} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1rem' }}>
                        {c ? (c.title as any)?.es : slotName}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: c?.isActive ? '#22c55e' : '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>
                        {c ? (c.isActive ? 'Habilitado' : 'No Habilitado') : 'Sin configurar'}
                      </p>
                    </div>
                  </div>
                  {c && (
                    <div style={{ background: 'white', padding: '0.3rem 0.5rem', borderRadius: '10px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                      <CountdownToggle id={c.id} initialActive={c.isActive} />
                    </div>
                  )}
                </div>

                {c ? (
                  <>
                    <p style={{ fontSize: '0.9rem', color: '#475569', margin: 0 }}>
                      {(c.description as any)?.es || 'Sin descripción'}
                    </p>
                    <div className="admin-card-row" style={{ marginTop: '0.5rem' }}>
                      <div style={{ 
                        flex: 1,
                        fontSize: '0.75rem', fontWeight: 800, padding: '0.75rem 1rem', 
                        background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}>
                        <span style={{ color: '#94a3b8', textTransform: 'uppercase', fontSize: '10px' }}>Meta:</span>
                        <span>
                          {new Date(c.targetDate).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                      <Link 
                        href={`/admin/countdowns/${c.id}`} 
                        style={{ 
                          width: '36px', height: '36px', borderRadius: '50%', background: 'white', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#64748b', border: '1px solid #e2e8f0', transition: 'all 0.2s',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}
                        title="Editar"
                      >
                        <Edit size={16} />
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
