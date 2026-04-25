"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { MessageSquare, Send, Trash2, User as UserIcon, Loader2, Calendar, CornerDownRight, Image as ImageIcon, X, Plus } from "lucide-react"
import { addComment, getComments, deleteComment } from "@/lib/actions"
import { supabase } from "@/lib/supabase"
import { SignInButton } from "@/components/AuthButtons"
import { translations } from "@/lib/translations"
import { getFirstName } from "@/lib/utils"

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
    <div className="input-wrapper-outer" style={{ width: '100%', marginTop: '1rem', transform: 'scale(0.98)', transformOrigin: 'top left' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem' }}>
        <div className="avatar-wrapper">
          <Avatar src={userImage} name={userName} size={32} />
        </div>
        <div className="input-wrapper">
          <textarea
            autoFocus
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={lang === 'es' ? 'Escribe tu respuesta...' : lang === 'pt' ? 'Escreva sua respuesta...' : 'Write your reply...'}
            className="comment-textarea"
            style={{ minHeight: '100px' }}
          />
          <div className="input-toolbar">
            <label className="image-upload-label" title={selectedImages.length >= 2 ? 'Máximo 2 imágenes' : 'Adjuntar imágenes'}>
              <ImageIcon size={20} />
              <input type="file" hidden multiple accept="image/*" onChange={handleImageChange} disabled={selectedImages.length >= 2 || submitting} />
            </label>
            
            <div className="button-group">
              <button 
                type="button" 
                onClick={onCancel}
                className="cancel-btn"
              >
                {lang === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button 
                disabled={submitting || isUploading || (!text.trim() && selectedImages.length === 0)} 
                type="submit" 
                className={`submit-comment-btn ${(text.trim() || selectedImages.length > 0) ? 'ready' : ''}`}
              >
                {submitting || isUploading ? (
                  <Loader2 size={18} className="spin" />
                ) : (
                  <>
                    <span className="btn-text">{lang === 'es' ? 'Responder' : 'Reply'}</span>
                    <Send size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
      
      {selectedImages.length > 0 && (
        <div className="comment-previews" style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem', paddingLeft: '2.5rem' }}>
          {selectedImages.map((file, i) => (
            <div key={i} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #f0f0f0' }}>
              <img src={URL.createObjectURL(file)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />
              <button 
                type="button"
                onClick={() => removeImage(i)} 
                style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CommentCard({ comment, depth, lang, session, postSlug, podcastSlug, onRefresh, onImageClick }: {
  comment: Comment | Reply
  depth: number
  lang: string
  session: any
  postSlug?: string
  podcastSlug?: string
  onRefresh: () => void
  onImageClick: (src: string) => void
}) {
  const [showReplyForm, setShowReplyForm] = useState(false)

  const handleReply = async (content: string, images?: string[]) => {
    const slug = postSlug || podcastSlug!
    const res = await addComment(slug, content, comment.id, images, !!podcastSlug)
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
    <div id={`comment-${comment.id}`} className="comment-card" style={{ display: 'flex', gap: '0.9rem', position: 'relative', transition: 'all 0.5s ease' }}>
      <Avatar src={comment.user.image} name={comment.user.name} size={isNested ? 34 : 44} />
      <div style={{ flex: 1 }}>
        <div className="comment-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.6rem', marginBottom: '0.3rem' }}>
          <div className="comment-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontWeight: '800', fontSize: isNested ? '0.9rem' : '1rem', color: '#000' }}>
              {getFirstName(comment.user.name)}
            </span>
            <div className="comment-date-container" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#bbb' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: '600' }}>
                {(() => {
                  const date = new Date(comment.createdAt);
                  const dayName = date.toLocaleDateString(lang, { weekday: 'long' }).toLowerCase();
                  const dayNumber = date.getDate();
                  const monthNameRaw = date.toLocaleDateString(lang, { month: 'long' });
                  const monthName = monthNameRaw.charAt(0).toUpperCase() + monthNameRaw.slice(1);
                  const time = date.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
                  
                  if (lang === 'es') return `El ${dayName} ${dayNumber} de ${monthName} a las ${time}`;
                  if (lang === 'pt') return `No ${dayName}, ${dayNumber} de ${monthName} às ${time}`;
                  return `On ${dayName}, ${monthName} ${dayNumber} at ${time}`;
                })()}
              </span>
            </div>
          </div>
          {session?.user?.id === comment.userId && (
            <button onClick={handleDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4d4d', opacity: 0.35, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', padding: 0, marginTop: '0.2rem' }} className="delete-comment-btn">
              <Trash2 size={13} />
            </button>
          )}
        </div>

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
          
          {comment.images && (comment.images as string[]).length > 0 && (
            <div className="comment-images-grid">
              {(comment.images as string[]).map((img, i) => (
                <img 
                  key={i} 
                  src={img} 
                  alt="Comment attachment" 
                  className="comment-attachment"
                  onClick={() => onImageClick(img)}
                />
              ))}
            </div>
          )}
        </div>

        {canReply && (
          <div style={{ marginTop: '0.4rem' }}>
            <button onClick={() => setShowReplyForm(!showReplyForm)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', color: showReplyForm ? '#000' : '#999', display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'color 0.2s' }}>
              <CornerDownRight size={12} />
              {lang === 'es' ? 'Responder' : lang === 'pt' ? 'Responder' : 'Reply'}
            </button>
          </div>
        )}

        {showReplyForm && (
          <ReplyForm onSubmit={handleReply} onCancel={() => setShowReplyForm(false)} lang={lang} userImage={session?.user?.image} userName={session?.user?.name} />
        )}

        {'replies' in comment && comment.replies && comment.replies.length > 0 && (
          <div style={{ marginTop: '1rem', paddingLeft: '0.5rem', borderLeft: '2px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {comment.replies.map((reply: Reply) => (
              <CommentCard key={reply.id} comment={reply} depth={depth + 1} lang={lang} session={session} postSlug={postSlug} podcastSlug={podcastSlug} onRefresh={onRefresh} onImageClick={onImageClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function CommentSection({ postSlug, podcastSlug, lang = 'es' }: { postSlug?: string; podcastSlug?: string; lang?: string }) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedImageForLightbox, setSelectedImageForLightbox] = useState<string | null>(null)

  const fetchComments = async () => {
    const data = await getComments(postSlug, podcastSlug)
    setComments(data as any)
    setIsLoading(false)
  }

  useEffect(() => { fetchComments() }, [postSlug, podcastSlug])

  const totalCount = comments.reduce((acc, c) => {
    const replyCount = (c.replies || []).reduce((a: number, r: Reply) => a + 1 + (r.replies?.length || 0), 0)
    return acc + 1 + replyCount
  }, 0)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setSelectedImages(prev => [...prev, ...files].slice(0, 2))
      setPreviewUrls(prev => [...prev, ...files.map(f => URL.createObjectURL(f))].slice(0, 2))
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
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

      const slug = postSlug || podcastSlug!
      const result = await addComment(slug, newComment, undefined, uploadedUrls, !!podcastSlug)
      
      if (result.success) {
        setNewComment('');
        setSelectedImages([]);
        setPreviewUrls([]);
        fetchComments();
        
        setTimeout(() => {
          const commentsContainer = document.querySelector('.comments-list');
          if (commentsContainer) {
            commentsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 500);
      } else if (result.error) {
        alert(result.error)
      }
    } catch (err) {
      console.error("Comment submission error:", err)
      alert(lang === 'es' ? "Error al publicar. Probá de nuevo." : "Error posting. Try again.")
    } finally {
      setIsSubmitting(false)
      setIsUploading(false)
    }
  }

  return (
    <section id="comments" className="comments-container">
      <div className="comments-header">
        <MessageSquare size={28} className="header-icon" />
        <h2 className="header-title">
          {(translations[lang as keyof typeof translations] as any).comments.title} <span className="total-count">({totalCount})</span>
        </h2>
      </div>

      {session ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: '3.5rem' }}>
          <div className="input-wrapper-outer">
            <div className="input-wrapper">
              <div className="avatar-wrapper" style={{ marginBottom: '0.5rem' }}>
                <Avatar src={session.user.image} name={session.user.name} size={40} />
                <span className="user-name-mobile">{getFirstName(session.user.name ?? null)}</span>
              </div>
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder={lang === 'es' ? "Escribe lo que piensas..." : lang === 'pt' ? "Escreva o que pensa..." : "Write what you think..."}
                className="comment-textarea"
              />
              <div className="input-toolbar">
                <label className="image-upload-label" title={selectedImages.length >= 2 ? 'Máximo 2 imágenes' : 'Adjuntar imágenes'}>
                  <ImageIcon size={22} />
                  <input type="file" hidden multiple accept="image/*" onChange={handleImageChange} disabled={selectedImages.length >= 2 || isSubmitting} />
                </label>
                
                <button 
                  disabled={isSubmitting || isUploading || (!newComment.trim() && selectedImages.length === 0)} 
                  type="submit" 
                  className={`submit-comment-btn ${(newComment.trim() || selectedImages.length > 0) ? 'ready' : ''}`}
                  style={{ marginLeft: 'auto' }}
                >
                  {isSubmitting || isUploading ? (
                    <Loader2 size={20} className="spin" />
                  ) : (
                    <>
                      <span className="btn-text-mobile">{(translations[lang as keyof typeof translations] as any).comments.submit}</span>
                      <Send className="btn-icon" size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {selectedImages.length > 0 && (
              <div className="comment-previews" style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem', paddingLeft: '3.1rem' }}>
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
            <CommentCard key={comment.id} comment={comment} depth={0} lang={lang} session={session} postSlug={postSlug} podcastSlug={podcastSlug} onRefresh={fetchComments} onImageClick={setSelectedImageForLightbox} />
          ))
        )}
      </div>

      {selectedImageForLightbox && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backdropFilter: 'blur(8px)' }} onClick={() => setSelectedImageForLightbox(null)}>
          <button style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setSelectedImageForLightbox(null)} className="lightbox-close-btn">
            <X size={24} />
          </button>
          <img src={selectedImageForLightbox} alt="Expanded view" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '12px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', objectFit: 'contain' }} onClick={e => e.stopPropagation()} />
        </div>
      )}

      <style jsx global>{`
        .input-wrapper-outer {
          margin-bottom: 2rem;
          width: 100%;
        }

        .input-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #fcfcfc;
          border-radius: 20px;
          border: 1px solid #f0f0f0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          transition: all 0.3s ease;
          padding: 1rem;
          position: relative;
        }

        .input-wrapper:focus-within {
          border-color: #000;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
          background: #fff;
        }

        .comment-textarea {
          width: 100%;
          border: none;
          background: transparent;
          outline: none;
          font-family: inherit;
          font-size: 1.05rem;
          line-height: 1.6;
          color: #333;
          resize: none;
          min-height: 120px;
          padding: 0.5rem;
        }

        .input-toolbar {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding-top: 0.8rem;
          border-top: 1px solid rgba(0,0,0,0.04);
          margin-top: 0.5rem;
        }

        .image-upload-label {
          cursor: pointer;
          color: #94a3b8;
          display: flex;
          padding: 0.6rem;
          background: #fff;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
          transition: all 0.2s;
        }

        .image-upload-label:hover {
          color: #000;
          background: #f8f8f8;
          border-color: #ddd;
        }

        .button-group {
          margin-left: auto;
          display: flex;
          gap: 0.8rem;
          align-items: center;
        }

        .cancel-btn {
          background: none;
          border: none;
          color: #64748b;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          padding: 0.6rem 1.2rem;
          border-radius: 12px;
          transition: all 0.2s;
          opacity: 0.8;
        }

        .cancel-btn:hover {
          background: #facc15;
          color: #000;
          box-shadow: 0 5px 15px rgba(250, 204, 21, 0.3);
          opacity: 1;
        }

        .submit-comment-btn {
          background: #eef2f7;
          color: #64748b;
          border: 1px solid transparent;
          border-radius: 100px;
          padding: 0.7rem 1.8rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.8rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          opacity: 0.8;
        }

        .submit-comment-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
          background: #e2e8f0;
          color: #1e293b;
          opacity: 1;
        }

        .submit-comment-btn.ready {
          background: #000;
          color: #fff;
          opacity: 1;
        }

        .submit-comment-btn.ready:hover {
          background: #333;
          box-shadow: 0 8px 25px rgba(0,0,0,0.2);
          transition: all 0.3s;
        }

        .submit-comment-btn:disabled {
          background: #e2e8f0;
          color: #94a3b8;
          cursor: not-allowed;
        }

        .comment-images-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.2rem;
          margin-top: 1.2rem;
        }

        @media (min-width: 768px) {
          .comment-images-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .comment-attachment {
          width: 100%;
          height: auto;
          max-height: 450px;
          object-fit: contain;
          background: #fdfdfd;
          border: 1px solid #f0f0f0;
          border-radius: 16px;
          transition: transform 0.2s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }

        .comment-card:target {
          animation: highlight-comment 2s ease-out;
          background: rgba(255, 234, 0, 0.1);
          border-radius: 20px;
          padding: 0.5rem;
          margin: -0.5rem;
        }

        @keyframes highlight-comment {
          0% { background-color: rgba(255, 234, 0, 0.5); transform: scale(1.02); }
          100% { background-color: transparent; transform: scale(1); }
        }
      `}</style>

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

        .avatar-wrapper {
          padding: 0.6rem;
          display: flex;
          align-items: center;
          gap: 0.9rem;
        }

        .user-name-mobile {
          font-weight: 800;
          font-size: 1rem;
          color: #1e293b;
        }

        .btn-text-mobile {
          font-weight: 800;
          font-size: 0.95rem;
        }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
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
          .avatar-wrapper {
            padding: 0;
            gap: 0.8rem;
            margin-bottom: 0.5rem;
          }
           .user-name-mobile {
             font-size: 0.95rem;
           }
          .submit-comment-btn {
            flex: initial;
            height: auto;
            min-height: 48px;
            border-radius: 14px;
            margin: 0;
            gap: 0.8rem;
            padding: 0.7rem 1.5rem;
          }
          .btn-text-mobile {
            font-size: 0.9rem;
          }
          .comment-meta {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 0 !important;
          }
          .comment-date-container {
            margin-top: -0.1rem;
          }
          :global(.comment-images-grid) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}
