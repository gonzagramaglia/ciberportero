'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Eye, Edit3, Globe, Languages, Info, CheckCircle, AlertCircle, ExternalLink, Smile } from 'lucide-react';
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
  const [adminNotes, setAdminNotes] = useState(post?.adminNotes || '');

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
           adminNotes !== (post?.adminNotes || '') ||
           JSON.stringify(countdowns) !== JSON.stringify(initialCountdowns);
  }, [titles, contents, descriptions, slug, alternativeSlug, published, countdowns, adminNotes, post]);

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
        countdowns,
        adminNotes
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

        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem', background: '#f1f5f9', borderRadius: '16px', width: 'fit-content' }}>
          {(['es', 'en', 'pt'] as Lang[]).map(l => (
            <button
              key={l}
              type="button"
              onClick={() => setActiveLang(l)}
              style={{
                padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none',
                background: activeLang === l ? 'white' : 'transparent',
                color: activeLang === l ? '#0f172a' : '#64748b',
                fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {langNames[l]}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          <div className="admin-card" style={{ padding: '2.5rem', borderRadius: '24px' }}>
            {/* Header de la Card */}
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>Contenido en {langNames[activeLang]}</h3>
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

              {/* Countdown Post Context (si aplica) */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '2rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 900, marginBottom: '1rem' }}>Cuentas Regresivas (Slots locales)</h4>
                {/* Visual simplification here, since countdowns are managed mostly in their own section now */}
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Las cuentas regresivas de este post se vinculan por slot.</p>
              </div>

              {/* NOTAS ADMIN */}
              <div style={{ borderTop: '2px dashed #e2e8f0', paddingTop: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Edit3 size={18} className="text-accent" />
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>Notas de Administración (Privadas)</h4>
                </div>
                <textarea 
                  className="admin-input" rows={4} value={adminNotes} onChange={e => setAdminNotes(e.target.value)} 
                  placeholder="Escribe aquí recordatorios personales sobre este post..."
                  style={{ background: '#fff', border: '1px solid #cbd5e1' }}
                />
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
