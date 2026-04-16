'use client';

import { Plus, Clock, Edit, ExternalLink } from "lucide-react";
import Link from "next/link";
import { CountdownToggle } from "@/components/admin/CountdownToggle";

interface Props {
  countdowns: any[];
}

export default function CountdownsList({ countdowns }: Props) {
  const slots = [
    { id: 'left', label: 'IZQUIERDA' },
    { id: 'right', label: 'DERECHA' }
  ];

  return (
    <div className="space-y-6">
      <div className="admin-header">
        <div>
          <h2 className="admin-title">Cuentas Regresivas Globales</h2>
          <p className="admin-subtitle">Gestiona los avisos con tiempo restante que aparecen en el cabezal del sitio.</p>
        </div>
      </div>

      <div className="admin-countdowns-grid">
        {slots.map((slot, index) => {
          const c = countdowns.find(x => x.slot === slot.id);
          const slotLabel = slot.label;
          
          return (
            <div key={slot.id} className="admin-card" style={{ border: '1px solid #e2e8f0', borderRadius: '24px', overflow: 'hidden' }}>
              <div style={{ padding: '2rem' }}>
                <div className="admin-card-row" style={{ marginBottom: '1.5rem' }}>
                  <div className="admin-flex-center">
                    <div className="admin-icon-container">
                      <Clock size={20} className="text-secondary" />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>
                        {c ? (c.title as any)?.es : 'Espacio Vacío'}
                      </h3>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <span style={{ 
                          fontSize: '9px', fontWeight: 900, padding: '2px 6px', borderRadius: '6px',
                          background: '#0f172a', color: 'white'
                        }}>
                          {slotLabel}
                        </span>
                        {c && (
                          <span style={{ 
                            fontSize: '9px', fontWeight: 900, padding: '2px 6px', borderRadius: '6px',
                            background: c.isActive ? '#dcfce7' : '#fee2e2', color: c.isActive ? '#166534' : '#991b1b'
                          }}>
                            {c.isActive ? 'HABILITADO' : 'DESACTIVADO'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {c && (
                    <div style={{ background: 'white', padding: '0.4rem 0.6rem', borderRadius: '12px', display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                      <CountdownToggle id={c.id} initialActive={c.isActive} />
                    </div>
                  )}
                </div>

                <div className="admin-card-content">
                  {c ? (
                    <>
                      <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0, minHeight: '1.5rem' }}>
                        {(c.description as any)?.es || 'Sin descripción'}
                      </p>
                      <div className="admin-card-row" style={{ marginTop: '0.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <div>
                          <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>DEADLINE:</p>
                          <p style={{ fontSize: '1rem', fontWeight: 900, margin: 0, color: '#1e293b' }}>
                            {new Date(c.targetDate).toLocaleString()}
                          </p>
                        </div>
                        <Link 
                          href={`/admin/countdowns/${c.id}`} 
                          className="btn-secondary"
                          style={{ padding: '0.6rem', borderRadius: '12px' }}
                        >
                          <Edit size={16} />
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', border: '2px dashed #e2e8f0', borderRadius: '16px', background: '#f8fafc' }}>
                      <Link 
                        href={`/admin/countdowns/new?slot=${slot.id}`}
                        className="btn-primary"
                        style={{ margin: '0 auto' }}
                      >
                        <Plus size={18} />
                        <span>Configurar Slot</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
