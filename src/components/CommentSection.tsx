"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { MessageSquare, Send, Trash2, User as UserIcon, Loader2, Calendar } from "lucide-react"
import { addComment, getComments, deleteComment } from "@/lib/actions"
import Image from "next/image"

interface Comment {
  id: string
  content: string
  createdAt: any
  userId: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

export default function CommentSection({ postSlug, lang = 'es' }: { postSlug: string, lang?: string }) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchComments = async () => {
      const data = await getComments(postSlug)
      setComments(data as any)
      setIsLoading(false)
    }
    fetchComments()
  }, [postSlug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !session?.user) return

    setIsSubmitting(true)
    const res = await addComment(postSlug, newComment)
    if (res.success) {
      setNewComment("")
      const updated = await getComments(postSlug)
      setComments(updated as any)
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Borrar comentario?")) return
    const res = await deleteComment(id)
    if (res.success) {
      setComments(comments.filter(c => c.id !== id))
    }
  }

  const getFirstName = (fullName: string | null) => {
    if (!fullName) return "Estudiante"
    return fullName.split(' ')[0]
  }

  return (
    <section className="comments-container" style={{
      marginTop: '4rem',
      padding: '3rem',
      background: '#ffffff',
      borderRadius: '32px',
      border: '1px solid #f0f0f0',
      boxShadow: '0 20px 50px rgba(0,0,0,0.04)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2.5rem' }}>
        <div style={{ background: '#000', color: '#fff', padding: '0.5rem', borderRadius: '12px' }}>
          <MessageSquare size={22} />
        </div>
        <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-0.02em' }}>
          Comentarios <span style={{ color: '#999', fontSize: '1.2rem', fontWeight: '500', marginLeft: '0.4rem' }}>({comments.length})</span>
        </h2>
      </div>

      {session ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: '3.5rem', position: 'relative' }}>
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            background: '#f8f9fa', 
            padding: '0.8rem', 
            borderRadius: '24px',
            border: '2px solid transparent',
            transition: 'all 0.3s',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
          }} className="input-wrapper">
            <div style={{ padding: '0.5rem' }}>
               {session.user.image ? (
                 <Image src={session.user.image} alt="User" width={40} height={40} style={{ borderRadius: '12px', objectFit: 'cover' }} />
               ) : (
                 <div style={{ width: 40, height: 40, background: '#eee', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <UserIcon size={20} color="#999" />
                 </div>
               )}
            </div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={lang === 'es' ? "Escribe lo que piensas..." : lang === 'pt' ? "Escreva o que pensa..." : "Write what you think..."}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                padding: '0.8rem 0',
                fontSize: '1.05rem',
                minHeight: '60px',
                resize: 'none',
                fontFamily: 'inherit'
              }}
            />
            <button
              disabled={isSubmitting || !newComment.trim()}
              type="submit"
              style={{
                background: newComment.trim() ? '#000' : '#eee',
                color: '#fff',
                width: '45px',
                height: '45px',
                borderRadius: '15px',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                alignSelf: 'flex-end',
                margin: '0.3rem'
              }}
            >
              {isSubmitting ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
            </button>
          </div>
        </form>
      ) : (
        <div style={{ 
          background: '#f8f9fa', 
          padding: '2rem', 
          borderRadius: '24px', 
          textAlign: 'center', 
          marginBottom: '3rem',
          border: '1px dashed #ddd'
        }}>
          <p style={{ margin: 0, color: '#666', fontWeight: '600' }}>
            {lang === 'es' ? "Inicia sesión para participar en la conversación" : lang === 'pt' ? "Inicie sessão para participar na conversa" : "Sign in to join the conversation"}
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gap: '2rem' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Loader2 className="spin" style={{ opacity: 0.2 }} />
          </div>
        ) : comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
            {lang === 'es' ? "Aún no hay comentarios. ¡Sé el primero!" : lang === 'pt' ? "Ainda não há comentários. Seja o primeiro!" : "No comments yet. Be the first!"}
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-card" style={{
              display: 'flex',
              gap: '1.2rem',
              position: 'relative',
              animation: 'fadeIn 0.5s ease'
            }}>
              <div style={{ flexShrink: 0 }}>
                {comment.user.image ? (
                  <Image src={comment.user.image} alt="User" width={48} height={48} style={{ borderRadius: '16px', objectFit: 'cover', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} />
                ) : (
                  <div style={{ width: 48, height: 48, background: '#f0f0f0', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserIcon size={24} color="#ccc" />
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: '800', fontSize: '1rem', color: '#000' }}>
                    {getFirstName(comment.user.name)}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#bbb' }}>
                    <Calendar size={12} />
                    <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>
                      {new Date(comment.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
                <div style={{ 
                  background: '#fcfcfc', 
                  padding: '1rem 1.2rem', 
                  borderRadius: '0 18px 18px 18px',
                  border: '1px solid #f0f0f0',
                  lineHeight: '1.6',
                  color: '#333',
                  fontSize: '1.05rem'
                }}>
                  {comment.content}
                </div>
              </div>
              
              {session?.user?.id === comment.userId && (
                <button 
                  onClick={() => handleDelete(comment.id)}
                  style={{ 
                    position: 'absolute', 
                    top: 0, 
                    right: 0, 
                    background: 'transparent', 
                    border: 'none', 
                    color: '#ff4d4d', 
                    cursor: 'pointer',
                    opacity: 0.3,
                    transition: 'all 0.2s'
                  }}
                  className="delete-comment-btn"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .input-wrapper:focus-within {
          border-color: #000 !important;
          background: #fff !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05) !important;
        }
        .comment-card:hover .delete-comment-btn {
          opacity: 1 !important;
        }
      `}</style>
    </section>
  )
}
