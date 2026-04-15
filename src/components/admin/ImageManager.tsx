'use client';

import { useState, useEffect, useRef } from 'react';
import { uploadImage, getImages, deleteImage } from '@/lib/actions';
import { 
  Upload, X, Copy, Check, Trash2, 
  Image as ImageIcon, Loader2, Plus, 
  FileText, ExternalLink, Hash, Info,
  AlertCircle, Search, Grid, List,
  Filter, MoreVertical, Download, Lock as LockIcon
} from 'lucide-react';

export default function ImageManager() {
  const [file, setFile] = useState<File | null>(null);
  const [slug, setSlug] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setIsLoading(true);
    const data = await getImages();
    setImages(data);
    setIsLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleFiles = (selectedFile: File) => {
    setFile(selectedFile);
    // Auto-generate slug from filename if empty
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

    const result = await uploadImage(formData);
    if (result.success) {
      setFile(null);
      setSlug('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchImages();
    } else {
      alert(result.error);
    }
    setIsUploading(false);
  };

  const handleDelete = async (id: string, slug: string) => {
    if (!confirm(`¿Estás seguro de eliminar la imagen "${slug}"?`)) return;
    const result = await deleteImage(id);
    if (result.success) {
      setImages(images.filter(img => img.id !== id));
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
    <div className="space-y-8 fade-in">
      {/* 🚀 Top Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="admin-card p-6 flex items-center gap-4 bg-white shadow-sm border-slate-100">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <ImageIcon size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Assets</p>
            <p className="text-2xl font-black text-slate-900">{images.length}</p>
          </div>
        </div>
        <div className="admin-card p-6 flex items-center gap-4 bg-white shadow-sm border-slate-100">
          <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
            <Hash size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bucket Status</p>
            <p className="text-sm font-black text-green-600 flex items-center gap-1">
              <Check size={14} /> PUBLIC ACTIVE
            </p>
          </div>
        </div>
        <div className="admin-card p-6 flex items-center gap-4 bg-white shadow-sm border-slate-100">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Info size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Usage Tip</p>
            <p className="text-xs font-semibold text-slate-600 leading-tight">
              Usa slugs cortos para URLs limpias en tus posts.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 📤 LEFT COLUMN: Upload Experience */}
        <div className="lg:col-span-4 space-y-6">
          <div className="admin-card p-8 bg-white border-slate-100 shadow-xl shadow-slate-200/50 sticky top-8">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-900">
              <Plus size={20} className="text-accent" />
              Nuevo Asset
            </h3>

            <form onSubmit={handleUpload} className="space-y-6">
              <div 
                className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-8 transition-all duration-300 flex flex-col items-center justify-center gap-4 ${
                  dragActive ? 'border-accent bg-blue-50 scale-[0.98]' : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
                
                {file ? (
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-lg">
                    <img 
                      src={URL.createObjectURL(file)} 
                      className="w-full h-full object-cover" 
                      alt="Preview" 
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white font-bold text-xs">CAMBIAR ARCHIVO</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="text-slate-400 group-hover:text-accent transition-colors" size={28} />
                    </div>
                    <p className="font-bold text-slate-900 text-sm">Suelte o elija archivo</p>
                    <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase tracking-wider">PNG, JPG, WEBP hasta 5MB</p>
                  </div>
                )}
              </div>

              {file && (
                <div className="space-y-4 animate-in">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 text-xs mb-3">
                      <FileText size={14} className="text-slate-400" />
                      <span className="font-bold text-slate-600 truncate">{file.name}</span>
                    </div>
                    
                    <label className="admin-label text-[10px]">Slug para el Markdown</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Hash size={16} />
                      </div>
                      <input 
                        type="text"
                        value={slug}
                        onChange={e => setSlug(e.target.value)}
                        placeholder="ej: mapa-estudios"
                        className="admin-input pl-10"
                        style={{ background: 'white' }}
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isUploading}
                    className="btn-primary w-full h-14 justify-center text-md shadow-lg shadow-accent/25"
                  >
                    {isUploading ? (
                      <Loader2 className="animate-spin" size={22} />
                    ) : (
                      <><Upload size={18} /> PUBLICAR ASSET</>
                    )}
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={() => { setFile(null); setSlug(''); }}
                    className="w-full text-xs font-bold text-slate-400 hover:text-red-500 transition-colors py-2"
                  >
                    DESCARTAR
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* 🖼️ RIGHT COLUMN: Gallery & Management */}
        <div className="lg:col-span-8 flex flex-col h-full">
          <div className="admin-card bg-white border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="p-6 border-bottom flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <Grid size={18} className="text-slate-400" />
                <h3 className="text-lg font-black text-slate-900">Librería de Assets</h3>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                   <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                    type="text" 
                    placeholder="Buscar slug o nombre..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="admin-input pl-9 h-10 text-xs font-semibold"
                    style={{ background: 'white' }}
                   />
                </div>
                <div className="flex bg-white rounded-xl border border-slate-200 p-1">
                   <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400'}`}
                   >
                     <Grid size={16} />
                   </button>
                   <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400'}`}
                   >
                     <List size={16} />
                   </button>
                </div>
              </div>
            </div>

            <div className="p-8 flex-1 overflow-y-auto max-h-[800px] bg-white">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-12 h-12 border-4 border-slate-100 border-t-accent rounded-full animate-spin"></div>
                  <p className="text-sm font-bold text-slate-400">CARGANDO GALERÍA...</p>
                </div>
              ) : filteredImages.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                    <ImageIcon size={40} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-black text-slate-900">No se encontraron assets</p>
                    <p className="text-xs text-slate-400 font-bold">Intenta con otra búsqueda o sube uno nuevo.</p>
                  </div>
                </div>
              ) : (
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-in" 
                  : "flex flex-col gap-3 animate-in"
                }>
                  {filteredImages.map(img => (
                    <div 
                      key={img.id} 
                      className={`group relative bg-white border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:border-accent/40 ${
                        viewMode === 'grid' ? 'flex flex-col' : 'flex items-center p-3 gap-4 h-24'
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className={`${
                        viewMode === 'grid' ? 'w-full aspect-[4/3]' : 'w-20 h-full'
                      } bg-slate-50 relative overflow-hidden flex-shrink-0`}>
                        <img 
                          src={img.url} 
                          alt={img.slug} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors pointer-events-none" />
                      </div>

                      {/* Content */}
                      <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex items-center justify-between' : ''}`}>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Hash size={12} className="text-accent opacity-50" />
                            <p className="font-black text-sm text-slate-900 truncate max-w-[150px]">{img.slug}</p>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold truncate opacity-80 uppercase tracking-tighter">
                            {img.filename.length > 25 ? img.filename.substring(0, 22) + '...' : img.filename}
                          </p>
                        </div>
                        
                        {/* Actions */}
                        <div className={`flex gap-2 ${viewMode === 'grid' ? 'mt-4' : 'ml-4'}`}>
                          <button 
                            onClick={() => copyToClipboard(img.slug, img.id)}
                            className={`flex flex-1 items-center justify-center gap-2 text-[10px] font-black py-2.5 px-3 rounded-xl transition-all ${
                              copiedId === img.id 
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                                : 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-900/10'
                            }`}
                          >
                            {copiedId === img.id ? <Check size={14} /> : <Copy size={14} />}
                            {copiedId === img.id ? 'COPIADO' : 'COPIAR URL'}
                          </button>
                          
                          <button 
                            onClick={() => handleDelete(img.id, img.slug)}
                            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Eliminar asset"
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

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400">
               <div>SOPORTA: JPG, PNG, WEBP, GIF, SVG</div>
               <div className="flex items-center gap-1">
                 <LockIcon size={10} /> ASSET STORAGE SECURE
               </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-label { font-size: 0.65rem; color: #94a3b8; margin-bottom: 0.5rem; display: block; font-weight: 800; text-transform: uppercase; tracking: 0.05em; }
        .admin-card { border-radius: 28px; transition: border 0.3s ease; }
        .animate-in { animation: fadeIn 0.4s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
