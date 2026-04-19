import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { MessageCircle, User as UserIcon, Calendar as CalendarIcon, FileText, Speaker } from "lucide-react";
import DeleteCommentButton from "@/components/DeleteCommentButton";
import { getAdminNote } from "@/lib/actions";
import AdminSectionNotes from "@/components/admin/AdminSectionNotes";

export const dynamic = 'force-dynamic';

export default async function AdminCommentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== 'admin') redirect("/");

  const [comments, note] = await Promise.all([
    db.comment.findMany({
      include: {
        post: true,
        podcast: true,
        user: { select: { name: true, image: true } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    getAdminNote('comments')
  ]);

  return (
    <>
      <div className="admin-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 className="admin-title">Gestión de Comentarios</h2>
          <p className="admin-subtitle">Modera las interacciones de la comunidad</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1rem', marginBottom: '3rem' }}>
        {comments.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', background: '#fff', borderRadius: '24px', border: '1px solid #eee' }}>
            <MessageCircle size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
            <p style={{ color: '#999', fontWeight: '500' }}>No hay comentarios para moderar</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="admin-card-row" style={{ 
              background: '#fff', 
              padding: '1.5rem', 
              borderRadius: '24px', 
              border: '1px solid #e2e8f0',
              alignItems: 'flex-start'
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f8fafc', padding: '0.3rem 0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <UserIcon size={12} className="text-accent" />
                    <span style={{ fontSize: '0.75rem', fontWeight: '800' }}>{comment.user.name?.split(' ')[0] || 'Usuario'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8' }}>
                    <CalendarIcon size={12} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b' }}>
                    {comment.post ? <FileText size={12} /> : <Speaker size={12} />}
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                      {comment.post 
                        ? (comment.post.title as any)?.es || comment.post.slug 
                        : (comment.podcast?.title as any)?.es || comment.podcast?.slug || 'Podcast'}
                    </span>
                  </div>
                </div>
                
                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5', color: '#334155', fontWeight: 500 }}>
                  {comment.content}
                </p>
              </div>

              <div className="admin-card-actions">
                <DeleteCommentButton commentId={comment.id} />
              </div>
            </div>
          ))
        )}
      </div>

      <AdminSectionNotes section="comments" initialContent={note?.content || ''} />
    </>
  );
}
