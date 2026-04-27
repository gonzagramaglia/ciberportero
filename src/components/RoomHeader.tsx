'use client';

import { useLanguage } from '@/context/LanguageContext';
import { guestStore, GuestMember } from '@/lib/guestStore';
import React, { useEffect, useState } from 'react';
import { Settings, Check, X, Trash2, Key, History as HistoryIcon, Link as LinkIcon, Shield, UserMinus, User, Users, AlignLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { translations } from '@/lib/translations';
import { updateRoom, deleteRoom, leaveRoom } from '@/lib/salasActions';

interface RoomHeaderProps {
    roomId: string;
    initialRoom: { 
        name: string, 
        description?: string, 
        secretCode: string, 
        creatorId: string, 
        creatorRole?: string,
        creatorEmail?: string,
        members: GuestMember[] 
    };
    session: any;
}

export default function RoomHeader({ roomId, initialRoom, session }: RoomHeaderProps) {
    const { lang } = useLanguage();
    const router = useRouter();
    const [room, setRoom] = useState(initialRoom);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [editName, setEditName] = useState(room.name);
    const [editSlug, setEditSlug] = useState(roomId);
    const [editCode, setEditCode] = useState(room.secretCode);
    const [editDesc, setEditDesc] = useState(room.description || '');
    
    const isGuest = roomId === 'test-room' || !session || initialRoom.creatorId === 'guest';
    const isReallyCreator = (initialRoom.creatorId === session?.user?.id && !!session?.user?.id) || (initialRoom.creatorId === 'guest' && isGuest && roomId === 'test-room');
    const userRole = room.members?.find((m: any) => m.userId === session?.user?.id || (isGuest && m.id === 'guest-me'))?.role;
    const isAdmin = userRole === 'admin';
    const canManageRoom = !!session?.user?.id && (isReallyCreator || isAdmin);

    useEffect(() => {
        if (isGuest && roomId !== 'test-room') {
            const gRoom = guestStore.getRoom(roomId);
            if (gRoom) {
                setRoom({ ...gRoom } as any);
                setEditName(gRoom.name);
                setEditSlug(gRoom.id);
                setEditCode(gRoom.secretCode);
                setEditDesc(gRoom.description || '');
            }
        }
    }, [isGuest, roomId, isModalOpen]);

    const getWordCount = (text: string) => {
        return text.trim() ? text.trim().split(/\s+/).length : 0;
    };

    const handleUpdate = async () => {
        if (!editName || !editCode || !editSlug) return;
        if (getWordCount(editDesc) > 150) {
            toast.error(lang === 'es' ? 'La descripción no puede superar las 150 palabras' : 'Description cannot exceed 150 words');
            return;
        }

        if (isGuest) {
            const updated = guestStore.updateRoom(roomId, editName, editSlug, editCode, editDesc);
            if (updated) {
                setRoom({ ...room, name: updated.name, secretCode: updated.secretCode, description: updated.description });
                setIsModalOpen(false);
                toast.success(lang === 'es' ? '¡Sala actualizada!' : 'Room updated!');
                if (updated.id !== roomId) {
                    router.push(`/salas/${updated.id}`);
                }
            }
        } else {
            const res = await updateRoom(roomId, editName, editSlug, editCode, editDesc);
            if (res.success) {
                setRoom({ ...room, name: editName, secretCode: editCode, description: editDesc });
                setIsModalOpen(false);
                toast.success(lang === 'es' ? '¡Sala actualizada!' : 'Room updated!');
                if (res.roomId !== roomId) {
                    router.push(`/salas/${res.roomId}`);
                }
            } else {
                toast.error(res.error || 'Error');
            }
        }
    };

    const handleDelete = async () => {
        if (!confirm(lang === 'es' ? '¿Estás seguro de eliminar esta sala?' : 'Are you sure you want to delete this room?')) return;
        if (isGuest) {
            guestStore.deleteRoom(roomId);
            router.push('/salas/lista');
            toast.success(lang === 'es' ? 'Sala eliminada' : 'Room deleted');
        } else {
            const res = await deleteRoom(roomId);
            if (res.success) {
                toast.success(lang === 'es' ? 'Sala eliminada' : 'Room deleted');
                router.push('/salas/lista');
            } else {
                toast.error(res.error || 'Error');
            }
        }
    };

    const handleLeaveRoom = async () => {
        if (!confirm(lang === 'es' ? '¿Estás seguro de salir de esta sala?' : 'Are you sure you want to leave this room?')) return;
        if (isGuest) {
            // Guests just go back to list as they aren't 'officially' in a DB room
            router.push('/salas/lista');
        } else {
            const res = await leaveRoom(roomId);
            if (res.success) {
                toast.success(lang === 'es' ? 'Has salido de la sala' : 'You left the room');
                router.push('/salas/lista');
            } else {
                toast.error(res.error || 'Error');
            }
        }
    };

    const handleToggleAdmin = (memberId: string) => {
        if (isGuest) {
            const updated = guestStore.toggleAdmin(roomId, memberId);
            if (updated) {
                const gRoom = guestStore.getRoom(roomId);
                if (gRoom) setRoom({ ...gRoom } as any);
                toast.success(lang === 'es' ? 'Rol actualizado' : 'Role updated');
            }
        }
    };

    const handleKick = (memberId: string) => {
        if (!confirm(lang === 'es' ? '¿Estás seguro de echar a este miembro?' : 'Are you sure you want to kick this member?')) return;
        if (isGuest) {
            if (guestStore.kickMember(roomId, memberId)) {
                const gRoom = guestStore.getRoom(roomId);
                if (gRoom) setRoom({ ...gRoom } as any);
                toast.success(lang === 'es' ? 'Miembro eliminado' : 'Member removed');
            }
        }
    };

    const roomsT = translations[lang as keyof typeof translations]?.rooms || translations.es.rooms;

    return (
        <header className="room-header">
            <div className="title-row">
                <h1 className="room-title">
                    <span>{room.name}</span>
                    {isGuest && <span className="demo-badge">{roomId === 'test-room' ? 'MODO DEMO' : 'SALA TEMPORAL (ADMIN)'}</span>}
                    {!isGuest && (room.creatorRole === 'admin' || room.creatorEmail === 'ciberportero@gmail.com') && (
                        <span className="admin-badge-header">SALA OFICIAL (ADMIN)</span>
                    )}
                </h1>
                <button 
                    onClick={() => setIsModalOpen(true)} 
                    className="config-btn"
                    title={canManageRoom ? "Configuración de la sala" : "Información de la sala"}
                >
                    <Settings size={22} />
                </button>
            </div>

            <div className="meta-info-container">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'nowrap' }}>
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
                        <span>HISTORIAL</span>
                    </a>
                </div>

                {room.description && (
                    <p className="room-description-text">{room.description}</p>
                )}
            </div>

            {/* Config Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content fade-up" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-icon-wrapper">
                                <Settings size={20} />
                            </div>
                            <h3>Configuración de la Sala</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="modal-section">
                                <h4 className="section-title-modal">General</h4>
                                <div className="input-group">
                                    <label>{roomsT.edit.nameLabel}</label>
                                    <input 
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        placeholder={roomsT.sidebar.placeholderName}
                                        disabled={!canManageRoom}
                                    />
                                </div>

                                <div className="input-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label>Descripción de la Sala</label>
                                        <span className={`word-counter ${getWordCount(editDesc) > 150 ? 'limit-reached' : ''}`}>
                                            {getWordCount(editDesc)} / 150 palabras
                                        </span>
                                    </div>
                                    <textarea 
                                        value={editDesc}
                                        onChange={e => setEditDesc(e.target.value)}
                                        placeholder="Describe el propósito de esta sala de estudio..."
                                        className="desc-textarea"
                                        disabled={!canManageRoom}
                                    />
                                </div>

                                <div className="input-row">
                                    <div className="input-group">
                                        <label>Código Secreto</label>
                                        <div className="input-with-icon">
                                            <Key size={16} />
                                            <input 
                                                value={editCode}
                                                onChange={e => setEditCode(e.target.value)}
                                                placeholder="Ej: MAGIOS2026"
                                                disabled={!canManageRoom}
                                            />
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label>URL / Slug</label>
                                        <div className="input-with-icon">
                                            <LinkIcon size={16} />
                                            <input 
                                                value={editSlug}
                                                onChange={e => setEditSlug(e.target.value)}
                                                placeholder="slug-de-sala"
                                                disabled={!canManageRoom}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {canManageRoom && (
                                <div className="modal-section" style={{ marginTop: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <Users size={18} color="#94a3b8" />
                                        <h4 className="section-title-modal" style={{ margin: 0 }}>Gestionar Miembros</h4>
                                    </div>
                                    <div className="members-manage-list">
                                        {room.members?.map((member: any) => {
                                            const isMe = member.id === 'guest-me';
                                            return (
                                                <div key={member.id} className="member-manage-row">
                                                    <img 
                                                        src={member.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent((member.user.name || 'U').replace(/\s*\([^)]*\)/g, '').trim())}`} 
                                                        className="member-mini-avatar" 
                                                    />
                                                    <div className="member-meta">
                                                        <span className="member-name">
                                                            {member.user.name} {isMe ? '(tú)' : ''}
                                                        </span>
                                                        <span className={`role-badge ${member.role}`}>
                                                            {member.role === 'admin' ? 'Admin' : 'Miembro'}
                                                        </span>
                                                    </div>
                                                    {!isMe && (
                                                        <div className="member-actions">
                                                            <button 
                                                                onClick={() => handleToggleAdmin(member.id)}
                                                                className={`member-action-btn ${member.role === 'admin' ? 'active' : ''}`}
                                                                title={member.role === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}
                                                            >
                                                                <Shield size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleKick(member.id)}
                                                                className="member-action-btn kick"
                                                                title="Echar miembro"
                                                            >
                                                                <UserMinus size={16} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            {canManageRoom ? (
                                <button onClick={handleDelete} className="action-btn delete">
                                    <Trash2 size={18} />
                                    <span>Eliminar Sala</span>
                                </button>
                            ) : (
                                <button onClick={handleLeaveRoom} className="action-btn delete">
                                    <Trash2 size={18} />
                                    <span>Salir de la Sala</span>
                                </button>
                            )}
                            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem' }}>
                                <button onClick={() => setIsModalOpen(false)} className="action-btn cancel">Cerrar</button>
                                {canManageRoom && (
                                    <button onClick={handleUpdate} className="action-btn save">
                                        <Check size={20} />
                                        <span>Guardar</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .room-header { margin-bottom: 1rem; position: relative; }
                .title-row { display: flex; align-items: center; gap: 1rem; }
                .room-title { font-size: 2.5rem; font-weight: 900; margin: 0; display: flex; align-items: center; gap: 0.6rem; }
                .room-label-tag { font-size: 1rem; color: var(--accent); font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; background: rgba(0, 112, 243, 0.05); padding: 0.2rem 0.6rem; border-radius: 8px; }
                .demo-badge, .admin-badge-header, .room-code-badge, .mobile-history-btn { 
                    font-size: 0.75rem; 
                    font-weight: 900; 
                    padding: 0.4rem 0.8rem; 
                    border-radius: 10px; 
                    text-transform: uppercase; 
                    letter-spacing: 0.05em; 
                    display: inline-flex; 
                    align-items: center; 
                    gap: 0.4rem;
                    height: fit-content;
                }

                .demo-badge { background: #fff1f2; color: #ef4444; border: 1px solid #fee2e2; margin-left: 0.5rem; }
                .admin-badge-header { background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; margin-left: 0.5rem; }
                
                .meta-info-container { display: flex; align-items: center; gap: 1.25rem; margin-top: 1rem; flex-wrap: wrap; }
                
                .room-description-text { margin: 0; font-size: 1.1rem; color: #64748b; line-height: 1.6; max-width: 800px; font-weight: 500; }

                .config-btn { background: none; border: none; color: #cbd5e1; cursor: pointer; transition: all 0.3s; padding: 0.5rem; display: flex; align-items: center; justify-content: center; }
                .config-btn:hover { color: var(--accent); transform: rotate(45deg); }

                .header-actions-row { display: none; align-items: center; gap: 0.6rem; margin-top: 0.75rem; flex-wrap: wrap; }
                .room-code-badge { color: var(--accent); background: rgba(0, 112, 243, 0.05); border: 1px solid rgba(0, 112, 243, 0.1); }

                /* Modal Styles */
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
                .modal-content { background: #fff; width: 100%; max-width: 600px; border-radius: 28px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); overflow: hidden; }
                
                .modal-header { padding: 1.5rem 2rem; display: flex; align-items: center; gap: 1rem; border-bottom: 1px solid #f1f5f9; }
                .modal-icon-wrapper { width: 40px; height: 40px; background: rgba(0, 112, 243, 0.05); color: var(--accent); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
                .modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 900; color: #1e293b; }
                .close-btn { margin-left: auto; background: none; border: none; color: #94a3b8; cursor: pointer; padding: 0.5rem; transition: color 0.2s; }
                .close-btn:hover { color: #ef4444; }

                .modal-body { padding: 2rem; display: flex; flex-direction: column; gap: 0.5rem; max-height: 70vh; overflow-y: auto; }
                .section-title-modal { font-size: 0.75rem; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1rem; }
                
                .input-group { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; margin-bottom: 1rem; }
                .input-group label { font-size: 0.75rem; font-weight: 800; color: #64748b; }
                .input-group input, .desc-textarea { padding: 0.8rem 1rem; border-radius: 14px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 1rem; font-weight: 600; outline: none; transition: all 0.2s; width: 100%; }
                .input-group input:focus, .desc-textarea:focus { border-color: var(--accent); background: #fff; box-shadow: 0 0 0 4px rgba(0, 112, 243, 0.05); }
                
                .desc-textarea { min-height: 100px; resize: vertical; font-family: inherit; line-height: 1.5; font-size: 0.95rem; }
                .word-counter { font-size: 0.7rem; font-weight: 800; color: #94a3b8; }
                .word-counter.limit-reached { color: #ef4444; }

                .input-row { display: flex; gap: 1.25rem; }
                .input-with-icon { position: relative; display: flex; align-items: center; }
                .input-with-icon :global(svg) { position: absolute; left: 1rem; color: #94a3b8; }
                .input-with-icon input { padding-left: 2.75rem; }

                .members-manage-list { display: flex; flex-direction: column; gap: 0.5rem; }
                .member-manage-row { display: flex; align-items: center; gap: 0.8rem; padding: 0.75rem 1rem; background: #f8fafc; border-radius: 16px; border: 1px solid #f1f5f9; }
                .member-mini-avatar { width: 36px; height: 36px; border-radius: 10px; border: 2px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
                .member-meta { flex: 1; display: flex; flex-direction: column; }
                .member-name { font-size: 0.95rem; font-weight: 800; color: #1e293b; }
                .role-badge { font-size: 0.65rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; width: fit-content; padding: 0.1rem 0.4rem; border-radius: 4px; margin-top: 0.1rem; }
                .role-badge.admin { background: rgba(0, 112, 243, 0.1); color: var(--accent); }
                .role-badge.member { background: #e2e8f0; color: #64748b; }
                
                .member-actions { display: flex; gap: 0.4rem; }
                .member-action-btn { width: 34px; height: 34px; border-radius: 10px; border: none; background: #fff; color: #94a3b8; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
                .member-action-btn:hover { color: var(--accent); transform: scale(1.1); }
                .member-action-btn.active { background: var(--accent); color: #fff; }
                .member-action-btn.kick:hover { background: #fff1f2; color: #ef4444; }

                .modal-footer { padding: 1.5rem 2rem; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; align-items: center; }
                .action-btn { display: flex; align-items: center; gap: 0.6rem; padding: 0.75rem 1.25rem; border-radius: 14px; border: none; font-weight: 700; cursor: pointer; transition: all 0.2s; font-size: 0.9rem; }
                .action-btn.delete { background: #fff1f2; color: #ef4444; border: 1px solid #fee2e2; }
                .action-btn.delete:hover { background: #ef4444; color: #fff; transform: translateY(-2px); }
                .action-btn.save { background: var(--accent); color: #fff; box-shadow: 0 4px 15px rgba(0, 112, 243, 0.2); }
                .action-btn.save:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 112, 243, 0.3); }
                .action-btn.cancel { background: transparent; color: #64748b; }
                .action-btn.cancel:hover { color: #1e293b; background: #f1f5f9; }

                .fade-up { animation: fade-up 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                .mobile-history-btn { display: none; background: #fff; color: var(--accent); border: 1px solid rgba(0, 112, 243, 0.1); text-decoration: none; transition: all 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
                
                @media (max-width: 1024px) {
                    .room-title { font-size: 1.75rem; flex-wrap: wrap; }
                    .room-label-tag { font-size: 0.8rem; }
                    .meta-info-container { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
                    .room-description-text { font-size: 0.95rem; }
                    .header-actions-row { display: flex; margin-top: 1rem; flex-wrap: wrap; gap: 0.8rem; }
                    .mobile-history-btn { display: flex; }
                    .demo-badge, .admin-badge-header, .room-code-badge, .mobile-history-btn { font-size: 0.7rem; padding: 0.3rem 0.6rem; border-radius: 8px; margin-left: 0; }
                    .modal-overlay { padding: 1rem; }
                    .modal-content { border-radius: 20px; }
                    .input-row { flex-direction: column; }
                    .modal-footer { flex-direction: row; gap: 0.75rem; flex-wrap: wrap; }
                    .modal-footer div { margin-left: 0 !important; width: auto; justify-content: flex-end; flex: 1; display: flex; gap: 0.5rem; }
                    .action-btn { flex: 1; justify-content: center; padding: 0.6rem 0.8rem; font-size: 0.8rem; }
                    .action-btn.delete { flex: 0 0 auto; width: fit-content; }
                }
            `}</style>
        </header>
    );
}
