'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, ExternalLink, Speaker, Upload, Check, Loader2, Plus, Trash2 } from 'lucide-react';
import { upsertPodcast } from '@/lib/actions';
import LanguageTabs from './LanguageTabs';
import { supabase } from '@/lib/supabase';

interface PodcastEditorProps {
  podcast?: any;
}

type Lang = 'es' | 'en' | 'pt';

export default function PodcastEditor({ podcast }: PodcastEditorProps) {
  const router = useRouter();
  
  // Form state
  const [title, setTitle] = useState(podcast?.title?.es || '');
  const [description, setDescription] = useState(podcast?.description?.es || '');
  const [slug, setSlug] = useState(podcast?.slug || '');
  const [audioUrl, setAudioUrl] = useState(podcast?.audioUrl || '');
  const [subjectId, setSubjectId] = useState(podcast?.subjectId || '');
  const [links, setLinks] = useState<{ title: string, url: string }[]>(podcast?.links || []);
  const [published, setPublished] = useState(podcast?.published ?? true);

  // UI state
  const [isPending, setIsPending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("File selected:", file?.name, file?.type);
    if (!file) return;

    // Check if it's an audio file
    if (!file.type.startsWith('audio/') && !file.name.endsWith('.mp3') && !file.name.endsWith('.wav')) {
        alert('Por favor selecciona un archivo de audio válido (.mp3, .wav, etc)');
        return;
    }

    setIsUploading(true);
    setUploadSuccess(false);

    try {
        console.log("Starting upload to podcasts bucket...");
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`; // Removed redundant 'podcasts/' prefix if bucket name is already 'podcasts'

        const { data, error: uploadError } = await supabase.storage
            .from('podcasts')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

        if (uploadError) {
          console.error("Upload error details:", uploadError);
          throw uploadError;
        }

        console.log("Upload successful, getting public URL...");
        const { data: { publicUrl } } = supabase.storage
            .from('podcasts')
            .getPublicUrl(filePath);

        console.log("Public URL received:", publicUrl);
        setAudioUrl(publicUrl);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error: any) {
        console.error('Error uploading audio:', error);
        alert(`Error al subir: ${error.message || 'Desconocido'}. Verifica las políticas de Supabase.`);
    } finally {
        setIsUploading(false);
    }
  };

  const isDirty = useMemo(() => {
    const initialTitle = podcast?.title?.es || '';
    const initialDescription = podcast?.description?.es || '';
    const initialSlug = podcast?.slug || '';
    const initialAudioUrl = podcast?.audioUrl || '';
    const initialSubjectId = podcast?.subjectId || '';
    const initialPublished = podcast?.published ?? true;
    const initialLinks = JSON.stringify(podcast?.links || []);

    return title !== initialTitle ||
           description !== initialDescription ||
           slug !== initialSlug ||
           audioUrl !== initialAudioUrl ||
           subjectId !== initialSubjectId ||
           published !== initialPublished ||
           JSON.stringify(links) !== initialLinks;
  }, [title, description, slug, audioUrl, subjectId, published, links, podcast]);

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
        subjectId: subjectId === 'none' ? null : subjectId,
        links: links.filter(l => l.url.trim()),
        published,
      });
      router.push(`/admin/podcast?success=${encodeURIComponent(title)}&slug=podcast/${slug}`);
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

          <div>
            <label className="admin-label">Materia / Categoría</label>
            <select 
              className="admin-input"
              style={{ fontSize: '1.1rem', padding: '1rem', borderRadius: '16px', background: '#fff' }}
              value={subjectId || 'none'}
              onChange={e => setSubjectId(e.target.value)}
            >
              <option value="none">Sin materia (General)</option>
              {Object.entries({
                1: "Análisis Matemático I", 2: "Álgebra I", 3: "Gestión de Servicios de Información", 4: "Inglés I", 5: "Sistemas Operativos I",
                6: "Sistemas de Tratamiento de Datos", 7: "Infraestructura de Telecomunicaciones", 8: "Sociedad y Estado", 9: "Sistemas Operativos II", 10: "Lenguajes de Programación",
                11: "Análisis Matemático II", 12: "Álgebra II", 13: "Probabilidad y Estadística", 14: "Inglés II", 15: "Tecnología Operacional",
                16: "Programación Segura", 17: "Ciberseguridad Aplicada", 18: "Dispositivos Remotos e Internet de las Cosas", 19: "Ética Profesional", 20: "Gestión de Seguridad de la Información",
                21: "Protección de Infraestructuras Críticas", 22: "Metodologías de Análisis de Riesgos", 23: "Análisis de Escenarios y Capacidades", 24: "Gobierno y Políticas Públicas", 25: "Informática Forense",
                26: "Relaciones Internacionales", 27: "IA y Aprendizaje de Máquina", 28: "Geopolítica", 29: "Derecho a la Defensa Nacional", 30: "Sistema de Inteligencia Nacional",
                31: "Investigación Operativa", 32: "Criptografía Aplicada", 33: "Gestión de Proyectos", 34: "Instrumento Militar y Sistemas de Armas", 35: "Modelos y Simulación",
                36: "Prospectiva Estratégica", 37: "Actores en el Quinto Dominio"
              }).map(([id, name]) => (
                <option key={id} value={id}>[{id}] {name}</option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <label className="admin-label" style={{ margin: 0 }}>Links Asociados (Opcional - Máx 3)</label>
              {links.length < 3 && (
                <button 
                  type="button" 
                  onClick={() => setLinks([...links, { title: '', url: '' }])}
                  className="btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '10px' }}
                >
                  <Plus size={14} />
                  <span>Agregar link</span>
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {links.length === 0 && (
                <div style={{ padding: '1.5rem', border: '1px dashed #e2e8f0', borderRadius: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                  No hay links asociados.
                </div>
              )}
              {links.map((link, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  alignItems: 'center', 
                  background: '#f8fafc', 
                  padding: '1rem', 
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  animation: 'slideUp 0.3s ease'
                }}>
                  <div style={{ flex: 1 }}>
                    <input 
                      placeholder="Título del link (Ej: Diapositivas)" 
                      className="admin-input" 
                      style={{ padding: '0.6rem', background: '#fff' }}
                      value={link.title}
                      onChange={e => {
                        const newLinks = [...links];
                        newLinks[idx].title = e.target.value;
                        setLinks(newLinks);
                      }}
                    />
                  </div>
                  <div style={{ flex: 2 }}>
                    <input 
                      placeholder="https://..." 
                      className="admin-input" 
                      style={{ padding: '0.6rem', background: '#fff' }}
                      value={link.url}
                      onChange={e => {
                        const newLinks = [...links];
                        newLinks[idx].url = e.target.value;
                        setLinks(newLinks);
                      }}
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setLinks(links.filter((_, i) => i !== idx))}
                    style={{ 
                      width: '36px', height: '36px', borderRadius: '50%', background: '#fff1f2', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#ef4444', border: '1px solid #fecdd3', cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="admin-label">Archivo de Audio</label>
            <div style={{ 
              border: '2px dashed #e2e8f0', 
              borderRadius: '24px', 
              padding: '2rem', 
              textAlign: 'center',
              background: audioUrl ? '#f8fafc' : '#fff',
              transition: 'all 0.2s'
            }}>
              {audioUrl ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem', 
                    background: '#fff', 
                    padding: '1rem 1.5rem', 
                    borderRadius: '20px', 
                    border: '2px solid var(--accent)', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                    maxWidth: '100%',
                    animation: 'slideUp 0.3s ease'
                  }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(var(--accent-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Speaker size={20} className="text-accent" />
                    </div>
                    <div style={{ textAlign: 'left', minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Audio cargado</p>
                      <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {audioUrl.split('/').pop()}
                      </p>
                    </div>
                    {uploadSuccess && (
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <label 
                      htmlFor="audio-upload" 
                      className="btn-secondary"
                      style={{ 
                        cursor: 'pointer', 
                        padding: '0.6rem 1.25rem', 
                        fontSize: '0.85rem', 
                        borderRadius: '12px',
                        background: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Upload size={14} />
                      <span>Cambiar archivo</span>
                    </label>
                    <button 
                      type="button" 
                      onClick={() => setAudioUrl('')} 
                      className="btn-secondary"
                      style={{ 
                        padding: '0.6rem 1.25rem', 
                        fontSize: '0.85rem', 
                        borderRadius: '12px',
                        color: '#ef4444', 
                        borderColor: '#fee2e2',
                        background: '#fff1f2',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <X size={14} />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    <Upload size={32} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 800, color: '#1e293b' }}>
                      {isUploading ? 'Subiendo audio...' : 'Haz clic para subir un audio'}
                    </p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                      MP3, WAV o similar
                    </p>
                  </div>
                  <label 
                    htmlFor="audio-upload" 
                    className={`btn-primary ${isUploading ? 'loading' : ''}`}
                    style={{ marginTop: '0.5rem', cursor: isUploading ? 'not-allowed' : 'pointer' }}
                  >
                    {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                    <span>{isUploading ? 'Subiendo...' : 'Seleccionar Archivo'}</span>
                  </label>
                </div>
              )}
              <input 
                type="file" 
                id="audio-upload" 
                accept="audio/*" 
                style={{ display: 'none' }} 
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '2.5rem', 
            marginTop: '1rem',
            padding: '2rem',
            background: '#f8fafc',
            borderRadius: '24px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label className="admin-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Slug del audio:</label>
              <input 
                className="admin-input" 
                style={{ width: '250px', background: '#fff' }}
                value={slug} 
                onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} 
                placeholder="slug-del-audio"
                required 
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <button 
                  type="button"
                  onClick={() => setPublished(!published)}
                  style={{ 
                    padding: '0.8rem 1.5rem', 
                    borderRadius: '14px', 
                    background: published ? '#f0fdf4' : '#fff1f2', 
                    border: `2px solid ${published ? '#22c55e' : '#fecdd3'}`,
                    color: published ? '#166534' : '#9f1239',
                    fontWeight: 900,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    minWidth: '130px'
                  }}
               >
                 {published ? 'PUBLICADO' : 'BORRADOR'}
               </button>
               <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, maxWidth: '200px' }}>
                 {published ? 'Visible para todos.' : 'Solo tú puedes verlo.'}
               </span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
