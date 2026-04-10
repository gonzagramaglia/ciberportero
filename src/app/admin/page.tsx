import { db } from "@/lib/db";
import { Link as LinkIcon, FileText, Calendar, Bell, Clock } from "lucide-react";

export default async function AdminPage() {
  const counts = {
    links: await db.link.count(),
    posts: await db.post.count(),
    events: await db.calendarEvent.count(),
    notifications: await db.notification.count(),
    countdowns: await db.countdown.count(),
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="admin-title">Panel de Control</h2>
        <p className="admin-subtitle">Visión general de la plataforma y estadísticas.</p>
      </div>

      <div className="stats-grid">
        <StatCard title="Links" count={counts.links} icon={<LinkIcon className="text-blue-500" />} />
        <StatCard title="Posts" count={counts.posts} icon={<FileText className="text-emerald-500" />} />
        <StatCard title="Eventos" count={counts.events} icon={<Calendar className="text-purple-500" />} />
        <StatCard title="Notificaciones" count={counts.notifications} icon={<Bell className="text-amber-500" />} />
        <StatCard title="Cuentas Regresivas" count={counts.countdowns} icon={<Clock className="text-rose-500" />} />
      </div>

      <div className="admin-card" style={{ padding: '2rem' }}>
        <h3 className="text-lg font-bold mb-4" style={{ margin: '0 0 1rem 0' }}>Mantenimiento</h3>
        <p className="text-sm text-slate-600 mb-6" style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          La base de datos de Supabase está sincronizada con Prisma.
        </p>
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: '0.9rem' }}>
          npx prisma db push
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, count, icon }: { title: string; count: number; icon: React.ReactNode }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        {icon}
      </div>
      <div className="stat-info">
        <p>{title}</p>
        <p>{count}</p>
      </div>
    </div>
  );
}
