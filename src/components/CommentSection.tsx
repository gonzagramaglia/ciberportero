"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { MessageSquare, Send, Trash2, User as UserIcon, Loader2, Calendar, CornerDownRight, Image as ImageIcon, X, Plus } from "lucide-react"
import { addComment, getComments, deleteComment } from "@/lib/actions"
import { supabase } from "@/lib/supabase"
import { SignInButton } from "@/components/AuthButtons"
import { translations } from "@/lib/translations"

interface Reply {
  id: string
  content: string
  createdAt: any
  userId: string
  user: { id: string; name: string | null; image: string | null }
  images?: any
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
  onSubmit: (content: string, images?: string[]) => Promise<void>
  onCancel: () => void
  lang: string
  userImage?: string | null
  userName?: string | null
}) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setSelectedImages(prev => [...prev, ...files].slice(0, 2))
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!text.trim() && selectedImages.length === 0) || submitting) return
    setSubmitting(true)

    try {
      const uploadedUrls: string[] = []
      if (selectedImages.length > 0) {
        setIsUploading(true)
        for (const file of selectedImages) {
          const fileExt = file.name.split('.').pop()
          const fileName = `${Math.random()}.${fileExt}`
          const filePath = `comment-images/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file)

          if (uploadError) throw uploadError

          const { data } = supabase.storage
            .from('images')
            .getPublicUrl(filePath)
          
          uploadedUrls.push(data.publicUrl)
        }
      }

      await onSubmit(text, uploadedUrls)
      setText('')
      setSelectedImages([])
    } catch (err) {
      console.error(err)
      alert("Error al subir imágenes")
    } finally {
      setSubmitting(false)
      setIsUploading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginTop: '0.8rem' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
        <Avatar src={userImage} name={userName} size={32} />
        <div style={{ flex: 1, background: '#f8f9fa', borderRadius: '16px', border: '1px solid #e5e7eb', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.5rem 0.8rem', transition: 'all 0.2s' }} className="reply-input-wrapper">
          <textarea
            autoFocus
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={lang === 'es' ? 'Escribe tu respuesta...' : lang === 'pt' ? 'Escreva sua respuesta...' : 'Write your reply...'}
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '0.95rem', resize: 'none', minHeight: '40px', fontFamily: 'inherit', lineHeight: 1.5, width: '100%' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end', marginLeft: 'auto' }}>
            <label style={{ cursor: selectedImages.length >= 2 ? 'not-allowed' : 'pointer', color: selectedImages.length >= 2 ? '#eee' : '#999', display: 'flex', padding: '0.3rem' }}>
              <ImageIcon size={18} />
              <input type="file" hidden multiple accept="image/*" onChange={handleImageChange} disabled={selectedImages.length >= 2 || submitting} />
            </label>
            <button type="submit" disabled={submitting || isUploading || (!text.trim() && selectedImages.length === 0)} style={{ background: (text.trim() || selectedImages.length > 0) ? '#000' : '#e5e7eb', color: '#fff', width: '34px', height: '34px', borderRadius: '10px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
              {submitting || isUploading ? <Loader2 size={14} className="spin" /> : <Send size={14} />}
            </button>
          </div>
        </div>
      </form>
      
      {selectedImages.length > 0 && (
        <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.6rem', marginLeft: '3rem' }}>
          {selectedImages.map((file, i) => (
            <div key={i} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
              <img src={URL.createObjectURL(file)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button onClick={() => removeImage(i)} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={8} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CommentCard({ comment, depth, lang, session, postSlug, onRefresh, onImageClick }: {
  comment: Comment | Reply
  depth: number
  lang: string
  session: any
  postSlug: string
  onRefresh: () => void
  onImageClick: (src: string) => void
}) {
  const [showReplyForm, setShowReplyForm] = useState(false)

  const handleReply = async (content: string, images?: string[]) => {
    const res = await addComment(postSlug, content, comment.id, images)
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
              {new Date(comment.createdAt).toLocaleDateString((translations[lang as keyof typeof translations] as any).comments.dateLocale, { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
          {session?.user?.id === comment.userId && (
            <button onClick={handleDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4d4d', opacity: 0.35, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', padding: 0 }} className="delete-comment-btn">
              <Trash2 size={13} />
            </button>
          )}
        </div>

        {/* Bubble */}
        <div style={{ 
          background: isNested ? '#f8f9fa' : '#fcfcfc', 
          padding: isNested ? '0.7rem 1rem' : '1rem 1.2rem', 
          borderRadius: '0 16px 16px 16px', 
          border: '1px solid #f0f0f0', 
          lineHeight: '1.6', 
          color: '#333', 
          fontSize: isNested ? '0.95rem' : '1.05rem' 
        }}>
          <div>{comment.content}</div>
          
          {comment.images && Array.isArray(comment.images) && comment.images.length > 0 && (
            <div className="comment-images-grid" style={{ 
              marginTop: '0.8rem', 
              display: 'grid', 
              gridTemplateColumns: comment.images.length === 1 ? '1fr' : '1fr 1fr',
              gap: '0.5rem'
            }}>
              {comment.images.map((img: string, i: number) => (
                <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', cursor: 'zoom-in', border: '1px solid #eee', aspectRatio: '16/9' }} onClick={() => onImageClick(img)}>
                  <img src={img} alt="Comment attachment" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
                </div>
              ))}
            </div>
          )}
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
              <CommentCard key={reply.id} comment={reply} depth={depth + 1} lang={lang} session={session} postSlug={postSlug} onRefresh={onRefresh} onImageClick={onImageClick} />
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
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedImageForLightbox, setSelectedImageForLightbox] = useState<string | null>(null)

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setSelectedImages(prev => [...prev, ...files].slice(0, 2))
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!newComment.trim() && selectedImages.length === 0) || !session?.user || isSubmitting) return
    setIsSubmitting(true)

    try {
      const uploadedUrls: string[] = []
      if (selectedImages.length > 0) {
        setIsUploading(true)
        for (const file of selectedImages) {
          const fileExt = file.name.split('.').pop()
          const fileName = `${Math.random()}.${fileExt}`
          const filePath = `comment-images/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file)

          if (uploadError) throw uploadError

          const { data } = supabase.storage
            .from('images')
            .getPublicUrl(filePath)
          
          uploadedUrls.push(data.publicUrl)
        }
      }

      const res = await addComment(postSlug, newComment, undefined, uploadedUrls)
      if (res.success) {
        setNewComment("")
        setSelectedImages([])
        await fetchComments()
      }
    } catch (err) {
      console.error("Upload error:", err)
      alert(lang === 'es' ? "Error al subir las imágenes" : "Error uploading images")
    } finally {
      setIsSubmitting(false)
      setIsUploading(false)
    }
  }

  return (
    <section className="comments-container">
      {/* Header */}
      <div className="comments-header">
        <MessageSquare size={28} className="header-icon" />
        <h2 className="header-title">
          {(translations[lang as keyof typeof translations] as any).comments.title} <span className="total-count">({totalCount})</span>
        </h2>
      </div>

      {/* New comment form */}
      {session ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: '3.5rem' }}>
          <div className="input-wrapper-outer">
            <div className="input-wrapper">
              <div className="avatar-wrapper">
                <Avatar src={session.user.image} name={session.user.name} size={40} />
                <span className="user-name-mobile">{getFirstName(session.user.name ?? null)}</span>
              </div>
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder={lang === 'es' ? "Escribe lo que piensas..." : lang === 'pt' ? "Escreva o que pensa..." : "Write what you think..."}
                className="comment-textarea"
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.3rem' }}>
                <label style={{ 
                  cursor: selectedImages.length >= 2 ? 'not-allowed' : 'pointer', 
                  color: selectedImages.length >= 2 ? '#eee' : '#999',
                  transition: 'all 0.2s',
                  display: 'flex',
                  padding: '0.5rem'
                }} title={selectedImages.length >= 2 ? 'Máximo 2 imágenes' : 'Adjuntar imágenes'}>
                  <ImageIcon size={22} />
                  <input type="file" hidden multiple accept="image/*" onChange={handleImageChange} disabled={selectedImages.length >= 2 || isSubmitting} />
                </label>
                
                <button disabled={isSubmitting || isUploading || (!newComment.trim() && selectedImages.length === 0)} type="submit" className="submit-comment-btn">
                  {isSubmitting || isUploading ? (
                    <Loader2 size={20} className="spin" />
                  ) : (
                    <>
                      <span className="btn-text-mobile">{lang === 'es' ? 'Postear comentario' : lang === 'pt' ? 'Postar comentário' : 'Post comment'}</span>
                      <Send className="btn-icon" size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {selectedImages.length > 0 && (
              <div className="comment-previews" style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem', paddingLeft: '4rem' }}>
                {selectedImages.map((file, i) => (
                  <div key={i} style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '16px', overflow: 'hidden', border: '2px solid #f0f0f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <img src={URL.createObjectURL(file)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />
                    <button 
                      type="button" 
                      onClick={() => removeImage(i)} 
                      style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,0,0,0.8)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.6)')}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
            <CommentCard key={comment.id} comment={comment} depth={0} lang={lang} session={session} postSlug={postSlug} onRefresh={fetchComments} onImageClick={setSelectedImageForLightbox} />
          ))
        )}
      </div>

      {/* Lightbox */}
      {selectedImageForLightbox && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backdropFilter: 'blur(8px)' }} onClick={() => setSelectedImageForLightbox(null)}>
          <button style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setSelectedImageForLightbox(null)} className="lightbox-close-btn">
            <X size={24} />
          </button>
          <img src={selectedImageForLightbox} alt="Expanded view" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '12px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', objectFit: 'contain' }} onClick={e => e.stopPropagation()} />
        </div>
      )}

      <style jsx>{`
        .comments-container {
          margin-top: 4rem;
          padding: 3rem;
          background: #ffffff;
          border-radius: 32px;
          border: 1px solid #f0f0f0;
          box-shadow: 0 20px 50px rgba(0,0,0,0.04);
        }

        .comments-header {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          margin-bottom: 2.5rem;
        }

        .header-title {
          margin: 0;
          font-size: 1.8rem;
          font-weight: 900;
          letter-spacing: -0.02em;
        }

        .total-count {
          color: #999;
          font-size: 1.2rem;
          font-weight: 500;
          marginLeft: 0.4rem;
        }

        .input-wrapper {
          display: flex;
          gap: 1rem;
          background: #f8f9fa;
          padding: 0.8rem;
          border-radius: 24px;
          border: 2px solid transparent;
          transition: all 0.3s;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }

        .avatar-wrapper {
          padding: 0.5rem;
          display: flex;
          align-items: center;
        }

        .user-name-mobile {
          display: none;
        }

        .btn-text-mobile {
          display: none;
        }

        .comment-textarea {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          padding: 0.8rem 0;
          fontSize: 1.05rem;
          minHeight: 60px;
          resize: none;
          font-family: inherit;
        }

        .submit-comment-btn {
          width: 45px;
          height: 45px;
          border-radius: 15px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          align-self: flex-end;
          margin: 0.3rem;
          background: #eee;
          color: #fff;
        }

        .submit-comment-btn:not(:disabled) {
          background: #000;
        }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .input-wrapper:focus-within { 
          border-color: #000 !important; 
          background: #fff !important; 
          box-shadow: 0 10px 30px rgba(0,0,0,0.04);
        }
        
        .reply-input-wrapper:focus-within { border-color: #000 !important; background: #fff !important; }
        .delete-comment-btn:hover { opacity: 1 !important; }

        @media (max-width: 768px) {
          .comments-container {
            padding: 1.5rem;
            margin-top: 2rem;
            border-radius: 24px;
          }
          .comments-header {
            margin-bottom: 1.5rem;
          }
          .header-title {
            font-size: 1.4rem;
          }
          .header-icon {
            width: 20px;
            height: 20px;
          }
          .input-wrapper {
            padding: 1rem;
            gap: 0;
            border-radius: 20px;
            flex-direction: column;
            align-items: flex-start;
          }
          .avatar-wrapper {
            padding: 0;
            gap: 0.8rem;
            margin-bottom: 0.5rem;
          }
          .user-name-mobile {
            display: block;
            font-weight: 800;
            font-size: 1rem;
            color: #1e293b;
          }
          :global(.input-wrapper img), :global(.input-wrapper .avatar-fallback) {
            width: 32px !important;
            height: 32px !important;
          }
          .comment-textarea {
            font-size: 0.95rem;
            min-height: 80px;
            padding: 0.5rem 0;
            width: 100%;
          }
          .submit-comment-btn {
            width: 100%;
            height: 48px;
            border-radius: 12px;
            margin: 0.5rem 0 0.5rem 0;
            align-self: center;
            gap: 0.6rem;
          }
          .btn-text-mobile {
            display: block;
            font-weight: 800;
            font-size: 0.9rem;
          }
          :global(.comment-images-grid) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}
