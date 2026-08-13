'use client';

import { useState } from "react";
import { upsertLink, uploadImage } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Save, Upload, Loader2 } from "lucide-react";
import Link from "next/link";

interface Props {
  initialData?: any;
}

export function LinkEditor({ initialData }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // State for multilingual names
  const [names, setNames] = useState(() => {
    if (typeof initialData?.name === 'string') {
      return { es: initialData.name, en: initialData.name };
    }
    return {
      es: initialData?.name?.es || '',
      en: initialData?.name?.en || '',
    };
  });

  const [url, setUrl] = useState(initialData?.url || '');
  const [iconType, setIconType] = useState(initialData?.iconType || 'external');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const slug = file.name.split('.')[0]
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('slug', slug);
      formData.append('source', 'admin');

      const result = await uploadImage(formData);
      if (result.success && result.image?.url) {
        setIconType(result.image.url);
      } else {
        alert('Error al subir imagen: ' + (result.error || 'Desconocido'));
      }
    } catch {
      alert('Error al subir imagen');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await upsertLink({
        id: initialData?.id,
        name: names,
        url,
        iconType,
      });
      router.push(`/admin/links?success=${encodeURIComponent(names.es)}&message=${encodeURIComponent('Link guardado correctamente')}`);
      router.refresh();
    } catch {
      alert('Error al guardar el link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="admin-header">
        <div>
          <h2 className="admin-title">{initialData ? 'Editar Link' : 'Nuevo Link'}</h2>
          <p className="admin-subtitle">Completa la información en ambos idiomas.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-card" style={{ padding: '2rem', display: 'grid', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label htmlFor="link-name-es" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#64748b' }}>Nombre (Español)</label>
            <input
              id="link-name-es"
              required
              className="admin-input"
              value={names.es}
              onChange={e => setNames({ ...names, es: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}
            />
          </div>
          <div>
            <label htmlFor="link-name-en" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#64748b' }}>Nombre (Inglés)</label>
            <input
              id="link-name-en"
              required
              className="admin-input"
              value={names.en}
              onChange={e => setNames({ ...names, en: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}
            />
          </div>

        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          <div>
            <label htmlFor="link-url" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#64748b' }}>URL del Enlace</label>
            <input
              id="link-url"
              required
              type="url"
              className="admin-input"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://su-enlace-aqui.com"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#64748b' }}>URL del Icono (Opcional)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                className="admin-input"
                placeholder="Ej: /wsp.png o moodle"
                value={iconType}
                onChange={e => setIconType(e.target.value)}
                style={{ flex: 1 }}
              />
              <label style={{
                cursor: isUploadingImage ? 'not-allowed' : 'pointer',
                background: '#f1f5f9',
                padding: '0.75rem',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isUploadingImage ? 0.7 : 1,
                margin: 0
              }}>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                  disabled={isUploadingImage}
                />
                {isUploadingImage ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              </label>
            </div>
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.5rem', marginBottom: 0 }}>Sube una imagen o usa un icono por defecto.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Save size={18} />
            {loading ? 'Guardando...' : 'Guardar Link'}
          </button>
          <Link
            href="/admin/links"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              textDecoration: 'none',
              color: '#64748b',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
