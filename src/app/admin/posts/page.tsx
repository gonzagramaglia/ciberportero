import { db } from "@/lib/db";
import { Plus, FileText, Globe, Trash2, Edit } from "lucide-react";

export default async function AdminPostsPage() {
  const posts = await db.post.findMany({ orderBy: { date: 'desc' } });

  return (
    <div className="space-y-6">
      <div className="admin-header">
        <div>
          <h2 className="admin-title">Posts y Notas</h2>
          <p className="admin-subtitle">Administra el contenido del portal por idioma.</p>
        </div>
        <button className="btn-primary">
          <Plus size={18} />
          <span>Nuevo Post</span>
        </button>
      </div>

      <div className="admin-card">
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText size={18} style={{ color: '#94a3b8' }} />
                    <span style={{ fontWeight: 600 }}>{post.title}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                    <Globe size={14} />
                    {post.lang}
                  </div>
                </td>
                <td>
                  {post.published ? (
                    <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', padding: '0.2rem 0.5rem', background: '#dcfce7', color: '#166534', borderRadius: '6px' }}>Publicado</span>
                  ) : (
                    <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', padding: '0.2rem 0.5rem', background: '#fef3c7', color: '#92400e', borderRadius: '6px' }}>Borrador</span>
                  )}
                </td>
                <td style={{ color: '#64748b' }}>{new Date(post.date).toLocaleDateString()}</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Edit size={18} /></button>
                    <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Trash2 size={18} /></button>
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
