'use client';

import { deleteComment } from "@/lib/actions";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export default function DeleteCommentButton({ commentId }: { commentId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('¿Seguro quieres eliminar este comentario?')) return;
    setIsDeleting(true);
    await deleteComment(commentId);
    // The page will revalidate automatically
    setIsDeleting(false);
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      style={{ 
        background: '#fff5f5', 
        color: '#ff4d4d', 
        border: '1px solid #ffebeb', 
        padding: '0.8rem', 
        borderRadius: '12px', 
        cursor: 'pointer',
        transition: 'all 0.2s',
        opacity: isDeleting ? 0.5 : 1
      }}
      onMouseOver={(e) => {
        (e.currentTarget as any).style.background = '#ffebeb';
      }}
      onMouseOut={(e) => {
        (e.currentTarget as any).style.background = '#fff5f5';
      }}
    >
      <Trash2 size={20} />
    </button>
  );
}
