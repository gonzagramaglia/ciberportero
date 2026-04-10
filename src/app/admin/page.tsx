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
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard</h2>
        <p className="text-slate-500 mt-2">Visión general de la plataforma.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Links" count={counts.links} icon={<LinkIcon className="text-blue-500" />} />
        <StatCard title="Posts" count={counts.posts} icon={<FileText className="text-emerald-500" />} />
        <StatCard title="Eventos" count={counts.events} icon={<Calendar className="text-purple-500" />} />
        <StatCard title="Notificaciones" count={counts.notifications} icon={<Bell className="text-amber-500" />} />
        <StatCard title="Cuentas Regresivas" count={counts.countdowns} icon={<Clock className="text-rose-500" />} />
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Mantenimiento</h3>
        <p className="text-sm text-slate-600 mb-6">
          Asegúrate de que la base de datos de Supabase esté sincronizada con Prisma.
        </p>
        <div className="flex gap-4">
          <code className="bg-slate-100 p-3 rounded text-sm flex-1">npx prisma db push</code>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, count, icon }: { title: string; count: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className="p-3 bg-slate-50 rounded-xl">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{count}</p>
      </div>
    </div>
  );
}
