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

      <div style={{ display: 'grid', gap: '2rem' }}>
        {/* Sección Principal: Escritura */}
        <div className="admin-card" style={{ padding: '2.5rem' }}>
          <div style={{ marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Contenido del Post</h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>Usa Markdown para darle formato a tu texto.</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="admin-label" style={{ color: '#1a1a1a' }}>Título del Post</label>
              <input 
                required
                className="admin-input"
                style={{ fontSize: '1.25rem', fontWeight: 700, padding: '1.25rem' }}
                value={title}
                onChange={e => {
                  setTitle(e.target.value);
                  if (!post) setSlug(e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
                }}
                placeholder="Ej: Cómo aprobar IVU"
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label className="admin-label" style={{ marginBottom: 0, color: '#1a1a1a' }}>Cuerpo del Post</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    type="button"
                    onClick={() => setPreviewMode(!previewMode)}
                    style={{ 
                      background: previewMode ? '#1a1a1a' : '#f1f5f9', 
                      color: previewMode ? 'white' : '#64748b',
                      border: 'none', padding: '0.4rem 0.8rem', borderRadius: '8px', 
                      fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', 
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    {previewMode ? <Edit3 size={14} /> : <Eye size={14} />}
                    {previewMode ? 'EDITAR' : 'VISTA PREVIA'}
                  </button>
                </div>
              </div>
              
              {!previewMode ? (
                <textarea 
                  required
                  className="admin-input"
                  style={{ 
                    minHeight: '450px', 
                    fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace', 
                    fontSize: '1rem', 
                    lineHeight: '1.7',
                    padding: '1.5rem',
                    background: '#fcfcfc'
                  }}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Escribe aquí en Markdown..."
                />
              ) : (
                <div 
                  className="admin-input"
                  style={{ 
                    minHeight: '450px', 
                    background: '#f8fafc', 
                    overflowY: 'auto', 
                    padding: '2rem',
                    borderStyle: 'dashed'
                  }}
                >
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>
                    {content || <span style={{ color: '#94a3b8' }}>Nada para previsualizar...</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sección: Configuración y SEO */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="admin-card" style={{ padding: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Globe size={20} color="#1a1a1a" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Configuración de Publicación</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="admin-label">Slug (URL del Post)</label>
                <input 
                  required
                  className="admin-input"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="ej-mi-post"
                />
              </div>

              <div>
                <label className="admin-label">Idioma de este Post</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['es', 'en', 'pt'].map(l => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLang(l)}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: '2px solid',
                        borderColor: lang === l ? '#1a1a1a' : '#e2e8f0',
                        background: lang === l ? '#1a1a1a' : 'white',
                        color: lang === l ? 'white' : '#64748b',
                        fontWeight: 800,
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        transition: 'all 0.2s'
                      }}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div 
                onClick={() => setPublished(!published)}
                style={{ 
                  cursor: 'pointer',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  background: published ? '#f0fdf4' : '#fff1f2',
                  border: `2px solid ${published ? '#22c55e' : '#fecdd3'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginTop: '1rem',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ 
                  width: '20px', height: '20px', borderRadius: '50%', 
                  background: published ? '#22c55e' : '#e11d48',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {published && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }} />}
                </div>
                <span style={{ fontWeight: 800, color: published ? '#166534' : '#9f1239' }}>
                  {published ? 'Post Público' : 'Guardar como Borrador'}
                </span>
              </div>
            </div>
          </div>

          <div className="admin-card" style={{ padding: '2.5rem' }}>
            <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: 800 }}>Descripción (SEO)</h3>
            <textarea 
              className="admin-input"
              style={{ minHeight: '140px', padding: '1rem' }}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Escribe un breve resumen de lo que trata este post para los motores de búsqueda..."
            />
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '1rem' }}>
              Este texto aparecerá en los resultados de Google y en las tarjetas de redes sociales.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
