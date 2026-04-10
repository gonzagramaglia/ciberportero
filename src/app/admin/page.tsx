import { db } from "@/lib/db";
import { Link as LinkIcon, FileText, Calendar, Bell, Clock, User as UserIcon } from "lucide-react";
import Link from "next/link";

export default async function AdminPage() {
  const [counts, logs] = await Promise.all([
    {
      links: await db.link.count(),
      posts: await db.post.count(),
      events: await db.calendarEvent.count(),
      notifications: await db.notification.count(),
      countdowns: await db.countdown.count(),
    },
    db.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    })
  ]);

  return (
    <div className="space-y-12">
      <div className="admin-header">
        <div>
          <h2 className="admin-title">Panel de Control</h2>
          <p className="admin-subtitle">Visión general de la plataforma y estadísticas.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard href="/admin/links" title="Links" count={counts.links} icon={<LinkIcon className="text-blue-500" />} />
        <StatCard href="/admin/posts" title="Posts" count={counts.posts} icon={<FileText className="text-emerald-500" />} />
        <StatCard href="/admin/calendar" title="Eventos" count={counts.events} icon={<Calendar className="text-purple-500" />} />
        <StatCard href="/admin/notifications" title="Notificaciones" count={counts.notifications} icon={<Bell className="text-amber-500" />} />
        <StatCard href="/admin/notifications" title="Cuentas Regresivas" count={counts.countdowns} icon={<Clock className="text-rose-500" />} />
      </div>

      <section className="space-y-6">
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Actividad Reciente</h3>
        <div className="admin-card">
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UserIcon size={12} />
                      </div>
                      <span style={{ fontSize: '0.85rem' }}>{log.user?.name || log.user?.email || 'Sistema'}</span>
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
                  <td style={{ textAlign: 'right', fontSize: '0.8rem', color: '#94a3b8' }}>
                    {log.createdAt.toLocaleString()}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                    No hay actividad registrada aún.
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

function StatCard({ title, count, icon, href }: { title: string; count: number; icon: React.ReactNode; href: string }) {
  return (
    <Link href={href} className="stat-card">
      <div className="stat-icon">
        {icon}
      </div>
      <div className="stat-info">
        <p>{title}</p>
        <p>{count}</p>
      </div>
    </Link>
  );
}
