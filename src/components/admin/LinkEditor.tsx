'use client';

import { useState } from "react";
import { upsertLink } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  initialData?: any;
}

export function LinkEditor({ initialData }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State for multilingual names
  const [names, setNames] = useState(() => {
    if (typeof initialData?.name === 'string') {
      return { es: initialData.name, en: initialData.name, pt: initialData.name };
    }
    return {
      es: initialData?.name?.es || '',
      en: initialData?.name?.en || '',
      pt: initialData?.name?.pt || '',
    };
  });

  const [url, setUrl] = useState(initialData?.url || '');
  const [iconType, setIconType] = useState(initialData?.iconType || 'external');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await upsertLink({
        id: initialData?.id,
        name: names,
        url,
        iconType,
      });
      router.push('/admin/links');
      router.refresh();
    } catch (error) {
      alert('Error al guardar el link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="admin-header">
        <div>
          <h2 className="admin-title">{initialData ? 'Editar Link' : 'Nuevo Link'}</h2>
          <p className="admin-subtitle">Completa la información en los tres idiomas.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-card" style={{ padding: '2rem', display: 'grid', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#64748b' }}>Nombre (Español)</label>
            <input 
              required
              className="admin-input"
              value={names.es}
              onChange={e => setNames({...names, es: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#64748b' }}>Nombre (Inglés)</label>
            <input 
              required
              className="admin-input"
              value={names.en}
              onChange={e => setNames({...names, en: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#64748b' }}>Nombre (Portugués)</label>
            <input 
              required
              className="admin-input"
              value={names.pt}
              onChange={e => setNames({...names, pt: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#64748b' }}>URL del Enlace</label>
            <input 
              required
              type="url"
              className="admin-input"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://su-enlace-aqui.com"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#64748b' }}>URL del Icono (Opcional)</label>
            <input 
              className="admin-input"
              placeholder="Ej: /wsp.png o moodle"
              value={iconType}
              onChange={e => setIconType(e.target.value)}
            />
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.5rem', marginBottom: 0 }}>Icono flecha por defecto si está vacío.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary" 
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Save size={18} />
            {loading ? 'Guardando...' : 'Guardar Link'}
          </button>
          <Link 
            href="/admin/links" 
            style={{ 
              padding: '0.75rem 1.5rem', 
              borderRadius: '10px', 
              border: '1px solid #e2e8f0', 
              textDecoration: 'none', 
              color: '#64748b', 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
