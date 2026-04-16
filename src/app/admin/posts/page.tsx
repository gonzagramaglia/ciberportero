import { db } from "@/lib/db";
import { Plus, FileText, Edit, CheckCircle2, Languages, Smile } from "lucide-react";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import SuccessToast from "@/components/admin/SuccessToast";
import { Suspense } from "react";
import AdminItemNotes from "@/components/admin/AdminItemNotes";

export default async function AdminPostsPage() {
  const posts = await db.post.findMany({ orderBy: { date: 'desc' } });

  return (
    <div className="space-y-6 fade-in">
      <Suspense fallback={null}>
        <SuccessToast />
      </Suspense>
      <div className="admin-header">
        <div>
          <div style={{ marginBottom: '0.25rem' }}>
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
              <th style={{ width: '50%' }}>Contenido</th>
              <th>Localización</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => {
              const titleObj = post.title as any;
              const hasEs = !!titleObj?.es;
              const hasEn = !!titleObj?.en;
              const hasPt = !!titleObj?.pt;

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
                          href={`/${post.slug}`} 
                          target="_blank" 
                          style={{ fontWeight: 800, color: '#0f172a', textDecoration: 'none', lineHeight: 1.2 }}
                          className="post-title-link"
                        >
                          {titleObj?.es || post.slug}
                        </Link>
                      </div>
                      <AdminItemNotes id={post.id} type="post" initialNotes={post.adminNotes} />
                    </div>
                  </td>
                  <td style={{ verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
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
                  <td style={{ verticalAlign: 'top' }}>
                    <div style={{ marginTop: '0.5rem' }}>
                      {post.published ? (
                        <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', padding: '0.3rem 0.6rem', background: '#dcfce7', color: '#166534', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle2 size={12} /> Publicado
                        </span>
                      ) : (
                        <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', padding: '0.3rem 0.6rem', background: '#fef3c7', color: '#92400e', borderRadius: '8px' }}>Borrador</span>
                      )}
                    </div>
                  </td>
                  <td style={{ color: '#64748b', whiteSpace: 'nowrap', fontSize: '0.85rem', fontWeight: 600, verticalAlign: 'top', paddingTop: '1.25rem' }}>
                    {new Date(post.date || post.createdAt).toLocaleDateString()}
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
          </tbody>
        </table>
      </div>
      <a 
        href="https://emojis.hoy.today" 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ 
          position: 'fixed', bottom: '4rem', right: '4.5rem', width: '64px', height: '64px', borderRadius: '50%', background: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          color: '#0f172a', zIndex: 9999, border: '2px solid #e2e8f0'
        }}
      >
        <Smile size={32} />
      </a>
    </div>
  );
}
