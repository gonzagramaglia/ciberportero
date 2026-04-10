'use client';

import { Trash2 } from "lucide-react";
import { deleteLink, deleteNotification, deletePost, deleteCalendarEvent } from "@/lib/actions";

interface Props {
  id: string;
  type: 'link' | 'notification' | 'post' | 'event';
}

export function DeleteButton({ id, type }: Props) {
  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
      if (type === 'link') await deleteLink(id);
      if (type === 'notification') await deleteNotification(id);
      if (type === 'post') await deletePost(id);
      if (type === 'event') await deleteCalendarEvent(id);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      style={{ 
        width: '36px', height: '36px', borderRadius: '50%', background: 'white', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#94a3b8', border: '1px solid #e2e8f0', cursor: 'pointer',
        transition: 'all 0.2s'
      }}
      className="delete-btn-hover"
      title="Eliminar"
    >
      <Trash2 size={16} />
    </button>
  );
}
