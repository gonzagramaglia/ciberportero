import "./admin.css";
import Link from "next/link";
import { LayoutDashboard, Link as LinkIcon, FileText, Calendar, Bell, ArrowLeft, LogOut, MessageSquare } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Ciberportero | Admin Panel",
  description: "Ciberportero Administration Panel",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // 1. Basic Auth Check
  if (!session) redirect("/api/auth/signin");

  // 2. Role Check (Admin only)
  if ((session.user as any).role !== "admin") {
    return (
      <div className="admin-container" style={{ textAlign: 'center', marginTop: '10rem' }}>
        <h1 className="admin-title">Acceso Restringido</h1>
        <p className="admin-subtitle">No tienes permisos para acceder a esta área.</p>
        <Link href="/" className="btn-primary" style={{ display: 'inline-flex', marginTop: '2rem', textDecoration: 'none' }}>Volver al sitio</Link>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Volver al sitio
          </Link>
          <h1 style={{ marginTop: '1.5rem', fontSize: '1.2rem', fontWeight: 900, color: '#1a1a1a' }}>Ciberportero Admin</h1>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, wordBreak: 'break-all' }}>{session.user?.email}</p>
        </div>

        <nav className="nav-list" style={{ flex: 1 }}>
          <NavLink href="/admin" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavLink href="/admin/links" icon={<LinkIcon size={20} />} label="Links" />
          <NavLink href="/admin/posts" icon={<FileText size={20} />} label="Posts" />
          <NavLink href="/admin/calendar" icon={<Calendar size={20} />} label="Calendario" />
          <NavLink href="/admin/notifications" icon={<Bell size={20} />} label="Notificaciones" />
          <NavLink href="/admin/comments" icon={<MessageSquare size={20} />} label="Comentarios" />
        </nav>

        <div style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
          <Link href="/api/auth/signout" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', textDecoration: 'none', color: '#ef4444', fontSize: '0.9rem', fontWeight: 700 }}>
            <LogOut size={20} /> Cerrar Sesión
          </Link>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-container">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <div className="nav-item">
      <Link href={href} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', textDecoration: 'none', color: 'inherit', borderRadius: '12px', fontWeight: 600 }}>
        {icon}
        <span>{label}</span>
      </Link>
    </div>
  );
}
