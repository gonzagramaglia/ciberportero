'use client';

import { Trash2 } from "lucide-react";
import { deleteLink, deleteNotification, deletePost } from "@/lib/actions";

interface Props {
  id: string;
  type: 'link' | 'notification' | 'post';
}

export function DeleteButton({ id, type }: Props) {
  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
      if (type === 'link') await deleteLink(id);
      if (type === 'notification') await deleteNotification(id);
      if (type === 'post') await deletePost(id);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.5rem' }}
      title="Eliminar"
    >
      <Trash2 size={18} />
    </button>
  );
}
