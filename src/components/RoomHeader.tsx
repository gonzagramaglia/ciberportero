'use client';

import { useLanguage } from '@/context/LanguageContext';
import { guestStore } from '@/lib/guestStore';
import React, { useEffect, useState } from 'react';
import { Pencil, Check, X, Trash2, Key } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { slugify } from '@/lib/utils';

interface RoomHeaderProps {
    roomId: string;
    initialRoom: { name: string, secretCode: string, creatorId: string };
    session: any;
}

export default function RoomHeader({ roomId, initialRoom, session }: RoomHeaderProps) {
    const { lang } = useLanguage();
    const router = useRouter();
    const [room, setRoom] = useState(initialRoom);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(room.name);
    const [editSlug, setEditSlug] = useState(roomId);
    const isGuest = roomId === 'test-room' || !session || initialRoom.creatorId === 'guest';
    const isCreator = initialRoom.creatorId === 'guest' || initialRoom.creatorId === session?.user?.id;

    useEffect(() => {
        if (isGuest && roomId !== 'test-room') {
            const gRoom = guestStore.getRoom(roomId);
            if (gRoom) {
                setRoom({ name: gRoom.name, secretCode: gRoom.secretCode, creatorId: 'guest' });
                setEditName(gRoom.name);
                setEditSlug(gRoom.id);
            }
        }
    }, [isGuest, roomId]);

    const handleUpdate = () => {
        if (!editName) return;
        if (isGuest) {
            const updated = guestStore.updateRoom(roomId, editName, editSlug);
            if (updated) {
                setRoom({ ...room, name: updated.name });
                setIsEditing(false);
                toast.success(lang === 'es' ? '¡Sala actualizada!' : 'Room updated!');
                if (updated.id !== roomId) {
                    router.push(`/rooms/${updated.id}`);
                }
            }
        } else {
            // Server action would go here
            toast.error('Not implemented for DB rooms yet');
        }
    };

    const handleDelete = () => {
        if (!confirm(lang === 'es' ? '¿Estás seguro de eliminar esta sala?' : 'Are you sure you want to delete this room?')) return;
        if (isGuest) {
            guestStore.deleteRoom(roomId);
            router.push('/rooms/lobby');
            toast.success(lang === 'es' ? 'Sala eliminada' : 'Room deleted');
        }
    };

    const codeLabel = lang === 'es' ? 'Código de acceso: ' : lang === 'pt' ? 'Código de acesso: ' : 'Access code: ';

    return (
        <header style={{ marginBottom: '2rem', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', padding: '1rem', background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>{lang === 'es' ? 'Nombre de la sala' : 'Room Name'}</label>
                            <input 
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                style={{ fontSize: '2rem', fontWeight: '900', border: 'none', borderBottom: '2px solid var(--accent)', outline: 'none', width: '100%' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Slug (URL)</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <span style={{ color: '#94a3b8', fontSize: '1rem' }}>/rooms/</span>
                                <input 
                                    value={editSlug}
                                    onChange={e => setEditSlug(e.target.value)}
                                    style={{ border: 'none', borderBottom: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem', color: '#64748b', flex: 1 }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
                            <button onClick={handleUpdate} className="edit-btn confirm"><Check size={20} /> {lang === 'es' ? 'Guardar' : 'Save'}</button>
                            <button onClick={handleDelete} className="edit-btn delete" style={{ marginLeft: 'auto' }}><Trash2 size={18} /></button>
                        </div>
                    </div>
                ) : (
                    <>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: 0 }}>{room.name}</h1>
                        {isCreator && (
                            <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}>
                                <Pencil size={20} />
                            </button>
                        )}
                    </>
                )}
            </div>
            {!isEditing && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.75rem' }}>
                    <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        fontSize: '0.85rem', 
                        fontWeight: '800', 
                        color: 'var(--accent)', 
                        background: 'rgba(0, 112, 243, 0.05)', 
                        padding: '0.5rem 1rem', 
                        borderRadius: '12px',
                        border: '1px solid rgba(0, 112, 243, 0.1)'
                    }}>
                        <Key size={14} />
                        <span style={{ letterSpacing: '0.02em' }}>{room.secretCode}</span>
                    </div>
                </div>
            )}

            <style jsx>{`
                .edit-btn { padding: 0 1.2rem; height: 48px; border-radius: 16px; border: none; display: flex; align-items: center; gap: 0.6rem; cursor: pointer; transition: all 0.2s; font-weight: 700; font-size: 0.95rem; }
                .edit-btn.confirm { background: #10b981; color: #fff; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }
                .edit-btn.cancel { background: #f1f5f9; color: #64748b; }
                .edit-btn.delete { background: #fff1f2; color: #ef4444; width: 48px; padding: 0; display: flex; align-items: center; justify-content: center; border: 1px solid #fecaca; }
                .edit-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(0,0,0,0.1); }
                .edit-btn.delete:hover { background: #ef4444; color: #fff; border-color: #ef4444; }
                .edit-btn.confirm:hover { background: #059669; }
            `}</style>
        </header>
    );
}
