'use client';

import { Plus, Bell, Edit, ExternalLink } from "lucide-react";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { NotificationToggle } from "@/components/admin/NotificationToggle";

interface Props {
  notifications: any[];
}

export default function NotificationsList({ notifications }: Props) {
  return (
    <div className="space-y-8 fade-in">
      <section className="space-y-8">
        <div className="admin-header">
          <div>
            <h2 className="admin-title">Notificaciones</h2>
            <p className="admin-subtitle">
              Banners de alerta en la parte superior. 
              <Link href="/" target="_blank" style={{ marginLeft: '0.75rem', color: 'var(--accent)', fontWeight: 700, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                Ver sitio <ExternalLink size={14} />
              </Link>
            </p>
          </div>
          <Link href="/admin/notifications/new" className="btn-primary" style={{ textDecoration: 'none' }}>
            <Plus size={18} />
            <span>Nueva Notificación</span>
          </Link>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {notifications.map(n => {
            const message = typeof n.message === 'object' ? n.message.es : n.message;
            return (
              <div key={n.id} style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="admin-card-row" style={{ 
                  padding: '1.5rem 2rem', borderRadius: '24px', border: '1px solid',
                  background: n.type === 'danger' ? '#fff1f2' : n.type === 'warning' ? '#fffbeb' : n.type === 'success' ? '#f0fdf4' : '#f8fafc',
                  borderColor: n.type === 'danger' ? '#fecdd3' : n.type === 'warning' ? '#fde68a' : n.type === 'success' ? '#bbf7d0' : '#e2e8f0',
                  color: n.type === 'danger' ? '#9f1239' : n.type === 'warning' ? '#92400e' : n.type === 'success' ? '#166534' : '#1e40af',
                  marginBottom: '0'
                }}>
                  <div className="admin-flex-center" style={{ minWidth: 0, flex: 1 }}>
                    <Bell size={24} style={{ flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                        {message || 'Sin mensaje'}
                      </span>
                      <span style={{ fontSize: '10px', opacity: 0.7, fontWeight: 800, textTransform: 'uppercase', marginTop: '0.2rem' }}>{n.type}</span>
                    </div>
                  </div>
                  <div className="admin-card-actions">
                    <div style={{ background: 'white', padding: '0.4rem 0.6rem', borderRadius: '12px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                      <NotificationToggle id={n.id} initialActive={n.active} />
                    </div>
                    <Link 
                      href={`/admin/notifications/${n.id}`} 
                      style={{ 
                        width: '36px', height: '36px', borderRadius: '50%', background: 'white', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#64748b', border: '1px solid #e2e8f0', transition: 'all 0.2s'
                      }}
                    >
                      <Edit size={16} />
                    </Link>
                    <DeleteButton id={n.id} type="notification" />
                  </div>
                </div>
              </div>
            );
          })}
          {notifications.length === 0 && <p style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8', fontStyle: 'italic' }}>No hay notificaciones configuradas.</p>}
        </div>
      </section>
    </div>
  );
}
