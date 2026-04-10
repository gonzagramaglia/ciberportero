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
        background: '#fff5f5',
        color: '#ff4d4d',
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        border: '1px solid #ffebeb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isDeleting ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        flexShrink: 0
      }}
      title="Eliminar comentario"
    >
      {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
    </button>
  )
}
