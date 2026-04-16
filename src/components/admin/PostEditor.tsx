'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Eye, Edit3, Globe, Languages, Info, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
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
  const [alternativeSlug, setAlternativeSlug] = useState(post?.alternativeSlug || '');
  const [published, setPublished] = useState(post?.published ?? true);
  const [countdowns, setCountdowns] = useState<any[]>(post?.countdowns || []);

  const isDirty = useMemo(() => {
    const initialTitles = post?.title || { es: '', en: '', pt: '' };
    const initialContents = post?.content || { es: '', en: '', pt: '' };
    const initialDescriptions = post?.description || { es: '', en: '', pt: '' };
    const initialSlug = post?.slug || '';
    const initialPublished = post?.published ?? true;
    const initialCountdowns = post?.countdowns || [];

    return JSON.stringify(titles) !== JSON.stringify(initialTitles) ||
           JSON.stringify(contents) !== JSON.stringify(initialContents) ||
           JSON.stringify(descriptions) !== JSON.stringify(initialDescriptions) ||
           slug !== initialSlug ||
           alternativeSlug !== (post?.alternativeSlug || '') ||
           published !== initialPublished ||
           JSON.stringify(countdowns) !== JSON.stringify(initialCountdowns);
  }, [titles, contents, descriptions, slug, alternativeSlug, published, countdowns, post]);

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
        router.push('/admin/posts');
      }
    } else {
      router.push('/admin/posts');
    }
  };

  const handleTitleChange = (val: string) => {
    setTitles({ ...titles, [activeLang]: val });
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

    if (!slug) {
      alert('El slug es obligatorio para guardar el post.');
      return;
    }

    setIsPending(true);
    try {
      await upsertPost({
        id: post?.id,
        title: titles,
        slug,
        alternativeSlug,
        content: contents,
        description: descriptions,
        published,
        countdowns // Add countdowns here
      });
      router.push(`/admin/posts?success=${encodeURIComponent(titles.es)}&slug=${slug}`);
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
          {slug && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Acceso al post público:</span>
              <a 
                href={`/${slug}`} 
                target="_blank" 
                rel="noreferrer"
                style={{ 
                  fontSize: '0.85rem', 
                  fontWeight: 800, 
                  color: 'var(--accent)', 
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                Ver post <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            type="button" 
            onClick={handleBack}
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
            <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', alignItems: 'flex-end', marginBottom: '1rem' }}>
              <div>
                <label className="admin-label" style={{ fontSize: '0.75rem', marginBottom: '0.75rem', display: 'block' }}>Slug Principal</label>
                <input 
                  required
                  className="admin-input"
                  style={{ borderRadius: '10px', fontSize: '0.9rem', background: 'white' }}
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="ej-mi-post"
                />
              </div>
              <div>
                <label className="admin-label" style={{ fontSize: '0.75rem', marginBottom: '0.75rem', display: 'block' }}>Slug Adicional (Opcional)</label>
                <input 
                  className="admin-input"
                  style={{ borderRadius: '10px', fontSize: '0.9rem', background: 'white' }}
                  value={alternativeSlug}
                  onChange={e => setAlternativeSlug(e.target.value)}
                  placeholder="ej-alias-post"
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
            <div style={{ marginTop: '2.5rem' }}>
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
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                        }}
                      >
                        {(() => {
                          const content = contents[activeLang].trim();
                          if (content.startsWith('# ')) return contents[activeLang];
                          return `# ${titles[activeLang]}\n\n${contents[activeLang]}`;
                        })()}
                      </ReactMarkdown>
                    ) : (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Nada para previsualizar en este idioma...</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Cuentas Regresivas (Opcionales) */}
            <div style={{ marginTop: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <AlertCircle size={20} className="text-accent" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>Cuentas Regresivas Personalizadas (Opcionales)</h3>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {(['left', 'right'] as const).map(slot => {
                  const cd = countdowns.find(c => c.slot === slot);
                  const isActive = !!cd;
                  
                  return (
                    <div 
                      key={slot}
                      style={{ 
                        padding: '1.5rem', 
                        background: isActive ? '#f0f9ff' : '#f8fafc', 
                        borderRadius: '20px', 
                        border: `2px solid ${isActive ? '#bae6fd' : '#e2e8f0'}`,
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 900, color: isActive ? '#0369a1' : '#94a3b8', textTransform: 'uppercase' }}>
                          Slot {slot === 'left' ? 'Izquierdo' : 'Derecho'}
                        </span>
                        <div 
                          onClick={() => {
                            if (isActive) {
                              setCountdowns(countdowns.filter(c => c.slot !== slot));
                            } else {
                              setCountdowns([...countdowns, {
                                slot,
                                title: { es: '', en: '', pt: '' },
                                targetDate: new Date().toISOString().split('T')[0],
                                isActive: true
                              }]);
                            }
                          }}
                          style={{ 
                            width: '44px', height: '24px', borderRadius: '12px', 
                            background: isActive ? '#0070f3' : '#cbd5e1',
                            position: 'relative', cursor: 'pointer', transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ 
                            width: '18px', height: '18px', borderRadius: '50%', background: 'white',
                            position: 'absolute', top: '3px', left: isActive ? '23px' : '3px',
                            transition: 'all 0.2s shadow 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }} />
                        </div>
                      </div>

                      {isActive ? (
                        <div className="space-y-4">
                          <div>
                            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>
                              TÍTULO ({activeLang.toUpperCase()})
                            </label>
                            <input 
                              className="admin-input"
                              style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem', background: 'white' }}
                              value={cd.title[activeLang] || ''}
                              onChange={e => {
                                const newCds = [...countdowns];
                                const index = newCds.findIndex(c => c.slot === slot);
                                newCds[index].title = { ...newCds[index].title, [activeLang]: e.target.value };
                                setCountdowns(newCds);
                              }}
                              placeholder="Ej: Final de Sistemas..."
                            />
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                              <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>
                                FECHA OBJETIVO
                              </label>
                              <input 
                                type="date"
                                className="admin-input"
                                style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem', background: 'white' }}
                                value={cd.targetDate ? new Date(cd.targetDate).toISOString().split('T')[0] : ''}
                                onChange={e => {
                                  const newCds = [...countdowns];
                                  const index = newCds.findIndex(c => c.slot === slot);
                                  newCds[index].targetDate = e.target.value;
                                  setCountdowns(newCds);
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>
                                LINK AL CLICK (OPCIONAL)
                              </label>
                              <input 
                                className="admin-input"
                                style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem', background: 'white' }}
                                value={cd.url || ''}
                                onChange={e => {
                                  const newCds = [...countdowns];
                                  const index = newCds.findIndex(c => c.slot === slot);
                                  newCds[index].url = e.target.value;
                                  setCountdowns(newCds);
                                }}
                                placeholder="https://..."
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>Desactivado para este post.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. SEO */}
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
