import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { MessageCircle, User as UserIcon, Calendar as CalendarIcon, FileText } from "lucide-react";
import DeleteCommentButton from "@/components/DeleteCommentButton";

export const dynamic = 'force-dynamic';

export default async function AdminCommentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== 'admin') redirect("/");

  const comments = await db.comment.findMany({
    include: {
      post: true,
      user: {
        select: { name: true, image: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '900' }}>Gestión de Comentarios</h1>
        <p style={{ color: '#666' }}>Modera las interacciones de la comunidad</p>
      </header>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {comments.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', background: '#fff', borderRadius: '24px', border: '1px solid #eee' }}>
            <MessageCircle size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
            <p style={{ color: '#999', fontWeight: '500' }}>No hay comentarios para moderar</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} style={{ 
              background: '#fff', 
              padding: '1.5rem', 
              borderRadius: '20px', 
              border: '1px solid #eee',
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'flex-start'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f0f0f0', padding: '0.4rem 0.8rem', borderRadius: '10px' }}>
                    <UserIcon size={14} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{comment.user.name || 'Usuario'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#666' }}>
                    <CalendarIcon size={14} />
                    <span style={{ fontSize: '0.85rem' }}>{new Date(comment.createdAt).toLocaleString('es-AR')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#666' }}>
                    <FileText size={14} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Post: {comment.post.title || comment.post.slug}</span>
                  </div>
                </div>
                
                <p style={{ margin: 0, fontSize: '1rem', lineHeight: '1.6', color: '#333' }}>
                  {comment.content}
                </p>
              </div>

              <DeleteCommentButton commentId={comment.id} />
            </div>
          ))
        )}
      </div>
    </>
  );
}
