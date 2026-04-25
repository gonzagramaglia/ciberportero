import { db } from "@/lib/db";
import { Link as LinkIcon, FileText, Calendar, Bell, Clock, User as UserIcon, MessageSquare, Image as ImageIcon, Users, Hash } from "lucide-react";
import Link from "next/link";
import { getAdminNote } from "@/lib/actions";
import AdminSectionNotes from "@/components/admin/AdminSectionNotes";

export default async function AdminPage() {
  const getRoomsCount = async () => {
    try {
      return await db.room.count();
    } catch (e) {
      console.error("Error fetching rooms count:", e);
      return 0;
    }
  };

  const [counts, logs, note] = await Promise.all([
    {
      links: await db.link.count(),
      posts: await db.post.count(),
      events: await db.calendarEvent.count(),
      notifications: await db.notification.count(),
      countdowns: await db.countdown.count(),
      comments: await db.comment.count(),
      users: await db.user.count(),
      images: await db.image.count(),
      rooms: await getRoomsCount(),
    },
    db.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    }),
    getAdminNote('dashboard')
  ]);

  return (
    <div className="space-y-12">
      <div className="admin-header">
        <div>
          <h2 className="admin-title">Panel de Control</h2>
          <p className="admin-subtitle">Visión general de la plataforma y estadísticas globales.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard href="/admin/links" title="Links" count={counts.links} icon={<LinkIcon className="text-blue-500" />} />
        <StatCard href="/admin/posts" title="Posts" count={counts.posts} icon={<FileText className="text-emerald-500" />} />
        <StatCard href="/admin/calendar" title="Eventos" count={counts.events} icon={<Calendar className="text-purple-500" />} />
        <StatCard href="/admin/notifications" title="Notificaciones" count={counts.notifications} icon={<Bell className="text-amber-500" />} />
        <StatCard href="/admin/countdowns" title="Cuentas Regresivas" count={counts.countdowns} icon={<Clock className="text-rose-500" />} />
        <StatCard href="/admin/comments" title="Comentarios" count={counts.comments} icon={<MessageSquare className="text-indigo-500" />} />
        <StatCard href="/admin/users" title="Usuarios" count={counts.users} icon={<Users className="text-orange-500" />} />
        <StatCard href="/admin/images" title="Imágenes" count={counts.images} icon={<ImageIcon className="text-cyan-500" />} />
        <StatCard href="/admin/rooms" title="Rooms" count={counts.rooms} icon={<Hash className="text-blue-600" />} disabled={true} />
      </div>

      <section>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '2rem', letterSpacing: '-0.02em' }}>Actividad Reciente</h3>
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
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                    No hay actividad registrada aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AdminSectionNotes section="dashboard" initialContent={note?.content || ''} />
    </div>
  );
}

function StatCard({ title, count, icon, href, disabled }: { title: string; count: number; icon: React.ReactNode; href: string; disabled?: boolean }) {
  if (disabled) {
    return (
      <div className="stat-card" style={{ opacity: 0.5, cursor: 'not-allowed', position: 'relative' }}>
        <div className="stat-icon">
          {icon}
        </div>
        <div className="stat-info">
          <p>{title}</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {count}
            <span style={{ fontSize: '9px', background: '#e2e8f0', color: '#64748b', padding: '1px 6px', borderRadius: '4px', fontWeight: 900, textTransform: 'uppercase' }}>Próximamente</span>
          </p>
        </div>
      </div>
    );
  }

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
