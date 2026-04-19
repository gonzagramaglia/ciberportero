'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, ExternalLink, Speaker } from 'lucide-react';
import { upsertPodcast } from '@/lib/actions';
import LanguageTabs from './LanguageTabs';

interface PodcastEditorProps {
  podcast?: any;
}

type Lang = 'es' | 'en' | 'pt';

export default function PodcastEditor({ podcast }: PodcastEditorProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [activeLang, setActiveLang] = useState<Lang>('es');

  // Form state
  const [titles, setTitles] = useState<Record<Lang, string>>(podcast?.title || { es: '', en: '', pt: '' });
  const [descriptions, setDescriptions] = useState<Record<Lang, string>>(podcast?.description || { es: '', en: '', pt: '' });
  const [slug, setSlug] = useState(podcast?.slug || '');
  const [audioUrl, setAudioUrl] = useState(podcast?.audioUrl || '');
  const [published, setPublished] = useState(podcast?.published ?? true);

  const isDirty = useMemo(() => {
    const initialTitles = podcast?.title || { es: '', en: '', pt: '' };
    const initialDescriptions = podcast?.description || { es: '', en: '', pt: '' };
    const initialSlug = podcast?.slug || '';
    const initialAudioUrl = podcast?.audioUrl || '';
    const initialPublished = podcast?.published ?? true;

    return JSON.stringify(titles) !== JSON.stringify(initialTitles) ||
           JSON.stringify(descriptions) !== JSON.stringify(initialDescriptions) ||
           slug !== initialSlug ||
           audioUrl !== initialAudioUrl ||
           published !== initialPublished;
  }, [titles, descriptions, slug, audioUrl, published, podcast]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleBack = () => {
    if (isDirty) {
      if (window.confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?')) {
        router.push('/admin/podcast');
      }
    } else {
      router.push('/admin/podcast');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titles.es) {
      alert('La versión en español es obligatoria.');
      return;
    }
    if (!slug) {
      alert('El slug es obligatorio.');
      return;
    }
    if (!audioUrl) {
      alert('La URL del audio es obligatoria.');
      return;
    }

    setIsPending(true);
    try {
      await upsertPodcast({
        id: podcast?.id,
        title: titles,
        slug,
        description: descriptions,
        audioUrl,
        published,
      });
      router.push(`/admin/podcast?success=${encodeURIComponent(titles.es)}&slug=${slug}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error al guardar el podcast');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 fade-in">
      <div className="admin-header">
        <div>
          <h2 className="admin-title">{podcast ? 'Editar Podcast' : 'Nuevo Podcast'}</h2>
          {slug && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Acceso al podcast público:</span>
              <a href={`/podcast/${slug}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                Ver podcast <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" onClick={handleBack} className="btn-secondary">
            <X size={18} />
            <span>Cancelar</span>
          </button>
          <button type="submit" disabled={isPending} className="btn-primary">
            <Save size={18} />
            <span>{isPending ? 'Guardando...' : 'Guardar Podcast'}</span>
          </button>
        </div>
      </div>

      <LanguageTabs active={activeLang} onChange={(l: any) => setActiveLang(l)} />

      <div className="admin-card" style={{ padding: '3rem', borderRadius: '32px' }}>
        <div style={{ marginBottom: '3rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>Información del Audio</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <div>
            <label className="admin-label">Título ({activeLang})</label>
            <input 
              className="admin-input" 
              style={{ fontSize: '1.5rem', fontWeight: 900, padding: '1.25rem', borderRadius: '16px' }} 
              value={titles[activeLang]} 
              onChange={e => setTitles({...titles, [activeLang]: e.target.value})} 
              placeholder="Ej: Episodio 1: El inicio" 
            />
          </div>

          <div>
            <label className="admin-label">Descripción ({activeLang})</label>
            <textarea 
              className="admin-input" 
              rows={4}
              style={{ fontSize: '1.1rem', padding: '1.25rem', borderRadius: '16px' }}
              value={descriptions[activeLang]} 
              onChange={e => setDescriptions({...descriptions, [activeLang]: e.target.value})} 
              placeholder="De qué trata este audio..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
            <div>
              <label className="admin-label">URL del Audio</label>
              <div style={{ position: 'relative' }}>
                <Speaker size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  className="admin-input" 
                  style={{ paddingLeft: '3rem' }}
                  value={audioUrl} 
                  onChange={e => setAudioUrl(e.target.value)} 
                  placeholder="https://ejemplo.com/audio.mp3" 
                  required
                />
              </div>
            </div>
            <div>
              <label className="admin-label">Slug</label>
              <input 
                className="admin-input" 
                value={slug} 
                onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} 
                placeholder="slug-del-audio"
                required 
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <button 
                type="button"
                onClick={() => setPublished(!published)}
                style={{ 
                  padding: '1rem 2rem', 
                  borderRadius: '16px', 
                  background: published ? '#f0fdf4' : '#fff1f2', 
                  border: `2px solid ${published ? '#22c55e' : '#fecdd3'}`,
                  color: published ? '#166534' : '#9f1239',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
             >
               {published ? 'PUBLICADO' : 'BORRADOR'}
             </button>
             <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
               {published ? 'Cualquiera podrá ver este audio.' : 'Solo tú puedes ver este audio.'}
             </span>
          </div>
        </div>
      </div>
    </form>
  );
}
