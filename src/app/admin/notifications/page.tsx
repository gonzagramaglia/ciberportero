import { db } from "@/lib/db";
import { Plus, Bell, Clock, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

export default async function AdminNotificationsPage() {
  const notifications = await db.notification.findMany({ orderBy: { createdAt: 'desc' } });
  const countdowns = await db.countdown.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="space-y-12">
      {/* Notifications Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Notificaciones</h2>
            <p className="text-slate-500 mt-2">Banners de alerta en la parte superior del sitio.</p>
          </div>
          <button className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors">
            <Plus size={18} />
            <span>Nueva Alerta</span>
          </button>
        </div>

        <div className="grid gap-4">
          {notifications.map(n => (
            <div key={n.id} className={`p-4 rounded-xl border flex justify-between items-center ${
              n.type === 'danger' ? 'bg-rose-50 border-rose-200 text-rose-900' : 
              n.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' : 
              'bg-blue-50 border-blue-200 text-blue-900'
            }`}>
              <div className="flex items-center gap-3">
                <Bell size={18} />
                <span className="font-medium">{n.message}</span>
                {n.active ? (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-green-200 text-green-800 rounded-full">Activa</span>
                ) : (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full">Inactiva</span>
                )}
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-white/50 rounded-lg transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          {notifications.length === 0 && <p className="text-slate-400 italic text-center py-8">No hay alertas configuradas.</p>}
        </div>
      </section>

      {/* Countdowns Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Cuentas Regresivas</h2>
            <p className="text-slate-500 mt-2">Widgets laterales con cuenta atrás para fechas importantes.</p>
          </div>
          <button className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors">
            <Plus size={18} />
            <span>Nuevo Contador</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {countdowns.map(c => (
            <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <Clock size={16} className="text-blue-500" />
                  {c.title}
                </div>
                {c.isActive ? <ToggleRight className="text-green-500 cursor-pointer" /> : <ToggleLeft className="text-slate-300 cursor-pointer" />}
              </div>
              <p className="text-sm text-slate-500">{c.description}</p>
              <div className="text-xs font-mono bg-slate-50 p-2 rounded text-slate-600">
                Meta: {c.targetDate.toLocaleString()}
              </div>
              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button className="text-slate-400 hover:text-rose-600 p-2 transition-colors"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
          {countdowns.length === 0 && <p className="text-slate-400 italic col-span-2 text-center py-8">No hay contadores configurados.</p>}
        </div>
      </section>
    </div>
  );
}
