'use client';

import { useLanguage } from '@/context/LanguageContext';
import { guestStore } from '@/lib/guestStore';
import React, { useEffect, useState } from 'react';
import { Pencil, Check, X, Trash2, Key, History as HistoryIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { translations } from '@/lib/translations';

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
                    router.push(`/salas/${updated.id}`);
                }
            }
        } else {
            toast.error('Not implemented for DB rooms yet');
        }
    };

    const handleDelete = () => {
        if (!confirm(lang === 'es' ? '¿Estás seguro de eliminar esta sala?' : 'Are you sure you want to delete this room?')) return;
        if (isGuest) {
            guestStore.deleteRoom(roomId);
            router.push('/salas/lista');
            toast.success(lang === 'es' ? 'Sala eliminada' : 'Room deleted');
        }
    };

    const roomsT = translations[lang as keyof typeof translations]?.rooms || translations.es.rooms;

    return (
        <header style={{ marginBottom: '2rem', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', padding: '1.5rem', background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>{roomsT.edit.nameLabel}</label>
                            <input 
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                placeholder={roomsT.sidebar.placeholderName}
                                style={{ fontSize: '1.5rem', fontWeight: '900', border: 'none', borderBottom: '2px solid var(--accent)', outline: 'none', width: '100%' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Slug (URL)</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <span style={{ color: '#94a3b8', fontSize: '1rem' }}>/salas/</span>
                                <input 
                                    value={editSlug}
                                    onChange={e => setEditSlug(e.target.value)}
                                    style={{ border: 'none', borderBottom: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem', color: '#64748b', flex: 1 }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
                            <button onClick={handleUpdate} className="edit-btn confirm"><Check size={20} /> {roomsT.edit.save}</button>
                            <button onClick={handleDelete} className="edit-btn delete" style={{ marginLeft: 'auto' }}><Trash2 size={18} /></button>
                        </div>
                    </div>
                ) : (
                    <>
                        <h1 className="room-title">
                            <span className="room-label-tag">{roomsT.label}</span>
                            <span>{room.name}</span>
                        </h1>
                        {isCreator && (
                            <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', transition: 'color 0.2s', padding: '0.5rem' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}>
                                <Pencil size={20} />
                            </button>
                        )}
                    </>
                )}
            </div>
            {!isEditing && (
                <div className="header-actions-row">
                    <div className="room-code-badge">
                        <Key size={14} />
                        <span>{room.secretCode}</span>
                    </div>

                    <a 
                        href="#history" 
                        className="mobile-history-btn"
                        onClick={() => window.dispatchEvent(new CustomEvent('subcategory-change', { detail: 'history' }))}
                    >
                        <HistoryIcon size={16} />
                        <span>Historial</span>
                    </a>
                </div>
            )}

            <style jsx>{`
                .room-title { font-size: 2.5rem; fontWeight: 900; margin: 0; display: flex; align-items: center; gap: 0.6rem; }
                .room-label-tag { font-size: 1rem; color: var(--accent); fontWeight: 800; text-transform: uppercase; letter-spacing: 0.05em; background: rgba(0, 112, 243, 0.05); padding: 0.2rem 0.6rem; border-radius: 8px; }
                
                .header-actions-row { display: flex; align-items: center; gap: 0.6rem; marginTop: 0.75rem; flexWrap: wrap; }
                .room-code-badge { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 800; color: var(--accent); background: rgba(0, 112, 243, 0.05); padding: 0.5rem 1rem; border-radius: 12px; border: 1px solid rgba(0, 112, 243, 0.1); }

                .edit-btn { padding: 0 1.2rem; height: 48px; border-radius: 16px; border: none; display: flex; align-items: center; gap: 0.6rem; cursor: pointer; transition: all 0.2s; font-weight: 700; font-size: 0.95rem; }
                .edit-btn.confirm { background: #10b981; color: #fff; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }
                .edit-btn.delete { background: #fff1f2; color: #ef4444; width: 48px; padding: 0; display: flex; align-items: center; justify-content: center; border: 1px solid #fecaca; }
                .edit-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(0,0,0,0.1); }

                .mobile-history-btn {
                    display: none;
                    align-items: center;
                    gap: 0.6rem;
                    background: var(--accent-light);
                    color: var(--accent);
                    padding: 0.5rem 1.2rem;
                    border-radius: 12px;
                    border: 1px solid rgba(0, 112, 243, 0.1);
                    font-size: 0.85rem;
                    font-weight: 800;
                    text-decoration: none;
                    transition: all 0.2s;
                }
                
                @media (max-width: 1024px) {
                    .room-title { font-size: 1.75rem; flex-wrap: wrap; }
                    .room-label-tag { font-size: 0.8rem; }
                    .mobile-history-btn {
                        display: inline-flex;
                    }
                    .header-actions-row {
                        margin-top: 1.25rem;
                        flex-wrap: nowrap;
                    }
                }
            `}</style>
        </header>
    );
}
