import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Link as LinkIcon, FileText, Calendar, Bell, ChevronLeft } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Basic role check (you should set your email as admin in the DB)
  if (!session || (session.user as any).role !== "admin") {
    // For now, if no session, redirect to login. 
    // In a real app, you'd check for the admin role specifically.
    redirect("/api/auth/signin");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col gap-8">
        <div>
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
            <ChevronLeft size={16} />
            <span>Volver al sitio</span>
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Ciberportero Admin</h1>
          <p className="text-xs text-slate-400 mt-1">Panel de Control</p>
        </div>

        <nav className="flex flex-col gap-2">
          <Link href="/admin" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/links" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
            <LinkIcon size={20} />
            <span>Links</span>
          </Link>
          <Link href="/admin/posts" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
            <FileText size={20} />
            <span>Posts</span>
          </Link>
          <Link href="/admin/calendar" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
            <Calendar size={20} />
            <span>Calendario</span>
          </Link>
          <Link href="/admin/notifications" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
            <Bell size={20} />
            <span>Notificaciones</span>
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800 text-xs text-slate-500">
          Sesión: {session.user?.email}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-auto">
        {children}
      </main>
    </div>
  );
}
