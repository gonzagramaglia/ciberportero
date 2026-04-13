"use client"

import { useState } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { deleteComment } from "@/lib/actions"
import { useRouter } from "next/navigation"

export default function DeleteCommentButton({ commentId }: { commentId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm("¿Seguro que quieres eliminar este comentario?")) return
    
    setIsDeleting(true)
    const res = await deleteComment(commentId)
    if (res.success) {
      router.refresh()
    } else {
      alert("Error al eliminar comentario")
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      style={{
        background: 'white',
        color: '#94a3b8',
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isDeleting ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        flexShrink: 0
      }}
      className="delete-btn-hover"
      title="Eliminar comentario"
    >
      {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
    </button>
  )
}
