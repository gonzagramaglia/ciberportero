'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Clock } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      await upsertCountdown({
        id: countdown?.id,
        title: { es: titleEs, en: titleEn, pt: titlePt },
        description: { es: descEs, en: descEn, pt: descPt },
        targetDate,
        isActive
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

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Lado izquierdo: Textos */}
        <div className="admin-card space-y-6">
          <div className="space-y-4">
            <label className="admin-label">Título (Traducciones)</label>
            <input className="admin-input" value={titleEs} onChange={e => setTitleEs(e.target.value)} placeholder="🇦🇷 Título en Español" required />
            <input className="admin-input" value={titleEn} onChange={e => setTitleEn(e.target.value)} placeholder="🇺🇸 Título en Inglés" />
            <input className="admin-input" value={titlePt} onChange={e => setTitlePt(e.target.value)} placeholder="🇧🇷 Título en Portugués" />
          </div>

          <div className="space-y-4">
            <label className="admin-label">Descripción (Opcional)</label>
            <textarea className="admin-input" value={descEs} onChange={e => setDescEs(e.target.value)} placeholder="🇦🇷 Descripción en Español" rows={2} />
            <textarea className="admin-input" value={descEn} onChange={e => setDescEn(e.target.value)} placeholder="🇺🇸 Descripción en Inglés" rows={2} />
            <textarea className="admin-input" value={descPt} onChange={e => setDescPt(e.target.value)} placeholder="🇧🇷 Descripción en Portugués" rows={2} />
          </div>
        </div>

        {/* Lado derecho: Configuración técnica */}
        <div className="admin-card space-y-6">
          <div className="space-y-4">
            <label className="admin-label">Fecha y Hora Meta</label>
            <input 
              type="datetime-local" 
              className="admin-input" 
              value={targetDate} 
              onChange={e => setTargetDate(e.target.value)} 
              required 
            />
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>El contador llegará a cero en esta fecha exacta.</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1rem' }}>
            <input 
              type="checkbox" 
              id="active" 
              checked={isActive} 
              onChange={e => setIsActive(e.target.checked)} 
              style={{ width: '20px', height: '20px' }}
            />
            <label htmlFor="active" style={{ fontWeight: 700 }}>Activar contador</label>
          </div>
        </div>
      </div>
    </form>
  );
}
