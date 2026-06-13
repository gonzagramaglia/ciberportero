'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, ExternalLink, Smile, Plus, Trash2, ArrowLeftRight } from 'lucide-react';
import { upsertPost } from '@/lib/actions';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LanguageTabs from './LanguageTabs';
import { toLocalISOString } from '@/lib/utils';

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
  const [alternativeSlug2, setAlternativeSlug2] = useState(post?.alternativeSlug2 || '');
  const [published, setPublished] = useState(post?.published ?? true);
  const [unlisted, setUnlisted] = useState(post?.unlisted ?? false);
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
           alternativeSlug2 !== (post?.alternativeSlug2 || '') ||
           published !== initialPublished ||
           unlisted !== (post?.unlisted ?? false) ||
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titles.es || !contents.es) {
      alert('La versión en español es obligatoria.');
      return;
    }
    if (!slug) {
      alert('El slug es obligatorio.');
      return;
    }

    setIsPending(true);
    try {
      await upsertPost({
        id: post?.id,
        title: titles,
        slug,
        alternativeSlug,
        alternativeSlug2,
        content: contents,
        description: descriptions,
        published,
        unlisted,
        countdowns
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

  const updateCountdown = (slot: 'left' | 'right', field: string, value: any) => {
    const existingIndex = countdowns.findIndex(c => c.slot === slot);
    if (existingIndex !== -1) {
      const updated = [...countdowns];
      updated[existingIndex] = { ...updated[existingIndex], [field]: value };
      setCountdowns(updated);
    } else {
      const newC = { 
        slot, 
        title: { es: '', en: '', pt: '' }, 
        description: { es: '', en: '', pt: '' },
        expiredMessage: { es: '', en: '', pt: '' },
        targetDate: new Date().toISOString(), 
        url: '',
        isActive: true 
      };
      setCountdowns([...countdowns, { ...newC, [field]: value }]);
    }
  };

  const removeCountdown = (slot: 'left' | 'right') => {
    setCountdowns(countdowns.filter(c => c.slot !== slot));
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 fade-in">
        <div className="admin-header">
          <div>
            <h2 className="admin-title">{post ? 'Editar Post' : 'Nuevo Post'}</h2>
            {slug && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Acceso al post público:</span>
                <a href={`/${slug}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  Ver post <ExternalLink size={14} />
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
              <span>{isPending ? 'Guardando...' : 'Guardar Post'}</span>
            </button>
          </div>
        </div>

        <LanguageTabs active={activeLang} onChange={(l: any) => setActiveLang(l)} />

        <div className="space-y-12">
          <div className="admin-card" style={{ padding: '3rem', borderRadius: '32px' }}>
            <div style={{ marginBottom: '3rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>Editor de Contenido</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setPreviewMode(!previewMode)}
                style={{ 
                   background: previewMode ? '#1e293b' : '#f8fafc', color: previewMode ? 'white' : '#64748b',
                   border: '1px solid #e2e8f0', padding: '0.6rem 1.25rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer',
                   transition: 'all 0.2s'
                }}
              >
                {previewMode ? 'VOLVER A EDITAR' : 'PREVISUALIZAR'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                <div>
                  <label className="admin-label" style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Título del Post ({activeLang})</label>
                  <input 
                    className="admin-input" 
                    style={{ fontSize: '2rem', fontWeight: 900, padding: '1.5rem', borderRadius: '20px' }} 
                    value={titles[activeLang]} 
                    onChange={e => setTitles({...titles, [activeLang]: e.target.value})} 
                    placeholder="Escribe un título impactante..." 
                  />
                </div>

                <div>
                  <label className="admin-label" style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Descripción / Extracto ({activeLang})</label>
                  <textarea 
                    className="admin-input" 
                    rows={3}
                    style={{ fontSize: '1.1rem', fontWeight: 600, background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', lineHeight: 1.6 }}
                    value={descriptions[activeLang]} 
                    onChange={e => setDescriptions({...descriptions, [activeLang]: e.target.value})} 
                    placeholder="Resumen SEO..."
                  />
                </div>

                <div>
                  <label className="admin-label" style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Contenido Principal ({activeLang})</label>
                  {!previewMode ? (
                    <textarea 
                      className="admin-input" 
                      style={{ minHeight: '600px', fontFamily: 'monospace', padding: '2rem', borderRadius: '24px', fontSize: '1.05rem', lineHeight: 1.7 }} 
                      value={contents[activeLang]} 
                      onChange={e => setContents({...contents, [activeLang]: e.target.value})} 
                      placeholder="Escribe tu contenido usando Markdown..." 
                    />
                  ) : (
                    <div className="markdown-preview" style={{ minHeight: '600px', background: '#f8fafc', padding: '3rem', border: '1px dashed #cbd5e1', borderRadius: '24px' }}>
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ node, ...props }) => {
                            let href = props.href || '';
                            const childrenText = String(props.children || '');
                            if (childrenText.startsWith('http') && childrenText.endsWith('_') && !href.endsWith('_')) {
                              href = childrenText;
                            }
                            return <a {...props} href={href} target="_blank" rel="noopener noreferrer" />;
                          }
                        }}
                      >
                        {String(contents[activeLang])
                          .replace(/(^|\s)(https?:\/\/[^\s<*>]*_[^\s<*>]*)/g, '$1<$2>')
                          .trim()}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>

              {/* Slugs y Estado */}
              <div style={{ borderTop: '2px dashed #f1f5f9', paddingTop: '3.5rem' }}>
                <h4 style={{ margin: '0 0 2rem 0', fontSize: '1.2rem', fontWeight: 900 }}>Configuración de Slugs y Publicación</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', background: '#f8fafc', padding: '2rem', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                  <div>
                    <label className="admin-label">Slug Principal</label>
                    <input className="admin-input" value={slug} onChange={e => setSlug(e.target.value)} required />
                  </div>
                  <div>
                    <label className="admin-label">Slug Opcional 1</label>
                    <input className="admin-input" value={alternativeSlug} onChange={e => setAlternativeSlug(e.target.value)} />
                  </div>
                  <div>
                    <label className="admin-label">Slug Opcional 2</label>
                    <input className="admin-input" value={alternativeSlug2} onChange={e => setAlternativeSlug2(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                    <div onClick={() => setPublished(!published)} style={{ cursor: 'pointer', padding: '0.5rem', borderRadius: '16px', background: published ? '#f0fdf4' : '#fff1f2', border: `2px solid ${published ? '#22c55e' : '#fecdd3'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                      <span style={{ fontWeight: 900, color: published ? '#166534' : '#9f1239', fontSize: '0.85rem' }}>{published ? 'PUBLICADO' : 'BORRADOR'}</span>
                    </div>
                    <div onClick={() => setUnlisted(!unlisted)} style={{ cursor: 'pointer', padding: '0.5rem', borderRadius: '16px', background: unlisted ? '#fef3c7' : '#f8fafc', border: `2px solid ${unlisted ? '#f59e0b' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                      <span style={{ fontWeight: 900, color: unlisted ? '#b45309' : '#64748b', fontSize: '0.85rem' }}>{unlisted ? 'UNLISTED (OCULTO DEL FEED)' : 'LISTADO'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cuentas Regresivas Locales */}
              <div style={{ borderTop: '2px dashed #f1f5f9', paddingTop: '3.5rem' }}>
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>Cuentas Regresivas Locales</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Solo para este post específico.</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => {
                      setCountdowns(prev => prev.map(c => ({
                        ...c,
                        slot: c.slot === 'left' ? 'right' : 'left'
                      })));
                    }}
                    disabled={countdowns.length === 0}
                    className="btn-secondary"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: countdowns.length === 0 ? 0.5 : 1 }}
                  >
                    <ArrowLeftRight size={18} />
                    <span>Intercambiar Slots</span>
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  {(['left', 'right'] as const).map(slot => {
                    const c = countdowns.find(x => x.slot === slot);
                    return (
                      <div key={slot} style={{ 
                        padding: '2.5rem', borderRadius: '32px', 
                        background: c ? '#fff' : 'rgba(241, 245, 249, 0.4)', 
                        border: c ? '1px solid #e2e8f0' : '2px dashed #e2e8f0',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        boxShadow: c ? '0 10px 30px rgba(0,0,0,0.03)' : 'none'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                          <span style={{ fontSize: '10px', fontWeight: 900, background: '#0f172a', color: 'white', padding: '4px 12px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            SLOT {slot === 'left' ? 'IZQUIERDO' : 'DERECHO'}
                          </span>
                          {c && (
                            <button type="button" onClick={() => removeCountdown(slot)} style={{ background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.6rem', borderRadius: '12px', transition: 'all 0.2s' }}>
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>

                        {!c ? (
                          <button 
                            type="button" 
                            onClick={() => updateCountdown(slot, 'isActive', true)}
                            style={{ 
                              width: '100%', padding: '2rem', borderRadius: '20px', border: 'none',
                              background: 'white', color: '#64748b', fontWeight: 800, fontSize: '0.95rem',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.04)', transition: 'all 0.2s'
                            }}
                          >
                            <Plus size={20} /> Activar Cuenta Regresiva
                          </button>
                        ) : (
                          <div className="space-y-6">
                            <div>
                              <label className="admin-label" style={{ fontWeight: 800 }}>Título ({activeLang})</label>
                              <input 
                                className="admin-input" 
                                style={{ fontSize: '1.1rem', fontWeight: 900, padding: '1rem' }}
                                value={c.title[activeLang] || ''} 
                                onChange={e => {
                                  const newTitles = { ...c.title, [activeLang]: e.target.value };
                                  updateCountdown(slot, 'title', newTitles);
                                }}
                                placeholder="Ej: Próximo Examen"
                              />
                            </div>

                            <div>
                              <label className="admin-label" style={{ fontWeight: 800 }}>Descripción ({activeLang})</label>
                              <textarea 
                                className="admin-input" 
                                rows={2}
                                style={{ fontSize: '0.9rem', fontWeight: 600, padding: '1rem', borderRadius: '14px' }}
                                value={c.description?.[activeLang] || ''} 
                                onChange={e => {
                                  const newDesc = { ...(c.description || {}), [activeLang]: e.target.value };
                                  updateCountdown(slot, 'description', newDesc);
                                }}
                                placeholder="Contexto..."
                              />
                            </div>

                            <div>
                              <label className="admin-label" style={{ fontWeight: 800 }}>Mensaje al Expirar ({activeLang})</label>
                              <textarea 
                                className="admin-input" 
                                rows={2}
                                style={{ fontSize: '0.9rem', fontWeight: 600, padding: '1rem', borderRadius: '14px' }}
                                value={c.expiredMessage?.[activeLang] || ''} 
                                onChange={e => {
                                  const newExpired = { ...(c.expiredMessage || {}), [activeLang]: e.target.value };
                                  updateCountdown(slot, 'expiredMessage', newExpired);
                                }}
                                placeholder="Ej: Inscripciones cerradas!"
                              />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                              <div>
                                <label className="admin-label" style={{ fontWeight: 800 }}>Fecha Objetivo</label>
                                <input 
                                  type="datetime-local"
                                  className="admin-input"
                                  style={{ fontSize: '0.85rem', padding: '0.8rem', borderRadius: '12px' }}
                                  value={toLocalISOString(c.targetDate)}
                                  onChange={e => updateCountdown(slot, 'targetDate', new Date(e.target.value).toISOString())}
                                />
                              </div>
                              <div>
                                <label className="admin-label" style={{ fontWeight: 800 }}>URL Link</label>
                                <input 
                                  type="url"
                                  className="admin-input"
                                  style={{ fontSize: '0.85rem', padding: '0.8rem', borderRadius: '12px' }}
                                  value={c.url || ''}
                                  onChange={e => updateCountdown(slot, 'url', e.target.value)}
                                  placeholder="https://..."
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      <a href="https://emojis.hoy.today" target="_blank" rel="noopener noreferrer" style={{ position: 'fixed', bottom: '4rem', right: '4.5rem', width: '64px', height: '64px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', color: '#0f172a', zIndex: 9999, border: '2px solid #e2e8f0' }}>
        <Smile size={32} />
      </a>
    </>
  );
}
