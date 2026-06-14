import "./admin.css";
import Link from "next/link";
import { LayoutDashboard, Link as LinkIcon, FileText, Speaker, Calendar, Bell, ArrowLeft, LogOut, MessageSquare, Image as ImageIcon, Clock, Users, Hash } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminNavLink from "@/components/admin/AdminNavLink";

export const metadata = {
  title: "Admin Panel",
  description: "Ciberportero Administration Panel",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // 1. Basic Auth Check
  if (!session) redirect("/api/auth/signin?callbackUrl=/admin");

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
          <AdminNavLink href="/admin" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <AdminNavLink href="/admin/links" icon={<LinkIcon size={20} />} label="Links" />
          <AdminNavLink href="/admin/posts" icon={<FileText size={20} />} label="Posts" />
          <AdminNavLink href="/admin/podcast" icon={<Speaker size={20} />} label="Audios" />
          <AdminNavLink href="/admin/calendar" icon={<Calendar size={20} />} label="Calendario" />
          <AdminNavLink href="/admin/notifications" icon={<Bell size={20} />} label="Notificaciones" />
          <AdminNavLink href="/admin/countdowns" icon={<Clock size={20} />} label="Cuentas Regresivas" />
          <AdminNavLink href="/admin/comments" icon={<MessageSquare size={20} />} label="Comentarios" />
          <AdminNavLink href="/admin/images" icon={<ImageIcon size={20} />} label="Imágenes" />
          <AdminNavLink href="/admin/rooms" icon={<Hash size={20} />} label="Salas" />
          <AdminNavLink href="/admin/users" icon={<Users size={20} />} label="Usuarios" />
        </nav>

        <div className="sidebar-footer" style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
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
