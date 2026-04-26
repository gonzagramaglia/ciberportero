'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Pencil, Plus, Trash2, Hash, Check, Folder, FolderOpen, History as HistoryIcon, MessageSquare } from 'lucide-react';
import { createCategory, createSubcategory } from '@/lib/salasActions';
import { toast } from 'react-hot-toast';
import { translations } from '@/lib/translations';
import { guestStore } from '@/lib/guestStore';
import { useLanguage } from '@/context/LanguageContext';

export default function RoomSidebar({ room: initialRoom, session }: any) {
    const { lang } = useLanguage();
    const params = useParams();
    const [currentSubId, setCurrentSubId] = useState<string | null>(null);

    const scrollToChat = () => {
        if (window.innerWidth <= 1024) {
            setTimeout(() => {
                const chatArea = document.getElementById('chat-scroll-top') || document.querySelector('.room-chat-client');
                if (chatArea) {
                    chatArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    };

    React.useEffect(() => {
        const updateSubId = () => {
            const hash = window.location.hash.replace('#', '');
            setCurrentSubId(hash || null);
        };

        const handleCustomChange = (e: any) => {
            if (e.detail !== undefined) setCurrentSubId(e.detail);
        };

        updateSubId();
        window.addEventListener('hashchange', updateSubId);
        window.addEventListener('subcategory-change', handleCustomChange);

        return () => {
            window.removeEventListener('hashchange', updateSubId);
            window.removeEventListener('subcategory-change', handleCustomChange);
        };
    }, []);
    const [room, setRoom] = useState(initialRoom);
    const isGuest = initialRoom.creatorId === 'guest' || initialRoom.id === 'test-room';
    const isTestRoom = initialRoom.id === 'test-room';
    const isCreator = initialRoom.creatorId === 'guest' || initialRoom.creatorId === session?.user?.id;
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [isAddingSub, setIsAddingSub] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [loading, setLoading] = useState(false);
    const [editingCat, setEditingCat] = useState<string | null>(null);
    const [editingSub, setEditingSub] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    const t = translations[lang as keyof typeof translations] || translations.es;
    const roomsT = t.rooms;

    // Load guest room data if applicable
    React.useEffect(() => {
        const syncRoom = () => {
            if (isGuest) {
                const gRoom = guestStore.getRoom(initialRoom.id);
                if (gRoom) setRoom({ ...gRoom });
            }
        };

        syncRoom();
        window.addEventListener('subcategory-change', syncRoom);
        return () => window.removeEventListener('subcategory-change', syncRoom);
    }, [isGuest, initialRoom.id]);

    const handleUpdateCat = async (catId: string) => {
        if (!editValue) return;
        if (isGuest) {
            guestStore.updateCategory(room.id, catId, editValue);
            setRoom({ ...guestStore.getRoom(room.id) } as any);
            setEditingCat(null);
        }
    };

    const handleDeleteCat = async (catId: string) => {
        if (!confirm(lang === 'es' ? '¿Eliminar categoría?' : 'Delete category?')) return;
        if (isGuest) {
            guestStore.deleteCategory(room.id, catId);
            setRoom({ ...guestStore.getRoom(room.id) } as any);
        }
    };

    const handleUpdateSub = async (subId: string) => {
        if (!editValue) return;
        if (isGuest) {
            guestStore.updateSubcategory(subId, editValue);
            setRoom({ ...guestStore.getRoom(room.id) } as any);
            setEditingSub(null);
        }
    };

    const handleDeleteSub = async (subId: string) => {
        if (!confirm(lang === 'es' ? '¿Eliminar subcategoría?' : 'Delete subcategory?')) return;
        if (isGuest) {
            guestStore.deleteSubcategory(subId);
            setRoom({ ...guestStore.getRoom(room.id) } as any);
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName) return;
        setLoading(true);

        if (isGuest) {
            guestStore.createCategory(room.id, newName);
            setRoom({ ...guestStore.getRoom(room.id) } as any);
            toast.success(roomsT.sidebar.categoryCreated);
            setIsAddingCategory(false);
            setNewName('');
        } else {
            const res = await createCategory(room.id, newName);
            if (res.success) {
                toast.success(roomsT.sidebar.categoryCreated);
                setIsAddingCategory(false);
                setNewName('');
            }
        }
        setLoading(false);
    };

    const handleAddSub = async (e: React.FormEvent, catId: string) => {
        e.preventDefault();
        if (!newName) return;
        setLoading(true);

        if (isGuest) {
            guestStore.createSubcategory(catId, newName);
            setRoom({ ...guestStore.getRoom(room.id) } as any);
            toast.success(roomsT.sidebar.subcategoryCreated);
            setIsAddingSub(null);
            setNewName('');
        } else {
            const res = await createSubcategory(catId, newName);
            if (res.success) {
                toast.success(roomsT.sidebar.subcategoryCreated);
                setIsAddingSub(null);
                setNewName('');
            }
        }
        setLoading(false);
    };

    const categories = room.categories || [];

    return (
        <aside className="room-sidebar" style={{ width: '280px', flexShrink: 0 }}>
            <div className="categories-container" style={{ flex: 1.5, minWidth: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '2rem' }}>
                    <a
                        href="#general"
                        className={`sub-link ${!currentSubId || currentSubId === 'general' ? 'active' : ''}`}
                        onClick={(e) => {
                            window.dispatchEvent(new CustomEvent('subcategory-change', { detail: 'general' }));
                            setCurrentSubId('general');
                            scrollToChat();
                        }}
                    >
                        <MessageSquare size={18} />
                        <span style={{ fontSize: '1rem', fontWeight: '900' }}>{roomsT.chat.generalChat}</span>
                    </a>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
                    <h3 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8' }}>{roomsT.sidebar.categories}</h3>
                    {isCreator && (
                        <button onClick={() => {
                            setEditingCat(null);
                            setEditingSub(null);
                            setIsAddingSub(null);
                            setIsAddingCategory(true);
                        }} style={{ background: 'var(--accent-light)', border: 'none', color: 'var(--accent)', borderRadius: '10px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Plus size={18} />
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {isAddingCategory && (
                        <form onSubmit={handleAddCategory} style={{ marginBottom: '1rem' }} className="fade-in">
                            <input
                                autoFocus
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                placeholder={roomsT.sidebar.placeholderName}
                                style={{
                                    width: '100%',
                                    padding: '0.8rem 1rem',
                                    borderRadius: '14px',
                                    border: '2px solid var(--accent)',
                                    background: '#fff',
                                    fontSize: '0.95rem',
                                    fontWeight: '600',
                                    outline: 'none',
                                    boxShadow: '0 4px 12px rgba(0, 112, 243, 0.1)'
                                }}
                                onBlur={() => !newName && setIsAddingCategory(false)}
                            />
                        </form>
                    )}

                    {categories.map((cat: any) => (
                        <div key={cat.id} className="category-group">
                            <div className="category-header" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: '#1e293b', fontWeight: '800', padding: '0 0.5rem' }}>
                                {editingCat === cat.id ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', width: '100%' }}>
                                        <input
                                            autoFocus
                                            value={editValue}
                                            onChange={e => setEditValue(e.target.value)}
                                            style={{ flex: 1, border: 'none', borderBottom: '2px solid var(--accent)', outline: 'none', fontSize: '0.95rem', fontWeight: '800', background: 'transparent' }}
                                        />
                                        <button onClick={() => handleUpdateCat(cat.id)} className="mini-action-btn confirm"><Check size={14} /></button>
                                        <button onClick={() => handleDeleteCat(cat.id)} className="mini-action-btn delete"><Trash2 size={12} /></button>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem', flex: 1 }}>
                                            {cat.subcategories.some((s: any) => s.id === currentSubId) ? (
                                                <FolderOpen size={16} color="var(--accent)" />
                                            ) : (
                                                <Folder size={16} color="var(--muted)" style={{ opacity: 0.7 }} />
                                            )}
                                            {cat.name}
                                        </div>
                                        {isCreator && (
                                            <div style={{ display: 'flex', gap: '0.2rem' }}>
                                                <button onClick={() => {
                                                    setEditingSub(null);
                                                    setIsAddingSub(null);
                                                    setIsAddingCategory(false);
                                                    setEditingCat(cat.id);
                                                    setEditValue(cat.name);
                                                }} className="mini-action-btn edit"><Pencil size={12} /></button>
                                                <button onClick={() => {
                                                    setEditingCat(null);
                                                    setEditingSub(null);
                                                    setIsAddingCategory(false);
                                                    setIsAddingSub(cat.id);
                                                }} className="mini-action-btn plus"><Plus size={14} /></button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="sub-list">
                                {cat.subcategories.map((sub: any) => (
                                    <div key={sub.id} className="sub-item-container" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                        {editingSub === sub.id ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', flex: 1, padding: '0.1rem 0' }}>
                                                <input
                                                    autoFocus
                                                    value={editValue}
                                                    onChange={e => setEditValue(e.target.value)}
                                                    style={{ flex: 1, border: 'none', borderBottom: '1px solid var(--accent)', outline: 'none', fontSize: '0.85rem', background: 'transparent' }}
                                                />
                                                <button onClick={() => handleUpdateSub(sub.id)} className="mini-action-btn confirm"><Check size={12} /></button>
                                                <button onClick={() => handleDeleteSub(sub.id)} className="mini-action-btn delete"><Trash2 size={10} /></button>
                                            </div>
                                        ) : (
                                            <>
                                                <a
                                                    href={`#${sub.id}`}
                                                    className={`sub-link ${currentSubId === sub.id ? 'active' : ''}`}
                                                    style={{ flex: 1 }}
                                                    onClick={(e) => {
                                                        window.dispatchEvent(new CustomEvent('subcategory-change', { detail: sub.id }));
                                                        setCurrentSubId(sub.id);
                                                    }}
                                                >
                                                    <Hash size={14} style={{ opacity: currentSubId === sub.id ? 1 : 0.5 }} />
                                                    {sub.name}
                                                </a>
                                                {isCreator && (
                                                    <button onClick={() => {
                                                        setEditingCat(null);
                                                        setIsAddingSub(null);
                                                        setIsAddingCategory(false);
                                                        setEditingSub(sub.id);
                                                        setEditValue(sub.name);
                                                    }} className="mini-action-btn edit sub"><Pencil size={10} /></button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))}

                                {isAddingSub === cat.id && (
                                    <form onSubmit={(e) => handleAddSub(e, cat.id)} className="fade-in">
                                        <input
                                            autoFocus
                                            value={newName}
                                            onChange={e => setNewName(e.target.value)}
                                            placeholder={roomsT.sidebar.placeholderName}
                                            onBlur={() => !newName && setIsAddingSub(null)}
                                            style={{
                                                width: '100%',
                                                padding: '0.5rem 0.8rem',
                                                borderRadius: '10px',
                                                border: '1px solid var(--accent)',
                                                fontSize: '0.85rem',
                                                outline: 'none',
                                                marginTop: '0.2rem',
                                                boxShadow: '0 4px 12px rgba(0, 112, 243, 0.05)'
                                            }}
                                        />
                                    </form>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="sidebar-history-footer">
                <a
                    href="#history"
                    className={`sub-link ${currentSubId === 'history' ? 'active' : ''}`}
                    onClick={() => {
                        window.dispatchEvent(new CustomEvent('subcategory-change', { detail: 'history' }));
                        setCurrentSubId('history');
                    }}
                >
                    <HistoryIcon size={18} />
                    <span style={{ fontWeight: '900' }}>
                        Historial<span className="hide-mobile-text"> de Mensajes</span>
                    </span>
                </a>
            </div>

            <div className="members-section" style={{ marginTop: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1.5rem 0.5rem', fontSize: '0.85rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>
                    {roomsT.sidebar.members} ({room.members?.length || 0})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {room.members?.map((member: any) => {
                        const isMe = member.user.name.includes('(tú)') || member.user.name === 'Invitado';
                        return (
                            <div key={member.id} className="member-item">
                                <img src={member.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent((member.user.name || 'U').replace(/\s*\([^)]*\)/g, '').trim())}`} alt={member.user.name} className="member-avatar" />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#1e293b' }}>
                                        {member.user.name}{isMe && !member.user.name.includes('(tú)') ? ' (tú)' : ''}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                        {roomsT.sidebar.joined + ' '}
                                        {new Date(member.createdAt).toLocaleDateString(lang, { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>

            <style jsx>{`
                .room-sidebar {
                    padding-right: 1rem;
                }
                
                .mini-action-btn { 
                    width: 26px; 
                    height: 26px; 
                    border-radius: 8px; 
                    border: none; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    cursor: pointer; 
                    transition: all 0.2s; 
                    background: rgba(148, 163, 184, 0.1); 
                    color: #64748b; 
                    padding: 0;
                    opacity: 0;
                }
                .category-group:hover .mini-action-btn,
                .sub-item-container:hover .mini-action-btn { 
                    opacity: 1; 
                }
                .mini-action-btn:hover { background: var(--accent); color: #fff; transform: scale(1.1); }
                .mini-action-btn.delete:hover { background: #ef4444; color: #fff; }
                .mini-action-btn.confirm { color: #10b981; opacity: 1; }
                .mini-action-btn.plus { background: var(--accent-light); color: var(--accent); opacity: 1; }
                
                .category-group { 
                    margin-bottom: 1.5rem; 
                }
                
                .category-header {
                    padding: 0.6rem 0.8rem;
                    border-radius: 12px;
                    transition: all 0.2s;
                }
                
                .category-header:hover {
                    background: #f8fafc;
                }

                .sub-link {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    padding: 0.7rem 1rem;
                    border-radius: 12px;
                    color: #64748b;
                    font-size: 0.95rem;
                    font-weight: 600;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    text-decoration: none !important;
                    position: relative;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }
                
                .sub-link:hover {
                    background: #f1f5f9;
                    color: #1e293b;
                    transform: translateX(4px);
                }
                
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                
                .sub-link.active {
                    background: rgba(0, 112, 243, 0.12) !important;
                    color: #0056b3 !important;
                    font-weight: 900 !important;
                    border-left: 5px solid #0070f3 !important;
                    margin-left: -1.2rem !important;
                    padding-left: 1.2rem !important;
                    border-radius: 0 12px 12px 0 !important;
                }
                
                .sub-link.active :global(svg) { 
                    color: #0070f3 !important; 
                    opacity: 1 !important;
                    transform: scale(1.1);
                }

                .inline-reply-container {
                    margin-left: 0;
                    margin-right: 0;
                    margin-bottom: 1.5rem;
                    margin-top: 1rem;
                    width: 100%;
                }
                
                .sub-list {
                    padding-left: 0.5rem;
                    margin-left: 1.2rem;
                    border-left: 2px solid #f1f5f9;
                    margin-top: 0.2rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                }

                .sidebar-history-footer {
                    margin-top: auto;
                    padding-top: 1.5rem;
                    border-top: 1px solid #f1f5f9;
                }

                .hide-mobile-text {
                    display: inline;
                }

                @media (max-width: 1024px) {
                    .hide-mobile-text {
                        display: none;
                    }
                }

                .mobile-history-btn {
                    display: none;
                }

                @media (max-width: 1024px) {
                    .mobile-history-btn {
                        display: inline-flex;
                        margin-top: 0.75rem;
                    }
                    .mobile-history-btn:active {
                        transform: scale(0.95);
                        background: rgba(0, 112, 243, 0.1);
                    }
                    .sidebar-history-footer {
                        display: none;
                    }
                }

                @media (max-width: 1024px) {
                    .room-sidebar {
                        width: 100% !important;
                        margin-bottom: 1rem;
                        border-bottom: 1px solid #f1f5f9;
                        padding-bottom: 1rem;
                        display: flex !important;
                        flex-direction: column !important;
                        gap: 2rem;
                        align-items: stretch;
                        padding-right: 0;
                    }
                    .categories-container {
                        max-height: 450px;
                        overflow-y: auto;
                        padding-bottom: 1rem;
                    }
                    .members-section {
                        display: none;
                    }
                    .sub-list {
                        border-left: 2px solid #f1f5f9;
                        padding-left: 0.5rem;
                        margin-left: 1.2rem;
                    }
                }

                .member-item {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    padding: 0.6rem 0.8rem;
                    border-radius: 14px;
                    transition: all 0.2s;
                    border: 1px solid transparent;
                }
                .member-item:hover { 
                    background: #fff; 
                    border-color: #f1f5f9;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
                }
                .member-avatar { 
                    width: 36px; 
                    height: 36px; 
                    border-radius: 12px; 
                    object-fit: cover; 
                    border: 2px solid #fff;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }
                .member-info { display: flex; flex-direction: column; }
                .member-name { font-size: 0.9rem; font-weight: 800; color: #1e293b; }
                .member-date { font-size: 0.7rem; color: #94a3b8; font-weight: 600; }
            `}</style>
        </aside>
    );
}
