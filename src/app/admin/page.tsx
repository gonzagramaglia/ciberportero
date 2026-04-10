import { db } from "@/lib/db";
import { Link as LinkIcon, FileText, Calendar, Bell, Clock } from "lucide-react";
import Link from "next/link";

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
