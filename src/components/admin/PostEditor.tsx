'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Eye, Edit3, Globe } from 'lucide-react';
import { upsertPost } from '@/lib/actions';

interface PostEditorProps {
  post?: any;
}

export default function PostEditor({ post }: PostEditorProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Form state
  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [content, setContent] = useState(post?.content || '');
  const [lang, setLang] = useState(post?.lang || 'es');
  const [description, setDescription] = useState(post?.description || '');
  const [published, setPublished] = useState(post?.published ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      await upsertPost({
        id: post?.id,
        title,
        slug,
        content,
        lang,
        description,
        published
      });
      router.push('/admin/posts');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error al guardar el post');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="admin-header">
        <div>
          <h2 className="admin-title">{post ? 'Editar Post' : 'Nuevo Post'}</h2>
          <p className="admin-subtitle">Escribe y publica contenido para el portal.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            type="button" 
            onClick={() => router.back()}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', textDecoration: 'none' }}
          >
            <X size={18} />
            <span>Cancelar</span>
          </button>
          <button 
            type="submit" 
            disabled={isPending}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem' }}
          >
            <Save size={18} />
            <span>{isPending ? 'Guardando...' : 'Guardar Post'}</span>
          </button>
        </div>
      </div>

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Main Content */}
        <div className="admin-card space-y-6">
          <div>
            <label className="admin-label">Título del Post</label>
            <input 
              required
              className="admin-input"
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                if (!post) setSlug(e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
              }}
              placeholder="Ej: Cómo aprobar IVU"
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="admin-label" style={{ marginBottom: 0 }}>Contenido (Markdown)</label>
              <button 
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                style={{ background: '#f1f5f9', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                {previewMode ? <Edit3 size={14} /> : <Eye size={14} />}
                {previewMode ? 'Editar' : 'Previsualizar'}
              </button>
            </div>
            
            {!previewMode ? (
              <textarea 
                required
                className="admin-input"
                style={{ minHeight: '400px', fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: '1.6' }}
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Escribe aquí el contenido en Markdown..."
              />
            ) : (
              <div 
                className="admin-input"
                style={{ minHeight: '400px', background: '#f8fafc', overflowY: 'auto', padding: '1.5rem' }}
              >
                {/* Fallback simple preview for now */}
                <div style={{ whiteSpace: 'pre-wrap' }}>{content || 'Nada para previsualizar...'}</div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="admin-card space-y-4">
            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>Configuración</h4>
            
            <div>
              <label className="admin-label">Slug (URL)</label>
              <input 
                required
                className="admin-input"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="ej-mi-post"
              />
            </div>

            <div>
              <label className="admin-label">Idioma</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['es', 'en', 'pt'].map(l => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: lang === l ? 'var(--accent)' : '#e2e8f0',
                      background: lang === l ? 'rgba(59, 130, 246, 0.1)' : 'white',
                      color: lang === l ? 'var(--accent)' : '#64748b',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      fontSize: '0.7rem'
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="admin-label">Descripción corta (SEO)</label>
              <textarea 
                className="admin-input"
                style={{ minHeight: '80px' }}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Un breve resumen del post..."
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
              <input 
                type="checkbox"
                id="published"
                checked={published}
                onChange={e => setPublished(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="published" style={{ fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>Publicar inmediatamente</label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
