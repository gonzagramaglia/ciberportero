'use client';

import { useState } from 'react';
import { StickyNote, Save, X, Loader2 } from 'lucide-react';
import { updateAdminNotes } from '@/lib/actions';

interface Props {
  id: string;
  type: 'notification' | 'post' | 'calendarEvent' | 'countdown';
  initialNotes: string | null;
}

export default function AdminItemNotes({ id, type, initialNotes }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(initialNotes || '');
  const [isPending, setIsPending] = useState(false);

  const handleSave = async () => {
    setIsPending(true);
    const res = await updateAdminNotes(id, type, notes);
    setIsPending(false);
    if (res.success) {
      setIsEditing(false);
    } else {
      alert('Error al guardar las notas');
    }
  };

  return (
    <div style={{ marginTop: '0.75rem', width: '100%' }}>
      {isEditing ? (
        <div style={{ 
          background: '#fff', border: '2px solid var(--accent)', borderRadius: '16px', 
          padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem',
          boxShadow: '0 4px 12px rgba(0, 112, 243, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase' }}>
            <StickyNote size={12} />
            Editando Mis Notas
          </div>
          <textarea 
            className="admin-input" 
            autoFocus
            rows={2}
            value={notes} 
            onChange={e => setNotes(e.target.value)}
            style={{ margin: 0, fontSize: '0.9rem', background: '#f8fafc' }}
            placeholder="Escribe aquí tus recordatorios personales..."
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button 
              onClick={() => { setIsEditing(false); setNotes(initialNotes || ''); }} 
              className="btn-secondary" 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            >
              <X size={14} /> Cancelar
            </button>
            <button 
              onClick={handleSave} 
              disabled={isPending}
              className="btn-primary" 
              style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
            >
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              <span>{isPending ? 'Guardando...' : 'Guardar'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => setIsEditing(true)}
          style={{ 
            background: 'rgba(255,255,255,0.6)', border: '1px dashed #cbd5e1', borderRadius: '16px', 
            padding: '0.8rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
            cursor: 'pointer', transition: 'all 0.2s', color: notes ? '#475569' : '#94a3b8'
          }}
          className="admin-notes-hover"
        >
          <StickyNote size={16} style={{ marginTop: '0.2rem', color: notes ? 'var(--accent)' : '#cbd5e1', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 900, fontSize: '9px', textTransform: 'uppercase', display: 'block', opacity: 0.6, marginBottom: '0.2rem' }}>Mis Notas</span>
            <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.4, fontStyle: notes ? 'normal' : 'italic' }}>
              {notes || 'Haz click para añadir una nota privada...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
