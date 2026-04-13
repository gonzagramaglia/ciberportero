import { db } from "@/lib/db";
import { Plus, FileText, Globe, Trash2, Edit, CheckCircle2, Languages } from "lucide-react";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deletePost } from "@/lib/actions";

export default async function AdminPostsPage() {
  const posts = await db.post.findMany({ orderBy: { date: 'desc' } });

  return (
    <div className="space-y-6 fade-in">
      <div className="admin-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <Languages size={24} className="text-accent" />
            <h2 className="admin-title">Posts Multilingües</h2>
          </div>
          <p className="admin-subtitle">
            Gestión centralizada de artículos en ES, EN y PT. Ver{" "}
            <Link href="/" target="_blank" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'underline' }}>
              Portal Público
            </Link>.
          </p>
        </div>
        <Link href="/admin/posts/new" className="btn-primary" style={{ textDecoration: 'none', boxShadow: '0 4px 12px rgba(0, 112, 243, 0.2)' }}>
          <Plus size={18} />
          <span>Nuevo Post</span>
        </Link>
      </div>

      <div className="admin-card table-container" style={{ borderRadius: '20px' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Título (ES)</th>
              <th>Localización</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => {
              const titleObj = post.title as any;
              const contentObj = post.content as any;
              const hasEs = !!titleObj?.es && !!contentObj?.es;
              const hasEn = !!titleObj?.en && !!contentObj?.en;
              const hasPt = !!titleObj?.pt && !!contentObj?.pt;

              return (
                <tr key={post.id}>
                  <td>
                    <div className="admin-flex-center">
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '8px', 
                        background: '#f8fafc', display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', color: '#64748b', border: '1px solid #e2e8f0' 
                      }}>
                        <FileText size={16} />
                      </div>
                      <Link 
                        href={`/${post.slug}`} 
                        target="_blank" 
                        style={{ fontWeight: 700, color: '#0f172a', textDecoration: 'none', whiteSpace: 'nowrap' }}
                        className="post-title-link"
                      >
                        {titleObj?.es || post.slug}
                      </Link>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {['es', 'en', 'pt'].map(lang => {
                        const exists = lang === 'es' ? hasEs : lang === 'en' ? hasEn : hasPt;
                        return (
                          <span key={lang} style={{ 
                            fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', 
                            padding: '0.15rem 0.4rem', borderRadius: '4px',
                            background: exists ? '#f1f5f9' : '#fff1f2',
                            color: exists ? '#475569' : '#e11d48',
                            border: `1px solid ${exists ? '#e2e8f0' : '#fecdd3'}`,
                            opacity: exists ? 1 : 0.6
                          }}>
                            {lang}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td>
                    {post.published ? (
                      <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', padding: '0.3rem 0.6rem', background: '#dcfce7', color: '#166534', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle2 size={12} /> Publicado
                      </span>
                    ) : (
                      <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', padding: '0.3rem 0.6rem', background: '#fef3c7', color: '#92400e', borderRadius: '8px' }}>Borrador</span>
                    )}
                  </td>
                  <td style={{ color: '#64748b', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>{new Date(post.date || post.createdAt).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                      <Link href={`/admin/posts/${post.id}`} style={{ color: '#64748b', transition: 'color 0.2s' }} className="hover-text-accent">
                        <Edit size={20} />
                      </Link>
                      <DeleteButton id={post.id} type="post" />
                    </div>
                  </td>
                </tr>
              );
            })}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '6rem 3rem', textAlign: 'center' }}>
                  <Languages size={48} style={{ color: '#cbd5e1', marginBottom: '1rem', margin: '0 auto' }} />
                  <p style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: 500 }}>No hay posts multilingües en la base de datos.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
