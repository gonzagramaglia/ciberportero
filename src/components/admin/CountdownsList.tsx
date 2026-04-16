'use client';

import { Plus, Clock, Edit, ExternalLink } from "lucide-react";
import Link from "next/link";
import { CountdownToggle } from "@/components/admin/CountdownToggle";

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
                        {c ? (c.slot === 'left' ? 'IZQUIERDA ' : 'DERECHA ') : ''}
                        {c ? (c.isActive ? '/ HABILITADO' : '/ DESACTIVADO') : 'Sin configuración'}
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
                        <span style={{ color: '#94a3b8', fontSize: '10px' }}>DEADLINE:</span>
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
    </div>
  );
}
