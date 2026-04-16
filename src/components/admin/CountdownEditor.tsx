'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Clock, Edit3 } from 'lucide-react';
import { upsertCountdown } from '@/lib/actions';

interface CountdownEditorProps {
  countdown?: any;
}

export default function CountdownEditor({ countdown }: CountdownEditorProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  // Form state
  const [titleEs, setTitleEs] = useState(countdown?.title?.es || '');
  const [titleEn, setTitleEn] = useState(countdown?.title?.en || '');
  const [titlePt, setTitlePt] = useState(countdown?.title?.pt || '');
  
  const [descEs, setDescEs] = useState(countdown?.description?.es || '');
  const [descEn, setDescEn] = useState(countdown?.description?.en || '');
  const [descPt, setDescPt] = useState(countdown?.description?.pt || '');

  const [targetDate, setTargetDate] = useState(
    countdown?.targetDate 
      ? new Date(countdown.targetDate).toISOString().slice(0, 16) 
      : ''
  );
  
  const [isActive, setIsActive] = useState(countdown?.isActive ?? true);
  const [url, setUrl] = useState(countdown?.url || '');
  const [slot, setSlot] = useState(countdown?.slot || 'left');
  const [adminNotes, setAdminNotes] = useState(countdown?.adminNotes || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      await upsertCountdown({
        id: countdown?.id,
        title: { es: titleEs, en: titleEn, pt: titlePt },
        description: { es: descEs, en: descEn, pt: descPt },
        targetDate,
        isActive,
        url,
        slot,
        adminNotes
      });
      router.push('/admin/notifications');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error al guardar el contador');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="admin-header">
        <div>
          <h2 className="admin-title">{countdown ? 'Editar Contador' : 'Nuevo Contador'}</h2>
          <p className="admin-subtitle">Configura la fecha límite y el mensaje del widget.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            <X size={18} />
            <span>Cancelar</span>
          </button>
          <button type="submit" disabled={isPending} className="btn-primary">
            <Save size={18} />
            <span>{isPending ? 'Guardando...' : 'Guardar'}</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '2rem' }}>
        <section className="admin-card" style={{ padding: '2.5rem' }}>
          <div style={{ marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Información del Contador</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="admin-label">Títulos (ES / EN / PT)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <input className="admin-input" value={titleEs} onChange={e => setTitleEs(e.target.value)} placeholder="Español" required />
                <input className="admin-input" value={titleEn} onChange={e => setTitleEn(e.target.value)} placeholder="English" />
                <input className="admin-input" value={titlePt} onChange={e => setTitlePt(e.target.value)} placeholder="Português" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
              <div>
                <label className="admin-label">Deadline (Fecha y Hora)</label>
                <input type="datetime-local" className="admin-input" value={targetDate} onChange={e => setTargetDate(e.target.value)} required />
              </div>
              <div>
                <label className="admin-label">Posición</label>
                <select className="admin-input" value={slot} onChange={e => setSlot(e.target.value)}>
                  <option value="left">Izquierda</option>
                  <option value="right">Derecha</option>
                </select>
              </div>
            </div>

            <div>
              <label className="admin-label">URL de destino (Opcional)</label>
              <input type="url" className="admin-input" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." />
            </div>

            <div onClick={() => setIsActive(!isActive)} style={{ cursor: 'pointer', padding: '1rem', borderRadius: '12px', background: isActive ? '#f0fdf4' : '#fff1f2', border: `2px solid ${isActive ? '#22c55e' : '#fecdd3'}`, display: 'inline-flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '20px', borderRadius: '10px', background: isActive ? '#22c55e' : '#cbd5e1', position: 'relative' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: isActive ? '23px' : '3px', transition: 'all 0.2s' }} />
              </div>
              <span style={{ fontWeight: 800, color: isActive ? '#166534' : '#9f1239' }}>{isActive ? 'CONTADOR ACTIVO' : 'INACTIVO'}</span>
            </div>
          </div>
        </section>

        {/* NOTAS ADMIN */}
        <section className="admin-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Edit3 size={18} className="text-accent" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>Notas de Administración (Privadas)</h3>
          </div>
          <textarea 
            className="admin-input" rows={4} value={adminNotes} onChange={e => setAdminNotes(e.target.value)} 
            placeholder="Recordatorios privados sobre este contador..."
            style={{ background: '#fff', border: '1px dashed #cbd5e1' }}
          />
        </section>
      </div>
    </form>
  );
}
