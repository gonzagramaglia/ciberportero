'use client';

import { useState, useEffect } from 'react';
import { uploadImage, getImages, deleteImage } from '@/lib/actions';
import { Upload, X, Copy, Check, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function ImageManager() {
  const [file, setFile] = useState<File | null>(null);
  const [slug, setSlug] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const data = await getImages();
    setImages(data);
    setIsLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      // Auto-generate slug from filename
      if (!slug) {
        setSlug(selectedFile.name.split('.')[0]
          .toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .replace(/[^\w-]+/g, '-'));
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !slug) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('slug', slug);

    const result = await uploadImage(formData);
    if (result.success) {
      setFile(null);
      setSlug('');
      // Reset input file
      const input = document.getElementById('image-upload') as HTMLInputElement;
      if (input) input.value = '';
      fetchImages();
    } else {
      alert(result.error);
    }
    setIsUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta imagen?')) return;
    const result = await deleteImage(id);
    if (result.success) {
      fetchImages();
    } else {
      alert(result.error);
    }
  };

  const copyToClipboard = (slug: string, id: string) => {
    const url = `${window.location.origin}/image/${slug}`;
    const markdown = `![${slug}](${url})`;
    navigator.clipboard.writeText(markdown);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="admin-card p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Upload size={20} /> Subir nueva imagen
        </h3>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Archivo</label>
              <input 
                id="image-upload"
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">Slug (Ej: mi-imagen)</label>
              <input 
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="nombre-de-la-imagen"
                className="admin-input"
                required
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={isUploading || !file}
            className="btn-primary w-full md:w-auto"
          >
            {isUploading ? <Loader2 className="animate-spin" /> : 'Subir Imagen'}
          </button>
        </form>
      </div>

      <div className="admin-card p-6">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <ImageIcon size={20} /> Galería de Imágenes
        </h3>
        
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-accent" size={32} />
          </div>
        ) : images.length === 0 ? (
          <p className="text-center text-muted py-12">No hay imágenes subidas aún.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map(img => (
              <div key={img.id} className="group relative bg-slate-50 rounded-xl overflow-hidden border border-slate-200 hover:border-accent transition-all">
                <div className="aspect-video relative bg-slate-200">
                  <img src={img.url} alt={img.slug} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <p className="font-bold text-sm truncate">{img.slug}</p>
                  <p className="text-xs text-muted truncate">{img.filename}</p>
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={() => copyToClipboard(img.slug, img.id)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs font-bold p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                      {copiedId === img.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      {copiedId === img.id ? 'Copiado' : 'Copiar Markdown'}
                    </button>
                    <button 
                      onClick={() => handleDelete(img.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
