'use client';

import { Plus, Bell, Clock, Edit, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { NotificationToggle } from "@/components/admin/NotificationToggle";
import { CountdownToggle } from "@/components/admin/CountdownToggle";

interface Props {
  notifications: any[];
  countdowns: any[];
}

export default function NotificationsClient({ notifications, countdowns }: Props) {
  const [activeTab, setActiveTab] = useState<'notifications' | 'countdowns'>('notifications');

  return (
    <div className="space-y-8 fade-in">
      {/* Tabs Selector */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1px' }}>
        <button 
          onClick={() => setActiveTab('notifications')}
          style={{ 
            padding: '1rem 2rem', border: 'none', background: 'none', cursor: 'pointer',
            fontSize: '1rem', fontWeight: 800, color: activeTab === 'notifications' ? 'var(--accent)' : '#94a3b8',
            borderBottom: `3px solid ${activeTab === 'notifications' ? 'var(--accent)' : 'transparent'}`,
            transition: 'all 0.2s', marginBottom: '-2px'
          }}
        >
          Notificaciones
        </button>
        <button 
          onClick={() => setActiveTab('countdowns')}
          style={{ 
            padding: '1rem 2rem', border: 'none', background: 'none', cursor: 'pointer',
            fontSize: '1rem', fontWeight: 800, color: activeTab === 'countdowns' ? 'var(--accent)' : '#94a3b8',
            borderBottom: `3px solid ${activeTab === 'countdowns' ? 'var(--accent)' : 'transparent'}`,
            transition: 'all 0.2s', marginBottom: '-2px'
          }}
        >
          Cuentas Regresivas
        </button>
      </div>

      {activeTab === 'notifications' ? (
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
              <span>Nueva Alerta</span>
            </Link>
          </div>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {notifications.map(n => (
              <div key={n.id} className="admin-card-row" style={{ 
                padding: '1.5rem 2rem', borderRadius: '24px', border: '1px solid',
                background: n.type === 'danger' ? '#fff1f2' : n.type === 'warning' ? '#fffbeb' : n.type === 'success' ? '#f0fdf4' : '#f8fafc',
                borderColor: n.type === 'danger' ? '#fecdd3' : n.type === 'warning' ? '#fde68a' : n.type === 'success' ? '#bbf7d0' : '#e2e8f0',
                color: n.type === 'danger' ? '#9f1239' : n.type === 'warning' ? '#92400e' : n.type === 'success' ? '#166534' : '#1e40af'
              }}>
                <div className="admin-flex-center" style={{ minWidth: 0, flex: 1 }}>
                  <Bell size={24} style={{ flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                      {(n.message as any)?.es || 'Sin mensaje'}
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
            ))}
            {notifications.length === 0 && <p style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8', fontStyle: 'italic' }}>No hay alertas configuradas.</p>}
          </div>
        </section>
      ) : (
        <section className="space-y-8">
          <div className="admin-header">
            <div>
              <h2 className="admin-title">Cuentas Regresivas</h2>
              <p className="admin-subtitle">
                Configura los contadores globales.
                <Link href="/" target="_blank" style={{ marginLeft: '0.75rem', color: 'var(--accent)', fontWeight: 700, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  Ver sitio <ExternalLink size={14} />
                </Link>
              </p>
            </div>
            {countdowns.length < 2 && (
              <Link href="/admin/countdowns/new" className="btn-primary" style={{ textDecoration: 'none' }}>
                <Plus size={18} />
                <span>Nuevo Contador</span>
              </Link>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {[0, 1].map((index) => {
              const c = countdowns[index];
              const slotName = index === 0 ? "Slot Izquierdo" : "Slot Derecho";
              
              return (
                <div key={index} className="admin-card" style={{ 
                  padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
                  border: c ? '1px solid #e2e8f0' : '2px dashed #e2e8f0',
                  background: c ? 'white' : 'rgba(248, 250, 252, 0.5)',
                  minHeight: '220px'
                }}>
                  <div className="admin-card-row">
                    <div className="admin-flex-center">
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: '12px', 
                        background: c?.isActive ? '#eff6ff' : '#f1f5f9', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: c?.isActive ? 'var(--accent)' : '#94a3b8'
                      }}>
                        <Clock size={20} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem' }}>{c ? (c.title as any)?.es : slotName}</h4>
                        <p style={{ margin: 0, fontSize: '10px', color: c?.isActive ? '#22c55e' : '#94a3b8', fontWeight: 900, textTransform: 'uppercase' }}>
                          {c ? (c.isActive ? 'Habilitado' : 'Desactivado') : 'Sin configuración'}
                        </p>
                      </div>
                    </div>
                    {c && (
                      <div style={{ background: 'white', padding: '0.3rem 0.5rem', borderRadius: '10px', display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0' }}>
                        <CountdownToggle id={c.id} initialActive={c.isActive} />
                      </div>
                    )}
                  </div>

                  {c ? (
                    <>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, flex: 1 }}>{(c.description as any)?.es || 'Sin descripción'}</p>
                      <div className="admin-card-row" style={{ marginTop: '0.5rem' }}>
                        <div style={{ 
                          flex: 1, fontSize: '0.75rem', fontWeight: 800, padding: '0.6rem 0.8rem', 
                          background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0',
                          display: 'flex', justifyContent: 'space-between'
                        }}>
                          <span style={{ color: '#94a3b8', fontSize: '10px' }}>META:</span>
                          <span>{new Date(c.targetDate).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                        <Link href={`/admin/countdowns/${c.id}`} style={{ 
                          width: '32px', height: '32px', borderRadius: '50%', background: 'white', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', border: '1px solid #e2e8f0'
                        }}>
                          <Edit size={14} />
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>Disponible para configurar</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
