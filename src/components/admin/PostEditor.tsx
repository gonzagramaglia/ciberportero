'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Eye, Edit3, Globe, Languages, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { upsertPost } from '@/lib/actions';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PostEditorProps {
  post?: any;
}

type Lang = 'es' | 'en' | 'pt';

export default function PostEditor({ post }: PostEditorProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeLang, setActiveLang] = useState<Lang>('es');

  // Form state
  const [titles, setTitles] = useState<Record<Lang, string>>(post?.title || { es: '', en: '', pt: '' });
  const [contents, setContents] = useState<Record<Lang, string>>(post?.content || { es: '', en: '', pt: '' });
  const [descriptions, setDescriptions] = useState<Record<Lang, string>>(post?.description || { es: '', en: '', pt: '' });
  const [slug, setSlug] = useState(post?.slug || '');
  const [published, setPublished] = useState(post?.published ?? true);

  const handleTitleChange = (val: string) => {
    setTitles({ ...titles, [activeLang]: val });
    // Auto-generate slug from Spanish title if it's a new post
    if (!post && activeLang === 'es') {
      setSlug(val.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, ''));
    }
  };

  const handleContentChange = (val: string) => {
    setContents({ ...contents, [activeLang]: val });
  };

  const handleDescChange = (val: string) => {
    setDescriptions({ ...descriptions, [activeLang]: val });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!titles.es || !contents.es) {
      alert('La versión en español es obligatoria.');
      return;
    }

    setIsPending(true);
    try {
      await upsertPost({
        id: post?.id,
        title: titles,
        slug,
        content: contents,
        description: descriptions,
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

  const langNames = {
    es: 'Español',
    en: 'English',
    pt: 'Português'
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 fade-in">
      <div className="admin-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <Languages size={24} className="text-accent" />
            <h2 className="admin-title">{post ? 'Editar Post Multilingüe' : 'Nuevo Post Multilingüe'}</h2>
          </div>
          <p className="admin-subtitle">Las tres versiones (ES, EN, PT) se guardan en un mismo slug.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            type="button" 
            onClick={() => router.back()}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem' }}
          >
            <X size={18} />
            <span>Cancelar</span>
          </button>
          <button 
            type="submit" 
            disabled={isPending}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', boxShadow: '0 4px 12px rgba(0, 112, 243, 0.2)' }}
          >
            <Save size={18} />
            <span>{isPending ? 'Guardando...' : 'Guardar Post'}</span>
          </button>
        </div>
      </div>

      {/* Selector de Idiomas (Tabs) */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        padding: '0.5rem', 
        background: '#f1f5f9', 
        borderRadius: '16px',
        width: 'fit-content'
      }}>
        {(['es', 'en', 'pt'] as Lang[]).map(l => (
          <button
            key={l}
            type="button"
            onClick={() => setActiveLang(l)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              border: 'none',
              background: activeLang === l ? 'white' : 'transparent',
              color: activeLang === l ? '#0f172a' : '#64748b',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              boxShadow: activeLang === l ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ 
              width: '8px', height: '8px', borderRadius: '50%', 
              background: titles[l] && contents[l] ? '#22c55e' : '#cbd5e1' 
            }} />
            {langNames[l]}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* Card Principal de Edición */}
        <div className="admin-card" style={{ padding: '2.5rem', borderRadius: '24px' }}>
          <div style={{ marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                Contenido en {langNames[activeLang]}
              </h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#64748b' }}>Edita la versión localizada del artículo.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                style={{ 
                  background: previewMode ? '#1e293b' : '#f8fafc', 
                  color: previewMode ? 'white' : '#64748b',
                  border: '1px solid',
                  borderColor: previewMode ? '#1e293b' : '#e2e8f0',
                  padding: '0.5rem 1rem', borderRadius: '10px', 
                  fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', 
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
              >
                {previewMode ? <Edit3 size={14} /> : <Eye size={14} />}
                {previewMode ? 'EDITAR' : 'PREVISUALIZAR'}
              </button>
            </div>
          </div>

          <div className="space-y-12">
            {/* 1. Configuración Global (Slug y Estado) */}
            <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'flex-end', marginBottom: '1rem' }}>
              <div>
                <label className="admin-label" style={{ fontSize: '0.75rem', marginBottom: '0.75rem', display: 'block' }}>Slug (URL Compartida)</label>
                <input 
                  required
                  className="admin-input"
                  style={{ borderRadius: '10px', fontSize: '0.9rem', background: 'white' }}
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="ej-mi-post-unico"
                />
              </div>
              <div>
                <label className="admin-label" style={{ fontSize: '0.75rem', marginBottom: '0.75rem', display: 'block' }}>Estado de Publicación</label>
                <div 
                  onClick={() => setPublished(!published)}
                  style={{ 
                    cursor: 'pointer',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '12px',
                    background: published ? '#f0fdf4' : '#fff1f2',
                    border: `2px solid ${published ? '#22c55e' : '#fecdd3'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.2s',
                    height: '46px'
                  }}
                >
                  {published ? <CheckCircle size={16} color="#22c55e" /> : <AlertCircle size={16} color="#e11d48" />}
                  <span style={{ fontWeight: 800, color: published ? '#166534' : '#9f1239', fontSize: '0.8rem' }}>
                    {published ? 'POST PÚBLICO' : 'MODO BORRADOR'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Título */}
            <div>
              <label className="admin-label" style={{ color: '#475569', fontSize: '0.75rem', marginBottom: '1rem', display: 'block' }}>Título del Post ({activeLang})</label>
              <input 
                required={activeLang === 'es'}
                className="admin-input"
                style={{ fontSize: '1.5rem', fontWeight: 800, padding: '1.5rem', borderRadius: '16px', border: '2px solid #e2e8f0' }}
                value={titles[activeLang]}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder={`Ej: Cómo aprobar ${activeLang === 'es' ? 'Álgebra I' : 'Algebra I'}`}
              />
            </div>

            {/* 3. Contenido Principal */}
            <div>
              <label className="admin-label" style={{ color: '#475569', fontSize: '0.75rem', marginBottom: '1rem', display: 'block' }}>Cuerpo del Post ({activeLang})</label>
              {!previewMode ? (
                <textarea 
                  required={activeLang === 'es'}
                  className="admin-input"
                  style={{ 
                    minHeight: '600px', 
                    fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace', 
                    fontSize: '1rem', 
                    lineHeight: '1.7',
                    padding: '2rem',
                    background: '#fcfcfc',
                    borderRadius: '16px',
                    border: '2px solid #e2e8f0'
                  }}
                  value={contents[activeLang]}
                  onChange={e => handleContentChange(e.target.value)}
                  placeholder="Escribe aquí en Markdown..."
                />
              ) : (
                <div 
                  className="admin-input"
                  style={{ 
                    minHeight: '600px', 
                    background: '#f8fafc', 
                    overflowY: 'auto', 
                    padding: '3rem',
                    border: '2px dashed #cbd5e1',
                    borderRadius: '16px'
                  }}
                >
                  <div className="markdown-preview" style={{ lineHeight: '1.8', color: '#334155' }}>
                    {contents[activeLang] ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {contents[activeLang]}
                      </ReactMarkdown>
                    ) : (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Nada para previsualizar en este idioma...</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 4. SEO */}
            <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Info size={16} className="text-accent" />
                <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900 }}>Descripción SEO ({activeLang})</h3>
              </div>
              <textarea 
                className="admin-input"
                style={{ minHeight: '100px', padding: '1.25rem', borderRadius: '14px', fontSize: '0.95rem', border: '1px solid #e2e8f0', background: 'white' }}
                value={descriptions[activeLang]}
                onChange={e => handleDescChange(e.target.value)}
                placeholder="Resumen para Google y redes sociales..."
              />
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '1rem' }}>Específico para la versión en {langNames[activeLang]}.</p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
