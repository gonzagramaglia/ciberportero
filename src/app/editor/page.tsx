import { db } from "@/lib/db";
import { FileText, Image as ImageIcon, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";

export default async function EditorDashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const [postsCount, imagesCount, logs] = await Promise.all([
    db.post.count({ where: { unlisted: true, slug: { not: 'links' } } }),
    db.image.count({ where: { userId } }),
    db.auditLog.findMany({
      where: { target: 'blog_post' },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    })
  ]);

  return (
    <div className="space-y-12 fade-in">
      <div className="admin-header">
        <div>
          <h2 className="admin-title">Portal del Editor</h2>
          <p className="admin-subtitle">Visión general de tus publicaciones y contenido multimedia.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard href="/editor/posts" title="Posts del Blog" count={postsCount} icon={<FileText className="text-emerald-500" />} />
        <StatCard href="/editor/images" title="Tus Imágenes" count={imagesCount} icon={<ImageIcon className="text-cyan-500" />} />
      </div>

      <section>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '2rem', letterSpacing: '-0.02em' }}>Actividad Reciente del Blog</h3>
        <div className="admin-card table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Acción</th>
                <th>Detalles</th>
                <th style={{ textAlign: 'right' }}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td>
                    <div className="admin-flex-center">
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <UserIcon size={12} />
                      </div>
                      <span style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{log.user?.name || log.user?.email || 'Sistema'}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      fontSize: '10px', 
                      fontWeight: 800, 
                      padding: '0.1rem 0.4rem', 
                      borderRadius: '4px',
                      background: log.action === 'DELETE' ? '#fee2e2' : log.action === 'CREATE' ? '#dcfce7' : '#fef9c3',
                      color: log.action === 'DELETE' ? '#991b1b' : log.action === 'CREATE' ? '#166534' : '#854d0e'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{log.details}</td>
                  <td style={{ textAlign: 'right', fontSize: '0.8rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                    {log.createdAt.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No hay actividad reciente en el blog.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ href, title, count, icon }: { href: string; title: string; count: number; icon: React.ReactNode }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div className="admin-card stat-card" style={{ transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', border: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </div>
          <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
            {count}
          </span>
        </div>
        <p style={{ margin: 0, fontWeight: 700, color: '#64748b', fontSize: '0.9rem' }}>{title}</p>
      </div>
    </Link>
  );
}
