import { db } from "@/lib/db";
import { FileText, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";

export default async function EditorDashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const [postsCount, imagesCount] = await Promise.all([
    db.post.count({ where: { unlisted: true, slug: { not: 'links' } } }),
    db.image.count({ where: { userId } }),
  ]);

  return (
    <div className="space-y-12 fade-in">
      <div className="admin-header">
        <div>
          <h2 className="admin-title">Portal del Editor</h2>
          <p className="admin-subtitle">Visión general de tus publicaciones y contenido multimedia.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard href="/editor/posts" title="Posts del Blog" count={postsCount} icon={<FileText className="text-emerald-500" />} />
        <StatCard href="/editor/images" title="Tus Imágenes" count={imagesCount} icon={<ImageIcon className="text-cyan-500" />} />
      </div>
    </div>
  );
}

function StatCard({ href, title, count, icon }: { href: string; title: string; count: number; icon: React.ReactNode }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div className="admin-card stat-card" style={{ transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', border: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </div>
          <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
            {count}
          </span>
        </div>
        <p style={{ margin: 0, fontWeight: 700, color: '#64748b', fontSize: '0.9rem' }}>{title}</p>
      </div>
    </Link>
  );
}
