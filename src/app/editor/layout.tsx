import "../admin/admin.css";
import Link from "next/link";
import { ArrowLeft, LogOut, FileText } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Editor Panel",
  description: "Ciberportero Editor Panel",
};

export default async function EditorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) redirect("/api/auth/signin?callbackUrl=/editor");

  const role = (session.user as any).role;
  if (role !== "admin" && role !== "editor") {
    return (
      <div className="admin-container" style={{ textAlign: 'center', marginTop: '10rem' }}>
        <h1 className="admin-title">Acceso Restringido</h1>
        <p className="admin-subtitle">No tienes permisos para acceder a esta área.</p>
        <Link href="/blog" className="btn-primary" style={{ display: 'inline-flex', marginTop: '2rem', textDecoration: 'none' }}>Volver al blog</Link>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/blog" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Volver al blog
          </Link>
          <h1 style={{ marginTop: '1.5rem', fontSize: '1.2rem', fontWeight: 900, color: '#1a1a1a' }}>Portal Editor</h1>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, wordBreak: 'break-all' }}>{session.user?.email}</p>
        </div>

        <nav className="nav-list" style={{ flex: 1 }}>
          <Link href="/editor" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '12px', background: '#f8fafc', color: '#0f172a', fontWeight: 700, textDecoration: 'none' }}>
            <FileText size={20} /> Posts del Blog
          </Link>
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
