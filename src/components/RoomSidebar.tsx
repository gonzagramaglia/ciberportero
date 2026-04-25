'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Plus, Hash, ChevronRight, Folder, FolderOpen, Pencil, Trash2, Check, X } from 'lucide-react';
import { createCategory, createSubcategory } from '@/lib/roomsActions';
import { toast } from 'react-hot-toast';
import { translations } from '@/lib/translations';
import { guestStore } from '@/lib/guestStore';
import { useLanguage } from '@/context/LanguageContext';

export default function RoomSidebar({ room: initialRoom, session }: any) {
    const { lang } = useLanguage();
    const params = useParams();
    const [currentSubId, setCurrentSubId] = useState<string | null>(null);

    React.useEffect(() => {
        const updateSubId = () => {
            const hash = window.location.hash.replace('#', '');
            setCurrentSubId(hash || null);
        };
        updateSubId();
        window.addEventListener('hashchange', updateSubId);
        return () => window.removeEventListener('hashchange', updateSubId);
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
        if (isGuest) {
            const gRoom = guestStore.getRoom(initialRoom.id);
            if (gRoom) setRoom(gRoom);
        }
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
                                            <Folder size={16} color="var(--muted)" style={{ opacity: 0.7 }} />
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

                            <div style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', borderLeft: '2px solid #f1f5f9', marginLeft: '1rem', marginBottom: '1rem' }}>
                                {cat.subcategories.map((sub: any) => (
                                    <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
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
                                                <Link 
                                                    href={`#${sub.id}`}
                                                    className={`sub-link ${currentSubId === sub.id ? 'active' : ''}`}
                                                    style={{ flex: 1 }}
                                                >
                                                    <Hash size={14} style={{ opacity: 0.5 }} />
                                                    {sub.name}
                                                </Link>
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
                                            placeholder={lang === 'es' ? 'Nombre...' : 'Name...'}
                                            onBlur={() => !newName && setIsAddingSub(null)}
                                            style={{ 
                                                width: '100%', 
                                                padding: '0.4rem 0.6rem', 
                                                borderRadius: '8px', 
                                                border: '1px solid var(--accent)', 
                                                fontSize: '0.85rem',
                                                outline: 'none',
                                                marginTop: '0.2rem'
                                            }}
                                        />
                                    </form>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .mini-action-btn { 
                    width: 24px; 
                    height: 24px; 
                    border-radius: 7px; 
                    border: none; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    cursor: pointer; 
                    transition: all 0.2s; 
                    background: rgba(148, 163, 184, 0.05); 
                    color: #94a3b8; 
                    padding: 0;
                }
                .mini-action-btn:hover { background: rgba(0, 112, 243, 0.1); color: var(--accent); }
                .mini-action-btn.delete:hover { background: #fee2e2; color: #ef4444; }
                .mini-action-btn.confirm { color: #10b981; }
                .mini-action-btn.confirm:hover { background: #dcfce7; }
                .category-group:hover .mini-action-btn { opacity: 1; }
                .mini-action-btn { opacity: 0.3; }
                .mini-action-btn.plus { background: rgba(0, 112, 243, 0.1); color: var(--accent); opacity: 1; }
            `}</style>

            <div className="members-section" style={{ marginTop: '3rem' }}>
                <h3 style={{ margin: '0 0 1.5rem 0.5rem', fontSize: '0.85rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>
                    {roomsT.sidebar.members} ({room.members?.length || 0})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {room.members?.map((member: any) => (
                        <div key={member.id} className="member-item">
                            <img 
                                src={member.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.name || 'U')}&background=random`} 
                                alt={member.user.name} 
                                className="member-avatar"
                            />
                            <div className="member-info">
                                <span className="member-name">{member.user.name}</span>
                                <span className="member-date">
                                    {roomsT.sidebar.joined} {new Date(member.createdAt).toLocaleDateString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-AR' : 'en-US', { day: 'numeric', month: 'short' })}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .add-cat-btn:hover { background: var(--accent) !important; color: #fff !important; transform: rotate(90deg); }
                
                .category-group { margin-bottom: 0.5rem; }
                
                .sub-link {
                    display: flex;
                    align-items: center;
                    gap: 0.7rem;
                    padding: 0.8rem 1rem;
                    border-radius: 14px;
                    color: #64748b;
                    font-size: 1rem;
                    font-weight: 600;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    text-decoration: none !important;
                    border: 1px solid transparent;
                }
                .sub-link:hover {
                    background: #fff;
                    color: var(--accent);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
                    border-color: #f1f5f9;
                    transform: translateX(3px);
                }
                .sub-link.active {
                    background: var(--accent);
                    color: #fff;
                    font-weight: 800;
                    box-shadow: 0 10px 20px rgba(0, 112, 243, 0.2);
                }
                .sub-link.active :global(svg) { color: #fff !important; }
                
                @media (max-width: 1024px) {
                    .room-sidebar {
                        width: 100% !important;
                        margin-bottom: 2rem;
                        border-bottom: 1px solid #f1f5f9;
                        padding-bottom: 2rem;
                        display: flex !important;
                        flex-direction: row !important;
                        gap: 1.5rem;
                        align-items: flex-start;
                    }
                    .room-sidebar > div:first-child,
                    .room-sidebar > div:nth-child(2) {
                        flex: 1.2;
                        min-width: 0;
                    }
                    .members-section {
                        flex: 1;
                        margin-top: 0 !important;
                        min-width: 0;
                    }
                }

                .member-item {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    padding: 0.6rem 0.8rem;
                    border-radius: 12px;
                    transition: background 0.2s;
                }
                .member-item:hover { background: #f8fafc; }
                .member-avatar { width: 32px; height: 32px; border-radius: 10px; object-fit: cover; }
                .member-info { display: flex; flex-direction: column; }
                .member-name { font-size: 0.9rem; font-weight: 700; color: #1e293b; }
                .member-date { font-size: 0.7rem; color: #94a3b8; font-weight: 600; }
            `}</style>
        </aside>
    );
}
