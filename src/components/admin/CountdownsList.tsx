'use client';

import { Plus, Clock, Edit, ExternalLink } from "lucide-react";
import Link from "next/link";
import { CountdownToggle } from "@/components/admin/CountdownToggle";
import AdminItemNotes from "@/components/admin/AdminItemNotes";

interface Props {
  countdowns: any[];
}

export default function CountdownsList({ countdowns }: Props) {
  return (
    <div className="space-y-8 fade-in">
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '3rem 2rem' }}>
          {[0, 1].map((index) => {
            const slotValue = index === 0 ? "left" : "right";
            const c = countdowns.find(item => item.slot === slotValue);
            const slotLabel = index === 0 ? "IZQUIERDA" : "DERECHA";
            
            return (
              <div key={index} style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="admin-card" style={{ 
                  padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
                  border: c ? '1px solid #e2e8f0' : '2px dashed #e2e8f0',
                  background: c ? 'white' : 'rgba(248, 250, 252, 0.5)',
                  boxShadow: c ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : 'none',
                  flex: 1
                }}>
                  <div className="admin-card-row">
                    <div className="admin-flex-center">
                      <div style={{ 
                        width: '48px', height: '48px', borderRadius: '16px', 
                        background: c?.isActive ? '#eff6ff' : '#f1f5f9', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: c?.isActive ? 'var(--accent)' : '#94a3b8'
                      }}>
                        <Clock size={24} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
                          {c ? (c.title as any)?.es : `Espacio ${slotLabel}`}
                        </h4>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                          <span style={{ 
                            fontSize: '9px', fontWeight: 900, padding: '2px 6px', borderRadius: '6px',
                            background: index === 0 ? '#3b82f6' : '#8b5cf6', color: 'white'
                          }}>
                            {slotLabel}
                          </span>
                          <span style={{ 
                            fontSize: '9px', fontWeight: 900, padding: '2px 6px', borderRadius: '6px',
                            background: c?.isActive ? '#22c55e' : '#94a3b8', color: 'white'
                          }}>
                            {c ? (c.isActive ? 'HABILITADO' : 'DESACTIVADO') : 'VACÍO'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {c && (
                      <div style={{ background: 'white', padding: '0.4rem 0.6rem', borderRadius: '12px', display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <CountdownToggle id={c.id} initialActive={c.isActive} />
                      </div>
                    )}
                  </div>

                  {c ? (
                    <>
                      <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0, minHeight: '3rem' }}>
                        {(c.description as any)?.es || 'Sin descripción'}
                      </p>
                      <div className="admin-card-row" style={{ marginTop: '0.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ color: '#94a3b8', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>Deadline:</span>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                            {new Date(c.targetDate).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                        <Link href={`/admin/countdowns/${c.id}`} style={{ 
                          width: '40px', height: '40px', borderRadius: '12px', background: 'white', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                          <Edit size={18} />
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed #e2e8f0', borderRadius: '16px', padding: '2rem' }}>
                      <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>Espacio disponible</p>
                    </div>
                  )}
                </div>
                {c && <AdminItemNotes id={c.id} type="countdown" initialNotes={c.adminNotes} />}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
