'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { uploadImage, getImages, deleteImage } from '@/lib/actions';
import { 
  Upload, X, Copy, Check, Trash2, 
  Image as ImageIcon, Loader2, Plus, 
  FileText, Hash, Info,
  Search, Grid, List,
  Lock as LockIcon
} from 'lucide-react';
import './images.css';
interface ImageManagerProps {
  filterByUploader?: boolean;
  source?: 'admin' | 'editor';
}

export default function ImageManager({ filterByUploader = false, source = 'admin' }: ImageManagerProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [slug, setSlug] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<{id: string, slug: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mounted, setMounted] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const data = await getImages(filterByUploader, source);
      setImages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleFiles = (selectedFile: File) => {
    setFile(selectedFile);
    if (!slug) {
      const baseName = selectedFile.name.split('.')[0]
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(baseName);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !slug) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('slug', slug);
    formData.append('source', source);

    const result = await uploadImage(formData);
    if (result.success) {
      const uploadedSlug = slug;
      const imageUrl = result.image.url;
      setFile(null);
      setSlug('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchImages();
      const redirectPath = source === 'editor' ? '/editor/images' : '/admin/images';
      router.push(`${redirectPath}?success=${encodeURIComponent(uploadedSlug)}&message=${encodeURIComponent('Imagen subida con éxito')}&slug=${encodeURIComponent(imageUrl)}`);
    } else {
      alert(result.error);
    }
    setIsUploading(false);
  };

  const confirmDelete = async () => {
    if (!imageToDelete) return;
    const result = await deleteImage(imageToDelete.id);
    if (result.success) {
      setImages(images.filter(img => img.id !== imageToDelete.id));
      setImageToDelete(null);
    } else {
      alert(result.error);
    }
  };

  const copyToClipboard = (imgSlug: string, id: string) => {
    const url = `${window.location.origin}/image/${imgSlug}`;
    const markdown = `![${imgSlug}](${url})`;
    navigator.clipboard.writeText(markdown);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredImages = images.filter(img => 
    img.slug.toLowerCase().includes(searchQuery.toLowerCase()) || 
    img.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="image-manager-container">
      {/* Stats Bar */}
      <div className="im-stats-grid">
        <div className="im-stat-card">
          <div className="im-stat-icon" style={{ background: '#f0f7ff', color: '#0070f3' }}>
            <ImageIcon size={24} />
          </div>
          <div className="im-stat-info">
            <p>Assets Totales</p>
            <p>{images.length}</p>
          </div>
        </div>

        <div className="im-stat-card">
          <div className="im-stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <Hash size={24} />
          </div>
          <div className="im-stat-info">
            <p>Estado del Bucket</p>
            <div className="im-badge-success">
              <Check size={12} /> PÚBLICO ACTIVO
            </div>
          </div>
        </div>

        <div className="im-stat-card">
          <div className="im-stat-icon" style={{ background: '#fefce8', color: '#ca8a04' }}>
            <Info size={24} />
          </div>
          <div className="im-stat-info">
            <p>Tip de Uso</p>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#a16207', lineHeight: '1.2', marginTop: '0.2rem' }}>
              Copia el código Markdown para insertar imágenes en tus posts fácilmente.
            </p>
          </div>
        </div>
      </div>

      <div className="im-main-layout">
        {/* Upload Column */}
        <section className="im-upload-section">
          <div className="im-card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Nuevo Asset
            </h3>

            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div 
                className={`im-dropzone ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  style={{ display: 'none' }} 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
                
                {file ? (
                  <img 
                    src={URL.createObjectURL(file)} 
                    className="im-preview-img" 
                    alt="Preview" 
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(URL.createObjectURL(file), '_blank');
                    }}
                  />
                ) : (
                  <>
                    <div style={{ padding: '1rem', background: 'white', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                      <Upload size={24} color="#94a3b8" />
                    </div>
                    <div style={{ pointerEvents: 'none' }}>
                      <p style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e293b' }}>Elegir archivo</p>
                      <p style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, marginTop: '0.25rem' }}>PNG, JPG, WEBP (MÁX 5MB)</p>
                    </div>
                  </>
                )}
              </div>

              {file && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>
                      <FileText size={14} /> {file.name}
                    </div>
                    
                    <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                      Slug del Markdown
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Hash size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input 
                        type="text"
                        value={slug}
                        onChange={e => setSlug(e.target.value)}
                        className="admin-input"
                        style={{ paddingLeft: '1.8rem', background: 'white' }}
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isUploading}
                    className="btn-primary"
                    style={{ justifyContent: 'center', height: '50px' }}
                  >
                    {isUploading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>SUBIR ASSET</>
                    )}
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={() => { setFile(null); setSlug(''); }}
                    style={{ border: 'none', background: 'none', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', cursor: 'pointer' }}
                  >
                    CANCELAR
                  </button>
                </div>
              )}
            </form>
          </div>
        </section>

        {/* Gallery Column */}
        <section className="im-card" style={{ padding: 0, overflow: 'hidden' }}>
          <header className="im-library-header">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              Librería de Assets
            </h3>

            <div className="im-search-wrapper">
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Buscar slug o nombre..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="im-search-input"
              />
            </div>
          </header>

          <div className="im-library-content">
            {isLoading ? (
              <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #f1f5f9', borderTopColor: '#0070f3', borderRadius: '50%' }} className="animate-spin"></div>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8' }}>CARGANDO...</p>
              </div>
            ) : filteredImages.length === 0 ? (
              <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: '#94a3b8' }}>
                <ImageIcon size={48} opacity={0.3} />
                <p style={{ fontWeight: 800 }}>No hay assets aún</p>
              </div>
            ) : (
              <div className="im-gallery-list">
                <table className="im-list-table">
                  <thead>
                    <tr>
                      <th>Slug (Click para ver)</th>
                      <th>Nombre del Archivo</th>
                      <th style={{ textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredImages.map(img => (
                      <tr key={img.id} className="im-asset-row">
                        <td>
                          <a 
                            href={img.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="im-asset-slug-link"
                          >
                            <Hash size={14} style={{ marginRight: '4px' }} />
                            {img.slug}
                          </a>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="im-asset-filename">{img.filename}</span>
                            {img.source === 'editor' && source !== 'editor' && (
                              <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: '#fef3c7', color: '#d97706', borderRadius: '4px', fontWeight: 800 }}>EDITOR</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="im-asset-actions-row">
                            <button 
                              onClick={() => copyToClipboard(img.slug, img.id)}
                              className={`im-btn-copy-small ${copiedId === img.id ? 'success' : ''}`}
                              title="Copiar código Markdown"
                            >
                              {copiedId === img.id ? <Check size={14} /> : <Copy size={14} />}
                              <span>{copiedId === img.id ? 'COPIADO' : 'COPIAR'}</span>
                            </button>
                            <button 
                              onClick={() => setImageToDelete({ id: img.id, slug: img.slug })}
                              className="im-btn-delete-small"
                              title="Eliminar"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <footer style={{ padding: '1rem 2rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8' }}>
            <span>FORMATOS: PNG, JPG, WEBP, GIF, SVG</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><LockIcon size={12} /> ALMACENAMIENTO SEGURO</span>
          </footer>
        </section>
      </div>

      {mounted && imageToDelete && createPortal(
        <div 
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}
          onClick={() => setImageToDelete(null)}
        >
          <div 
            style={{ background: 'white', padding: '2rem', borderRadius: '16px', maxWidth: '400px', width: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '1rem', color: '#0f172a' }}>Confirmar Eliminación</h3>
            <p style={{ color: '#475569', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              ¿Estás seguro de que quieres eliminar la imagen <strong>{imageToDelete.slug}</strong>? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
              <button onClick={() => setImageToDelete(null)} className="btn-secondary">Cancelar</button>
              <button onClick={confirmDelete} className="btn-primary" style={{ background: '#ef4444' }}>
                <Trash2 size={16} />
                <span>Eliminar<span className="im-hide-mobile"> Imagen</span></span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style jsx>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
