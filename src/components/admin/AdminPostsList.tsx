'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, CheckCircle2, Edit } from 'lucide-react';
import { DeleteButton } from './DeleteButton';
import { timeAgo } from '@/lib/utils';

interface AdminPostsListProps {
  posts: any[];
}

export default function AdminPostsList({ posts }: AdminPostsListProps) {
  const [tab, setTab] = useState<'listed' | 'unlisted'>('listed');

  const filteredPosts = posts.filter(p => {
    if (tab === 'unlisted') return p.unlisted;
    return !p.unlisted;
  });

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setTab('listed')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '0.9rem',
            fontWeight: 800,
            cursor: 'pointer',
            padding: '0.5rem 1rem',
            color: tab === 'listed' ? '#0f172a' : '#64748b',
            borderBottom: tab === 'listed' ? '2px solid #0f172a' : '2px solid transparent',
            marginBottom: '-0.6rem'
          }}
        >
          Posts del Inicio
        </button>
        <button
          onClick={() => setTab('unlisted')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '0.9rem',
            fontWeight: 800,
            cursor: 'pointer',
            padding: '0.5rem 1rem',
            color: tab === 'unlisted' ? '#0f172a' : '#64748b',
            borderBottom: tab === 'unlisted' ? '2px solid #0f172a' : '2px solid transparent',
            marginBottom: '-0.6rem'
          }}
        >
          No Listados
        </button>
      </div>

      <div className="admin-card table-container" style={{ borderRadius: '20px' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Contenido</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Última Actualización</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.map((post) => {
              const titleObj = post.title as any;

              return (
                <tr key={post.id}>
                  <td style={{ verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div className="admin-flex-center">
                        <div style={{ 
                          width: '32px', height: '32px', borderRadius: '8px', 
                          background: '#f8fafc', display: 'flex', alignItems: 'center', 
                          justifyContent: 'center', color: '#64748b', border: '1px solid #e2e8f0',
                          flexShrink: 0
                        }}>
                          <FileText size={16} />
                        </div>
                        <Link 
                          href={post.unlisted ? `/blog/${post.slug}` : `/${post.slug}`} 
                          target="_blank" 
                          style={{ fontWeight: 800, color: '#0f172a', textDecoration: 'none', lineHeight: 1.2 }}
                          className="post-title-link"
                        >
                          {titleObj?.es || post.slug}
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td style={{ verticalAlign: 'top' }}>
                    <div style={{ marginTop: '0.5rem' }}>
                      {post.published ? (
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', padding: '0.3rem 0.6rem', background: '#dcfce7', color: '#166534', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CheckCircle2 size={12} /> Publicado
                          </span>
                          {post.unlisted && (
                            <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', padding: '0.3rem 0.6rem', background: '#fef3c7', color: '#b45309', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                              Oculto
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', padding: '0.3rem 0.6rem', background: '#fef3c7', color: '#92400e', borderRadius: '8px' }}>Borrador</span>
                      )}
                    </div>
                  </td>
                  <td style={{ color: '#64748b', whiteSpace: 'nowrap', fontSize: '0.85rem', fontWeight: 600, verticalAlign: 'top', paddingTop: '1.25rem' }}>
                    {new Date(post.date || post.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ color: '#64748b', whiteSpace: 'nowrap', fontSize: '0.85rem', fontWeight: 600, verticalAlign: 'top', paddingTop: '1.25rem' }}>
                    {timeAgo(post.updatedAt || post.createdAt)}
                  </td>
                  <td style={{ textAlign: 'right', verticalAlign: 'top', paddingTop: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <Link 
                        href={`/admin/posts/${post.id}`} 
                        style={{ 
                          width: '36px', height: '36px', borderRadius: '50%', background: 'white', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#94a3b8', border: '1px solid #e2e8f0', transition: 'all 0.2s'
                        }}
                      >
                        <Edit size={16} />
                      </Link>
                      <DeleteButton id={post.id} type="post" />
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredPosts.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontWeight: 600 }}>
                  No hay posts en esta sección
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
