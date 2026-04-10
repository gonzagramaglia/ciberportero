"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { MessageSquare, Send, Trash2, User as UserIcon, Loader2, Calendar, CornerDownRight } from "lucide-react"
import { addComment, getComments, deleteComment } from "@/lib/actions"
import { SignInButton } from "@/components/AuthButtons"

interface Reply {
  id: string
  content: string
  createdAt: any
  userId: string
  user: { id: string; name: string | null; image: string | null }
  replies?: Reply[]
}

interface Comment extends Reply {
  replies: Reply[]
}

function Avatar({ src, name, size = 40 }: { src?: string | null; name?: string | null; size?: number }) {
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=e2e8f0&color=64748b`
  return src ? (
    <img src={src} alt={name || 'User'} width={size} height={size}
      style={{ borderRadius: size > 36 ? '14px' : '10px', objectFit: 'cover', flexShrink: 0 }}
      onError={(e) => { (e.target as HTMLImageElement).src = fallback }} />
  ) : (
    <div style={{ width: size, height: size, background: '#f0f0f0', borderRadius: size > 36 ? '14px' : '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <UserIcon size={size * 0.5} color="#ccc" />
    </div>
  )
}

function getFirstName(name: string | null) {
  if (!name) return "Estudiante"
  return name.split(' ')[0]
}

function ReplyForm({ onSubmit, onCancel, lang, userImage, userName }: {
  onSubmit: (content: string) => Promise<void>
  onCancel: () => void
  lang: string
  userImage?: string | null
  userName?: string | null
}) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    await onSubmit(text)
    setText('')
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '0.8rem', display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
      <Avatar src={userImage} name={userName} size={32} />
      <div style={{ flex: 1, background: '#f8f9fa', borderRadius: '16px', border: '1px solid #e5e7eb', display: 'flex', gap: '0.5rem', padding: '0.5rem 0.8rem', transition: 'all 0.2s' }} className="reply-input-wrapper">
        <textarea
          autoFocus
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={lang === 'es' ? 'Escribe tu respuesta...' : lang === 'pt' ? 'Escreva sua resposta...' : 'Write your reply...'}
          style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '0.95rem', resize: 'none', minHeight: '40px', fontFamily: 'inherit', lineHeight: 1.5 }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', justifyContent: 'flex-end' }}>
          <button type="submit" disabled={submitting || !text.trim()} style={{ background: text.trim() ? '#000' : '#e5e7eb', color: '#fff', width: '34px', height: '34px', borderRadius: '10px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
            {submitting ? <Loader2 size={14} className="spin" /> : <Send size={14} />}
          </button>
        </div>
      </div>
    </form>
  )
}

function CommentCard({ comment, depth, lang, session, postSlug, onRefresh }: {
  comment: Comment | Reply
  depth: number
  lang: string
  session: any
  postSlug: string
  onRefresh: () => void
}) {
  const [showReplyForm, setShowReplyForm] = useState(false)

  const handleReply = async (content: string) => {
    const res = await addComment(postSlug, content, comment.id)
    if (res.success) {
      setShowReplyForm(false)
      onRefresh()
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Borrar comentario?')) return
    const res = await deleteComment(comment.id)
    if (res.success) onRefresh()
  }

  const isNested = depth > 0
  const canReply = depth < 2 && !!session

  return (
    <div style={{ display: 'flex', gap: '0.9rem', position: 'relative' }}>
      <Avatar src={comment.user.image} name={comment.user.name} size={isNested ? 34 : 44} />
      <div style={{ flex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
          <span style={{ fontWeight: '800', fontSize: isNested ? '0.9rem' : '1rem', color: '#000' }}>
            {getFirstName(comment.user.name)}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#bbb' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '600', textTransform: 'capitalize' }}>
              {new Date(comment.createdAt).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
          {session?.user?.id === comment.userId && (
            <button onClick={handleDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4d4d', opacity: 0.35, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', padding: 0 }} className="delete-comment-btn">
              <Trash2 size={13} />
            </button>
          )}
        </div>

        {/* Bubble */}
        <div style={{ background: isNested ? '#f8f9fa' : '#fcfcfc', padding: isNested ? '0.7rem 1rem' : '1rem 1.2rem', borderRadius: '0 16px 16px 16px', border: '1px solid #f0f0f0', lineHeight: '1.6', color: '#333', fontSize: isNested ? '0.95rem' : '1.05rem' }}>
          {comment.content}
        </div>

        {/* Actions */}
        {canReply && (
          <div style={{ marginTop: '0.4rem' }}>
            <button onClick={() => setShowReplyForm(!showReplyForm)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', color: showReplyForm ? '#000' : '#999', display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'color 0.2s' }}>
              <CornerDownRight size={12} />
              {lang === 'es' ? 'Responder' : lang === 'pt' ? 'Responder' : 'Reply'}
            </button>
          </div>
        )}

        {/* Inline reply form */}
        {showReplyForm && (
          <ReplyForm onSubmit={handleReply} onCancel={() => setShowReplyForm(false)} lang={lang} userImage={session?.user?.image} userName={session?.user?.name} />
        )}

        {/* Nested replies */}
        {'replies' in comment && comment.replies && comment.replies.length > 0 && (
          <div style={{ marginTop: '1rem', paddingLeft: '0.5rem', borderLeft: '2px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {comment.replies.map((reply: Reply) => (
              <CommentCard key={reply.id} comment={reply} depth={depth + 1} lang={lang} session={session} postSlug={postSlug} onRefresh={onRefresh} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function CommentSection({ postSlug, lang = 'es' }: { postSlug: string; lang?: string }) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchComments = async () => {
    const data = await getComments(postSlug)
    setComments(data as any)
    setIsLoading(false)
  }

  useEffect(() => { fetchComments() }, [postSlug])

  const totalCount = comments.reduce((acc, c) => {
    const replyCount = (c.replies || []).reduce((a: number, r: Reply) => a + 1 + (r.replies?.length || 0), 0)
    return acc + 1 + replyCount
  }, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !session?.user) return
    setIsSubmitting(true)
    const res = await addComment(postSlug, newComment)
    if (res.success) {
      setNewComment("")
      await fetchComments()
    }
    setIsSubmitting(false)
  }

  return (
    <section className="comments-container" style={{ marginTop: '4rem', padding: '3rem', background: '#ffffff', borderRadius: '32px', border: '1px solid #f0f0f0', boxShadow: '0 20px 50px rgba(0,0,0,0.04)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2.5rem' }}>
        <MessageSquare size={28} style={{ strokeWidth: 2.5 }} />
        <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-0.02em' }}>
          Comentarios <span style={{ color: '#999', fontSize: '1.2rem', fontWeight: '500', marginLeft: '0.4rem' }}>({totalCount})</span>
        </h2>
      </div>

      {/* New comment form */}
      {session ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', background: '#f8f9fa', padding: '0.8rem', borderRadius: '24px', border: '2px solid transparent', transition: 'all 0.3s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }} className="input-wrapper">
            <div style={{ padding: '0.5rem' }}>
              <Avatar src={session.user.image} name={session.user.name} size={40} />
            </div>
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder={lang === 'es' ? "Escribe lo que piensas..." : lang === 'pt' ? "Escreva o que pensa..." : "Write what you think..."}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '0.8rem 0', fontSize: '1.05rem', minHeight: '60px', resize: 'none', fontFamily: 'inherit' }}
            />
            <button disabled={isSubmitting || !newComment.trim()} type="submit" style={{ background: newComment.trim() ? '#000' : '#eee', color: '#fff', width: '45px', height: '45px', borderRadius: '15px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', alignSelf: 'flex-end', margin: '0.3rem' }}>
              {isSubmitting ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
            </button>
          </div>
        </form>
      ) : (
        <div style={{ background: '#f8f9fa', padding: '2.5rem', borderRadius: '24px', textAlign: 'center', marginBottom: '3rem', border: '1px dashed #ddd', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
          <p style={{ margin: 0, color: '#666', fontWeight: '600', fontSize: '1.1rem' }}>
            {lang === 'es' ? "Iniciá sesión para participar en la conversación" : lang === 'pt' ? "Inicie sessão para participar na conversa" : "Sign in to join the conversation"}
          </p>
          <SignInButton />
        </div>
      )}

      {/* Comments list */}
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
          comments.map(comment => (
            <CommentCard key={comment.id} comment={comment} depth={0} lang={lang} session={session} postSlug={postSlug} onRefresh={fetchComments} />
          ))
        )}
      </div>

      <style jsx>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .input-wrapper:focus-within { border-color: #000 !important; background: #fff !important; }
        .reply-input-wrapper:focus-within { border-color: #000 !important; background: #fff !important; }
        .delete-comment-btn:hover { opacity: 1 !important; }
      `}</style>
    </section>
  )
}
