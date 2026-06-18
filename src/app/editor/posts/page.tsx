import { db } from "@/lib/db";
import { Plus, FileText, CheckCircle2, Edit } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import SuccessToast from "@/components/admin/SuccessToast";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { timeAgo } from "@/lib/utils";

export default async function EditorPage() {
  const posts = await db.post.findMany({
    where: {
      unlisted: true,
      slug: { not: 'links' }
    },
    orderBy: { date: 'desc' }
  });

  return (
    <div className="space-y-6 fade-in">
      <Suspense fallback={null}>
        <SuccessToast />
      </Suspense>
      <div className="admin-header">
        <div>
          <div style={{ marginBottom: '0.25rem' }}>
            <h2 className="admin-title">Posts del Blog</h2>
          </div>
          <p className="admin-subtitle">
            Gestión de posts del blog.
          </p>
        </div>
        <Link href="/editor/posts/new" className="btn-primary" style={{ textDecoration: 'none', boxShadow: '0 4px 12px rgba(0, 112, 243, 0.2)' }}>
          <Plus size={18} />
          <span>Nuevo Post</span>
        </Link>
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
            {posts.map((post) => {
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
                          href={`/blog/${post.slug}`}
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
                          <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', padding: '0.3rem 0.6rem', background: '#fef3c7', color: '#b45309', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            Blog
                          </span>
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
                        href={`/editor/posts/${post.id}`}
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
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontWeight: 600 }}>
                  No hay posts del blog
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
