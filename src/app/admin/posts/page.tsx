import { db } from "@/lib/db";
import { Plus, FileText, CheckCircle2, Edit, Smile } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import SuccessToast from "@/components/admin/SuccessToast";
import AdminPostsList from "@/components/admin/AdminPostsList";
import { getAdminNote } from "@/lib/actions";
import AdminSectionNotes from "@/components/admin/AdminSectionNotes";
import { timeAgo } from "@/lib/utils";

export default async function AdminPostsPage() {
  const [allPosts, note] = await Promise.all([
    db.post.findMany({ orderBy: { date: 'desc' } }),
    getAdminNote('posts')
  ]);

  const posts = allPosts.filter(p => p.slug !== 'links' && p.title !== 'links');

  return (
    <div className="space-y-6 fade-in">
      <Suspense fallback={null}>
        <SuccessToast />
      </Suspense>
      <div className="admin-header">
        <div>
          <div style={{ marginBottom: '0.25rem' }}>
            <h2 className="admin-title">Posts</h2>
          </div>
          <p className="admin-subtitle">
            Gestión centralizada de artículos. Ver{" "}
            <Link href="/" target="_blank" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'underline' }}>
              Portal Público
            </Link>.
          </p>
        </div>
        <Link href="/admin/posts/new" className="btn-primary" style={{ textDecoration: 'none', boxShadow: '0 4px 12px rgba(0, 112, 243, 0.2)' }}>
          <Plus size={18} />
          <span>Nuevo Post</span>
        </Link>
      </div>

      <AdminPostsList posts={posts} />
      <a 
        href="https://emojis.hoy.today" 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ 
          position: 'fixed', bottom: '4rem', right: '4.5rem', width: '64px', height: '64px', borderRadius: '50%', background: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          color: '#0f172a', zIndex: 9999, border: '2px solid #e2e8f0'
        }}
      >
        <Smile size={32} />
      </a>
      <AdminSectionNotes section="posts" initialContent={note?.content || ''} />
    </div>
  );
}
