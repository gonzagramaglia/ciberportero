'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { addComment, deleteComment, getComments } from '@/lib/actions';
import { MessageSquare, Send, Trash2, User as UserIcon } from 'lucide-react';

interface CommentWithUser {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export default function CommentSection({ postSlug, lang }: { postSlug: string, lang: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      const data = await getComments(postSlug);
      setComments(data as any);
      setLoading(false);
    };
    fetchComments();
  }, [postSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const res = await addComment(postSlug, newComment);
    if (res.success) {
      setNewComment('');
      // Refresh comments
      const data = await getComments(postSlug);
      setComments(data as any);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(lang === 'es' ? '¿Eliminar comentario?' : 'Delete comment?')) return;
    const res = await deleteComment(id);
    if (res.success) {
      setComments(comments.filter(c => c.id !== id));
    }
  };

  return (
    <div className="comment-section" style={{ marginTop: '4rem', padding: '2rem', borderTop: '1px solid var(--border)', background: '#fafafa', borderRadius: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem' }}>
        <MessageSquare size={24} color="var(--primary)" />
        <h3 style={{ margin: 0, fontWeight: '900', fontSize: '1.5rem' }}>
          {lang === 'es' ? 'Comentarios' : lang === 'pt' ? 'Comentários' : 'Comments'}
          <span style={{ marginLeft: '0.8rem', color: 'var(--muted)', fontSize: '1rem', fontWeight: '500' }}>({comments.length})</span>
        </h3>
      </div>

      {session ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: '3rem', position: 'relative' }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={lang === 'es' ? 'Escribe lo que piensas...' : 'Write your thoughts...'}
            style={{
              width: '100%',
              padding: '1.2rem',
              paddingRight: '4rem',
              borderRadius: '18px',
              border: '2px solid var(--border)',
              background: '#fff',
              minHeight: '100px',
              fontSize: '1rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              transition: 'all 0.2s',
              resize: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#000'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              background: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '0.6rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isSubmitting || !newComment.trim() ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
          >
            <Send size={18} />
          </button>
        </form>
      ) : (
        <div style={{ 
          padding: '2rem', 
          background: '#fff', 
          borderRadius: '18px', 
          textAlign: 'center', 
          border: '1px dashed var(--border)',
          marginBottom: '3rem'
        }}>
          <p style={{ margin: 0, fontWeight: '600', color: 'var(--muted)' }}>
            {lang === 'es' ? 'Inicia sesión para dejar un comentario' : 'Sign in to leave a comment'}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {loading ? (
             <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>...</div>
        ) : comments.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)', fontWeight: '500' }}>
             {lang === 'es' ? 'Aún no hay comentarios. ¡Sé el primero!' : 'No comments yet. Be the first!'}
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item" style={{ 
              display: 'flex', 
              gap: '1rem', 
              background: '#fff', 
              padding: '1.2rem', 
              borderRadius: '18px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
              border: '1px solid rgba(0,0,0,0.03)'
            }}>
              {comment.user.image ? (
                <img src={comment.user.image} alt={comment.user.name || ''} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
              ) : (
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyItems: 'center', padding: '10px' }}>
                     <UserIcon size={20} color="#ccc" />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>{comment.user.name || 'Usuario'}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                      {new Date(comment.createdAt).toLocaleDateString(lang, { day: 'numeric', month: 'short' })}
                    </span>
                    {(session?.user?.id === comment.userId || (session?.user as any)?.role === 'admin') && (
                      <button 
                        onClick={() => handleDelete(comment.id)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', opacity: 0.6, padding: 2 }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5', color: '#333' }}>{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
