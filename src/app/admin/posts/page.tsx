import { db } from "@/lib/db";
import { Plus, FileText, Globe, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deletePost } from "@/lib/actions";

export default async function AdminPostsPage() {
  const posts = await db.post.findMany({ orderBy: { date: 'desc' } });

  return (
    <div className="space-y-6">
      <div className="admin-header">
        <div>
          <h2 className="admin-title">Posts y Notas</h2>
          <p className="admin-subtitle">
            Administra el contenido del portal por idioma. Ver{" "}
            <Link href="/" target="_blank" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'underline' }}>
              Página de Inicio
            </Link>.
          </p>
        </div>
        <Link href="/admin/posts/new" className="btn-primary" style={{ textDecoration: 'none' }}>
          <Plus size={18} />
          <span>Nuevo Post</span>
        </Link>
      </div>

      <div className="admin-card table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Idioma</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>
                  <div className="admin-flex-center">
                    <FileText size={18} style={{ color: '#94a3b8', flexShrink: 0 }} />
                    <Link 
                      href={`/${post.slug}`} 
                      target="_blank" 
                      style={{ fontWeight: 600, color: 'inherit', textDecoration: 'none', whiteSpace: 'nowrap' }}
                      className="post-title-link"
                    >
                      {post.title}
                    </Link>
                  </div>
                </td>
                <td>
                  <div className="admin-flex-center" style={{ gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                    <Globe size={14} />
                    {post.lang}
                  </div>
                </td>
                <td>
                  {post.published ? (
                    <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', padding: '0.2rem 0.5rem', background: '#dcfce7', color: '#166534', borderRadius: '6px', whiteSpace: 'nowrap' }}>Publicado</span>
                  ) : (
                    <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', padding: '0.2rem 0.5rem', background: '#fef3c7', color: '#92400e', borderRadius: '6px', whiteSpace: 'nowrap' }}>Borrador</span>
                  )}
                </td>
                <td style={{ color: '#64748b', whiteSpace: 'nowrap' }}>{new Date(post.date || post.createdAt).toLocaleDateString()}</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <Link href={`/admin/posts/${post.id}`} style={{ color: '#64748b' }}><Edit size={18} /></Link>
                    <DeleteButton id={post.id} type="post" />
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>No hay posts en la base de datos.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
