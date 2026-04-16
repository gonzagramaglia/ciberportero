'use client';

import { useState } from 'react';
import { StickyNote, Save, X, Loader2, Sparkles } from 'lucide-react';
import { updateAdminSectionNote } from '@/lib/actions';

interface Props {
  section: string;
  initialContent: string;
}

export default function AdminSectionNotes({ section, initialContent }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialContent || '');
  const [isPending, setIsPending] = useState(false);

  const handleSave = async () => {
    setIsPending(true);
    const res = await updateAdminSectionNote(section, content);
    setIsPending(false);
    if (res.success) {
      setIsEditing(false);
    } else {
      alert('Error al guardar las notas');
    }
  };

  return (
    <div style={{ marginTop: '4rem', width: '100%', paddingBottom: '2rem' }}>
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.4)', 
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(226, 232, 240, 0.8)', 
        borderRadius: '32px', 
        padding: '2.5rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.03)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }} className="admin-notes-container">
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
              boxShadow: '0 4px 12px rgba(0, 112, 243, 0.3)'
            }}>
              <StickyNote size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#0f172a' }}>Mis Notas</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Solo tú puedes ver este espacio privado.</p>
            </div>
          </div>
          
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              style={{ 
                padding: '0.6rem 1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0',
                background: 'white', color: '#64748b', fontSize: '0.85rem', fontWeight: 800,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                transition: 'all 0.2s'
              }}
              className="btn-edit-notes"
            >
              <Sparkles size={14} className="text-accent" />
              <span>Editar Notas</span>
            </button>
          )}
        </div>

        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <textarea 
              className="admin-input" 
              autoFocus
              rows={5}
              value={content} 
              onChange={e => setContent(e.target.value)}
              style={{ 
                margin: 0, fontSize: '1rem', background: 'rgba(255,255,255,0.8)', 
                borderRadius: '20px', border: '2px solid var(--accent)',
                padding: '1.5rem', lineHeight: 1.6, color: '#1e293b'
              }}
              placeholder="Escribe aquí tus recordatorios, ideas o pendientes para esta sección..."
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button 
                onClick={() => { setIsEditing(false); setContent(initialContent || ''); }} 
                className="btn-secondary" 
                style={{ padding: '0.7rem 1.5rem', borderRadius: '14px', fontWeight: 800 }}
              >
                <X size={16} /> Cancelar
              </button>
              <button 
                onClick={handleSave} 
                disabled={isPending}
                className="btn-primary" 
                style={{ padding: '0.7rem 2rem', borderRadius: '14px', fontWeight: 800, boxShadow: '0 8px 20px rgba(0, 112, 243, 0.2)' }}
              >
                {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{isPending ? 'Guardando...' : 'Guardar Notas'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => setIsEditing(true)}
            style={{ 
              minHeight: '100px', cursor: 'pointer',
              color: content ? '#334155' : '#94a3b8',
              fontSize: '1rem', lineHeight: 1.7, fontStyle: content ? 'normal' : 'italic'
            }}
          >
            {content ? (
              <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>
            ) : (
              'No hay notas guardadas para esta sección. Haz click para empezar a escribir...'
            )}
          </div>
        )}
      </div>
    </div>
  );
}
