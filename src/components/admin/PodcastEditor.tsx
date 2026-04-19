'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, ExternalLink, Speaker, Upload, Check, Loader2 } from 'lucide-react';
import { upsertPodcast } from '@/lib/actions';
import LanguageTabs from './LanguageTabs';
import { supabase } from '@/lib/supabase';

interface PodcastEditorProps {
  podcast?: any;
}

type Lang = 'es' | 'en' | 'pt';

export default function PodcastEditor({ podcast }: PodcastEditorProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [activeLang, setActiveLang] = useState<Lang>('es');

  // Form state
  // ... (keep common state)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's an audio file
    if (!file.type.startsWith('audio/')) {
        alert('Por favor selecciona un archivo de audio válido.');
        return;
    }

    setIsUploading(true);
    setUploadSuccess(false);

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `podcasts/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('podcasts')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('podcasts')
            .getPublicUrl(filePath);

        setAudioUrl(publicUrl);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
        console.error('Error uploading audio:', error);
        alert('Error al subir el audio. Asegúrate de que el bucket "podcasts" existe en Supabase y es público.');
    } finally {
        setIsUploading(false);
    }
  };

  const [title, setTitle] = useState(podcast?.title?.es || '');
  const [description, setDescription] = useState(podcast?.description?.es || '');
  const [slug, setSlug] = useState(podcast?.slug || '');
  const [audioUrl, setAudioUrl] = useState(podcast?.audioUrl || '');
  const [published, setPublished] = useState(podcast?.published ?? true);

  const isDirty = useMemo(() => {
    const initialTitle = podcast?.title?.es || '';
    const initialDescription = podcast?.description?.es || '';
    const initialSlug = podcast?.slug || '';
    const initialAudioUrl = podcast?.audioUrl || '';
    const initialPublished = podcast?.published ?? true;

    return title !== initialTitle ||
           description !== initialDescription ||
           slug !== initialSlug ||
           audioUrl !== initialAudioUrl ||
           published !== initialPublished;
  }, [title, description, slug, audioUrl, published, podcast]);

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
    if (!title) {
      alert('El título es obligatorio.');
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
        title: { es: title, en: title, pt: title },
        slug,
        description: { es: description, en: description, pt: description },
        audioUrl,
        published,
      });
      router.push(`/admin/podcast?success=${encodeURIComponent(title)}&slug=${slug}`);
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

      <div className="admin-card" style={{ padding: '3rem', borderRadius: '32px' }}>
        <div style={{ marginBottom: '3rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>Información del Audio</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <div>
            <label className="admin-label">Título</label>
            <input 
              className="admin-input" 
              style={{ fontSize: '1.5rem', fontWeight: 900, padding: '1.25rem', borderRadius: '16px' }} 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="Ej: Episodio 1: El inicio" 
            />
          </div>

          <div>
            <label className="admin-label">Descripción</label>
            <textarea 
              className="admin-input" 
              rows={4}
              style={{ fontSize: '1.1rem', padding: '1.25rem', borderRadius: '16px' }}
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="De qué trata este audio..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '1.5rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label className="admin-label">Archivo de Audio (URL o Subir)</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Speaker size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    className="admin-input" 
                    style={{ paddingLeft: '3rem' }}
                    value={audioUrl} 
                    onChange={e => setAudioUrl(e.target.value)} 
                    placeholder="https://ejemplo.com/audio.mp3 o sube uno ->" 
                    required
                  />
                </div>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="file" 
                    id="audio-upload" 
                    accept="audio/*" 
                    style={{ display: 'none' }} 
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <label 
                    htmlFor="audio-upload" 
                    className={`btn-secondary ${isUploading ? 'loading' : ''} ${uploadSuccess ? 'success' : ''}`}
                    style={{ 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.4rem', 
                      cursor: isUploading ? 'not-allowed' : 'pointer',
                      background: uploadSuccess ? '#f0fdf4' : '',
                      borderColor: uploadSuccess ? '#22c55e' : '',
                      color: uploadSuccess ? '#166534' : ''
                    }}
                  >
                    {isUploading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : uploadSuccess ? (
                      <Check size={18} />
                    ) : (
                      <Upload size={18} />
                    )}
                    <span>{isUploading ? 'Subiendo...' : uploadSuccess ? 'Subido' : 'Subir'}</span>
                  </label>
                </div>
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
