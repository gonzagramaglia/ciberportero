'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, ExternalLink, X } from 'lucide-react';

export default function SuccessToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');

  useEffect(() => {
    const successTitle = searchParams.get('success');
    const successSlug = searchParams.get('slug');
    
    if (successTitle) {
      setTitle(successTitle);
      setSlug(successSlug || '');
      setShow(true);
      
      // Auto hide after 8 seconds
      const timer = setTimeout(() => {
        setShow(false);
        // Clean URL
        router.replace('/admin/posts');
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '1.5rem',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '20px',
      padding: '1.25rem 1.75rem',
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      zIndex: 10000,
      animation: 'slideInTop 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      maxWidth: '400px',
      width: 'calc(100% - 2rem)'
    }}>
      <div style={{ 
        background: '#ecfdf5', 
        color: '#10b981', 
        width: '40px', 
        height: '40px', 
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center', 
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <CheckCircle size={24} />
      </div>
      
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
          ¡Publicado con éxito!
        </p>
        <p style={{ margin: '0.1rem 0 0.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
          "{title}" ya está disponible.
        </p>
        {slug && (
          <a 
            href={`/${slug}`} 
            target="_blank" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.3rem', 
              fontSize: '0.75rem', 
              fontWeight: 800, 
              color: 'var(--accent)',
              textDecoration: 'none'
            }}
          >
            VER POST <ExternalLink size={12} />
          </a>
        )}
      </div>

      <button 
        onClick={() => setShow(false)}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: '#cbd5e1', 
          cursor: 'pointer',
          padding: '0.25rem'
        }}
      >
        <X size={18} />
      </button>

      <style jsx>{`
        @keyframes slideInTop {
          from { transform: translate(-50%, -100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
