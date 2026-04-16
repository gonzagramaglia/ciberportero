'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Languages, Edit3, ExternalLink, Smile, Clock, Plus, Trash2 } from 'lucide-react';
import { upsertPost } from '@/lib/actions';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LanguageTabs from './LanguageTabs';

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
        content: contents,
        description: descriptions,
        published,
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
    const existing = countdowns.find(c => c.slot === slot);
    if (existing) {
      setCountdowns(countdowns.map(c => c.slot === slot ? { ...c, [field]: value } : c));
    } else {
      const newC = { 
        slot, 
        title: { es: '', en: '', pt: '' }, 
        targetDate: new Date(), 
        description: { es: '', en: '', pt: '' }, 
        isActive: true 
      };
      setCountdowns([...countdowns, { ...newC, [field]: value }]);
    }
  };

  const removeCountdown = (slot: 'left' | 'right') => {
    setCountdowns(countdowns.filter(c => c.slot !== slot));
  };

  const langNames = { es: 'Español', en: 'English', pt: 'Português' };

  return (
    <>
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

        <div className="space-y-6">
          <div className="admin-card" style={{ padding: '2.5rem', borderRadius: '24px' }}>
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>Contenido del Post</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setPreviewMode(!previewMode)}
                style={{ 
                  background: previewMode ? '#1e293b' : '#f8fafc', color: previewMode ? 'white' : '#64748b',
                  border: '1px solid #e2e8f0', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer'
                }}
              >
                {previewMode ? 'EDITAR' : 'PREVISUALIZAR'}
              </button>
            </div>

            <div className="space-y-8">
              {/* Slugs y Estado */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '16px' }}>
                <div>
                  <label className="admin-label">Slug Principal</label>
                  <input className="admin-input" value={slug} onChange={e => setSlug(e.target.value)} required />
                </div>
                <div>
                  <label className="admin-label">Slug Opcional</label>
                  <input className="admin-input" value={alternativeSlug} onChange={e => setAlternativeSlug(e.target.value)} />
                </div>
                <div onClick={() => setPublished(!published)} style={{ cursor: 'pointer', padding: '0.5rem', borderRadius: '12px', background: published ? '#f0fdf4' : '#fff1f2', border: `2px solid ${published ? '#22c55e' : '#fecdd3'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontWeight: 800, color: published ? '#166534' : '#9f1239', fontSize: '0.8rem' }}>{published ? 'PUBLICADO' : 'BORRADOR'}</span>
                </div>
              </div>

              {/* Título e Input */}
              <div>
                <label className="admin-label">Título ({activeLang})</label>
                <input className="admin-input" style={{ fontSize: '1.5rem', fontWeight: 800 }} value={titles[activeLang]} onChange={e => setTitles({...titles, [activeLang]: e.target.value})} />
              </div>

              {/* Editor / Preview */}
              {!previewMode ? (
                <textarea className="admin-input" style={{ minHeight: '500px', fontFamily: 'monospace' }} value={contents[activeLang]} onChange={e => setContents({...contents, [activeLang]: e.target.value})} placeholder="Markdown..." />
              ) : (
                <div className="markdown-preview" style={{ minHeight: '500px', background: '#f8fafc', padding: '2rem', border: '1px dashed #cbd5e1', borderRadius: '16px' }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{contents[activeLang]}</ReactMarkdown>
                </div>
              )}

              {/* Cuentas Regresivas Locales */}
              <div style={{ borderTop: '2px dashed #f1f5f9', paddingTop: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <Clock size={20} className="text-secondary" />
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>Cuentas Regresivas Locales</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>(Solo para este post)</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  {(['left', 'right'] as const).map(slot => {
                    const c = countdowns.find(x => x.slot === slot);
                    return (
                      <div key={slot} style={{ 
                        padding: '1.5rem', borderRadius: '24px', 
                        background: c ? '#f8fafc' : 'rgba(241, 245, 249, 0.5)', 
                        border: c ? '1px solid #e2e8f0' : '2px dashed #e2e8f0',
                        transition: 'all 0.2s'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <span style={{ fontSize: '10px', fontWeight: 900, background: '#0f172a', color: 'white', padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                            SLOT {slot === 'left' ? 'IZQUIERDO' : 'DERECHO'}
                          </span>
                          {c && (
                            <button type="button" onClick={() => removeCountdown(slot)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>

                        {!c ? (
                          <button 
                            type="button" 
                            onClick={() => updateCountdown(slot, 'title', { es: '', en: '', pt: '' })}
                            style={{ 
                              width: '100%', padding: '1rem', borderRadius: '12px', border: 'none',
                              background: 'white', color: '#64748b', fontWeight: 800, fontSize: '0.85rem',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                          >
                            <Plus size={16} /> Activar Slot
                          </button>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <input 
                                className="admin-input" 
                                style={{ fontSize: '0.9rem', fontWeight: 800, padding: '0.5rem' }}
                                value={c.title[activeLang] || ''} 
                                onChange={e => {
                                  const newTitles = { ...c.title, [activeLang]: e.target.value };
                                  updateCountdown(slot, 'title', newTitles);
                                }}
                                placeholder="Título (Slot)"
                              />
                            </div>
                            <div>
                              <input 
                                type="datetime-local"
                                className="admin-input"
                                style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                                value={c.targetDate ? new Date(c.targetDate).toISOString().slice(0, 16) : ''}
                                onChange={e => updateCountdown(slot, 'targetDate', e.target.value)}
                              />
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

    </>
  );
}
