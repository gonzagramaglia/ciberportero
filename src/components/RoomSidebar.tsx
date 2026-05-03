'use client';

import React, { useState, useEffect } from 'react';
import { Pencil, Plus, Trash2, Hash, Check, Folder, FolderOpen, History as HistoryIcon, MessageSquare, X, Settings2, GripVertical, CheckCircle2, ShieldCheck, ChevronUp, ChevronDown, Wrench } from 'lucide-react';
import { createCategory, createSubcategory, updateCategory, deleteCategory, updateSubcategory, deleteSubcategory, moveSubcategory, getRoomInfo } from '@/lib/salasActions';
import { toast } from 'react-hot-toast';
import { translations } from '@/lib/translations';
import { guestStore } from '@/lib/guestStore';
import { useLanguage } from '@/context/LanguageContext';

export default function RoomSidebar({ room: initialRoom, session }: any) {
    const { lang } = useLanguage();
    const [currentSubId, setCurrentSubId] = useState<string | null>(null);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    
    // Unified Drag & Management State
    const [draggingItem, setDraggingItem] = useState<{type: 'cat' | 'sub', id: string, catId?: string} | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [editSlugValue, setEditSlugValue] = useState('');
    const [isAddingInModal, setIsAddingInModal] = useState<{type: 'cat' | 'sub', catId?: string} | null>(null);
    const [modalNewName, setModalNewName] = useState('');
    const [editDescValue, setEditDescValue] = useState('');

    const scrollToChat = () => {
        if (window.innerWidth <= 1024) {
            setTimeout(() => {
                const chatHeader = document.getElementById('room-breadcrumb-focus');
                if (chatHeader) {
                    chatHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    const chatArea = document.getElementById('chat-scroll-top') || document.querySelector('.room-chat-client');
                    if (chatArea) chatArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    
    // Check if current user is admin in this room
    const myMember = room?.members?.find((m: any) => m.userId === session?.user?.id || (isGuest && (m.id === 'guest-me' || m.user.name === 'Invitado')));
    const isAdmin = myMember?.role === 'admin';
    const isReallyCreator = (initialRoom?.creatorId === session?.user?.id && !!session?.user?.id) || (isGuest && initialRoom?.creatorId === 'guest' && initialRoom.id !== 'test-room');
    let canManage = (!!session?.user?.id && (isReallyCreator || isAdmin)) || (isGuest && isAdmin);
    if (isGuest && (initialRoom.id === 'test-room' || room.id === 'test-room')) canManage = false;

    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [isAddingSub, setIsAddingSub] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [loading, setLoading] = useState(false);

    const t = translations[lang as keyof typeof translations] || translations.es;
    const roomsT = t.rooms;

    React.useEffect(() => {
        const syncRoom = () => {
            if (isGuest) {
                const gRoom = guestStore.getRoom(initialRoom.id);
                if (gRoom) setRoom({ ...gRoom });
            } else {
                // For registered users, we could also re-fetch here
                import('@/lib/salasActions').then(m => {
                    m.getRoomInfo(room.id).then(data => {
                        if (data) setRoom(data);
                    });
                });
            }
        };
        syncRoom();
        window.addEventListener('subcategory-change', syncRoom);
        window.addEventListener('room-data-updated', syncRoom);
        return () => {
            window.removeEventListener('subcategory-change', syncRoom);
            window.removeEventListener('room-data-updated', syncRoom);
        };
    }, [isGuest, initialRoom.id]);

    const handleUpdateCat = async (catId: string, value: string) => {
        if (!value) return;
        if (isGuest) {
            guestStore.updateCategory(room.id, catId, value);
            setRoom({ ...guestStore.getRoom(room.id) } as any);
            setEditingId(null);
            window.dispatchEvent(new CustomEvent('room-data-updated'));
            toast.success(lang === 'es' ? 'Categoría actualizada' : 'Category updated');
        } else {
            setLoading(true);
            try {
                const res = await updateCategory(catId, value);
                if (res.success) {
                    const { getRoomInfo } = await import('@/lib/salasActions');
                    setRoom(await getRoomInfo(room.id));
                    window.dispatchEvent(new CustomEvent('room-data-updated'));
                    setEditingId(null);
                    toast.success(lang === 'es' ? 'Categoría actualizada' : 'Category updated');
                } else toast.error(res.error || 'Error');
            } catch (error) { toast.error("Error"); } finally { setLoading(false); }
        }
    };

    const handleDeleteCat = async (catId: string) => {
        if (!confirm(lang === 'es' ? '¿Eliminar categoría y todas sus subcategorías?' : 'Delete category and all its subcategories?')) return;
        if (isGuest) {
            guestStore.deleteCategory(room.id, catId);
            setRoom({ ...guestStore.getRoom(room.id) } as any);
            window.dispatchEvent(new CustomEvent('room-data-updated'));
            toast.success(lang === 'es' ? 'Categoría eliminada' : 'Category deleted');
        } else {
            setLoading(true);
            try {
                const res = await deleteCategory(catId);
                if (res.success) {
                    const { getRoomInfo } = await import('@/lib/salasActions');
                    setRoom(await getRoomInfo(room.id));
                    window.dispatchEvent(new CustomEvent('room-data-updated'));
                    toast.success(lang === 'es' ? 'Categoría eliminada' : 'Category deleted');
                } else toast.error(res.error || 'Error');
            } catch (error) { toast.error("Error"); } finally { setLoading(false); }
        }
    };

    useEffect(() => {
        const handleOpenManage = (e: any) => {
            setIsManageModalOpen(true);
            const subId = e.detail?.subId;
            if (subId || e.detail?.catId) {
                const targetId = subId || e.detail.catId;
                const isCat = !!e.detail.catId && !subId;
                
                let target: any = null;
                if (isCat) {
                    target = room.categories.find((c: any) => c.id === targetId);
                } else {
                    target = room.categories.flatMap((c: any) => c.subcategories).find((s: any) => s.id === targetId);
                }

                if (target) {
                    setEditingId(target.id);
                    setEditValue(target.name); // Always set name first
                    if (!isCat) {
                        const parts = (target.slug || '').split('-');
                        const coreSlug = (parts.length > 1 && parts[0].length === 4) ? parts.slice(1).join('-') : (target.slug || strictSlugify(target.name));
                        setEditSlugValue(coreSlug.replace(/^#/, ''));
                        setEditDescValue(target.description || '');
                    }
                }
            }
        };
        window.addEventListener('open-management-modal', handleOpenManage as any);
        return () => window.removeEventListener('open-management-modal', handleOpenManage as any);
    }, [room]);

    useEffect(() => {
        if (!isManageModalOpen) {
            setEditingId(null);
            setEditValue('');
            setEditSlugValue('');
            setEditDescValue('');
            setIsAddingCategory(false);
            setIsAddingSub(null);
            setNewName('');
        }
    }, [isManageModalOpen]);

    const strictSlugify = (text: string) => {
        return text.toString().toLowerCase().trim()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
            .replace(/[^a-z0-9-]/g, '-') // only allow a-z, 0-9 and -
            .replace(/-+/g, '-') // collapse multiple -
            .replace(/^-+|-+$/g, ''); // remove leading/trailing -
    };

    const handleUpdateSub = async (subId: string, name: string, slug?: string, description?: string) => {
        if (!name) return;
        
        // Find current sub to check if we need to update URL
        const oldSub = room.categories.flatMap((c: any) => c.subcategories).find((s: any) => s.id === subId);
        const parts = (oldSub?.slug || '').split('-');
        const currentCoreSlug = (parts.length > 1 && parts[0].length === 4) ? parts.slice(1).join('-') : (oldSub?.slug || strictSlugify(name));
        const coreSlug = slug !== undefined ? slug : currentCoreSlug;
        
        // We pass the core slug to the action, it will add the prefix
        
        if (isGuest) {
            const prefix = oldSub?.categoryId?.slice(-4) || '';
            const gFinalSlug = prefix ? `${prefix}-${coreSlug}` : coreSlug;
            guestStore.updateSubcategory(room.id, subId, name, gFinalSlug, description);
            setRoom({ ...guestStore.getRoom(room.id) } as any);
            setEditingId(null);
            window.dispatchEvent(new CustomEvent('room-data-updated'));
            toast.success(lang === 'es' ? 'Subcategoría actualizada' : 'Subcategory updated');
        } else {
            setLoading(true);
            const tid = toast.loading(lang === 'es' ? 'Guardando...' : 'Saving...');
            try {
                const res = await updateSubcategory(subId, name, coreSlug, description);
                if (res.success) {
                    const updatedRoom: any = await getRoomInfo(room.id);
                    if (updatedRoom) {
                        setRoom(updatedRoom);
                        window.dispatchEvent(new CustomEvent('room-data-updated'));
                        if (oldSub && (window.location.hash === `#${oldSub.slug}` || window.location.hash === `#${oldSub.id}`)) {
                            const newSub = updatedRoom.categories.flatMap((c: any) => c.subcategories).find((s: any) => s.id === subId);
                            if (newSub) window.location.hash = `#${newSub.slug}`;
                        }
                    }
                    setEditingId(null);
                    toast.success(lang === 'es' ? 'Subcategoría actualizada' : 'Subcategory updated', { id: tid });
                } else {
                    toast.error(res.error || 'Error', { id: tid });
                }
            } catch (error) { 
                toast.error("Error", { id: tid }); 
            } finally { 
                setLoading(false); 
            }
        }
    };

    const handleDeleteSub = async (subId: string) => {
        if (!confirm(lang === 'es' ? '¿Eliminar esta subcategoría?' : 'Delete this subcategory?')) return;
        if (isGuest) {
            guestStore.deleteSubcategory(subId);
            setRoom({ ...guestStore.getRoom(room.id) } as any);
            window.dispatchEvent(new CustomEvent('room-data-updated'));
            toast.success(lang === 'es' ? 'Subcategoría eliminada' : 'Subcategory deleted');
        } else {
            setLoading(true);
            try {
                const res = await deleteSubcategory(subId);
                if (res.success) {
                    const { getRoomInfo } = await import('@/lib/salasActions');
                     setRoom(await getRoomInfo(room.id));
                     window.dispatchEvent(new CustomEvent('room-data-updated'));
                     toast.success(lang === 'es' ? 'Subcategoría eliminada' : 'Subcategory deleted');
                } else toast.error(res.error || 'Error');
            } catch (error) { toast.error("Error"); } finally { setLoading(false); }
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName) return;
        setLoading(true);
        try {
            if (isGuest) {
                guestStore.createCategory(room.id, newName);
                setRoom({ ...guestStore.getRoom(room.id) } as any);
                setIsAddingCategory(false);
                setNewName('');
                window.dispatchEvent(new CustomEvent('room-data-updated'));
                toast.success(lang === 'es' ? 'Categoría creada' : 'Category created');
            } else {
                const res = await createCategory(room.id, newName);
                if (res.success) {
                    const { getRoomInfo } = await import('@/lib/salasActions');
                     setRoom(await getRoomInfo(room.id));
                     window.dispatchEvent(new CustomEvent('room-data-updated'));
                     setIsAddingCategory(false);
                     setNewName('');
                     toast.success(lang === 'es' ? 'Categoría creada' : 'Category created');
                } else toast.error(res.error || 'Error');
            }
        } finally { setLoading(false); }
    };

    const handleAddSub = async (e: React.FormEvent, catId: string) => {
        e.preventDefault();
        if (!newName) return;
        const slugValue = strictSlugify(newName);
        setLoading(true);
        try {
            if (isGuest) {
                guestStore.createSubcategory(catId, newName);
                setRoom({ ...guestStore.getRoom(room.id) } as any);
                setIsAddingSub(null);
                setNewName('');
                window.dispatchEvent(new CustomEvent('room-data-updated'));
                toast.success(lang === 'es' ? 'Subcategoría creada' : 'Subcategory created');
            } else {
                const res = await createSubcategory(catId, newName);
                if (res.success) {
                    const { getRoomInfo } = await import('@/lib/salasActions');
                     setRoom(await getRoomInfo(room.id));
                     window.dispatchEvent(new CustomEvent('room-data-updated'));
                     setIsAddingSub(null);
                     setNewName('');
                     toast.success(lang === 'es' ? 'Subcategoría creada' : 'Subcategory created');
                } else toast.error(res.error || 'Error');
            }
        } finally { setLoading(false); }
    };

    const handleModalAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!modalNewName) return;
        setLoading(true);
        try {
            if (isAddingInModal?.type === 'cat') {
                if (isGuest) {
                    guestStore.createCategory(room.id, modalNewName);
                    setRoom({ ...guestStore.getRoom(room.id) } as any);
                } else {
                    const res = await createCategory(room.id, modalNewName);
                    if (res.success) {
                        const { getRoomInfo } = await import('@/lib/salasActions');
                        setRoom(await getRoomInfo(room.id));
                    }
                }
            } else if (isAddingInModal?.type === 'sub' && isAddingInModal.catId) {
                if (isGuest) {
                    guestStore.createSubcategory(isAddingInModal.catId, modalNewName);
                    setRoom({ ...guestStore.getRoom(room.id) } as any);
                } else {
                    const res = await createSubcategory(isAddingInModal.catId, modalNewName);
                    if (res.success) {
                        const { getRoomInfo } = await import('@/lib/salasActions');
                        setRoom(await getRoomInfo(room.id));
                    }
                }
            }
            setIsAddingInModal(null);
            setModalNewName('');
            window.dispatchEvent(new CustomEvent('room-data-updated'));
            toast.success(lang === 'es' ? 'Añadido con éxito' : 'Added successfully');
        } catch (error) { toast.error("Error"); } finally { setLoading(false); }
    };

    const handleReorderSub = async (catId: string, subId: string, direction: 'up' | 'down') => {
        const category = room.categories.find((c: any) => c.id === catId);
        if (!category) return;
        
        const subs = [...category.subcategories];
        const idx = subs.findIndex(s => s.id === subId);
        if (idx === -1) return;
        
        const newIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= subs.length) return;
        
        if (isGuest) {
            guestStore.moveSubcategory(catId, catId, subId, newIdx);
            setRoom({ ...guestStore.getRoom(room.id) } as any);
            window.dispatchEvent(new CustomEvent('room-data-updated'));
        } else {
            setLoading(true);
            try {
                const res = await moveSubcategory(subId, catId, newIdx);
                if (res.success) {
                    const { getRoomInfo } = await import('@/lib/salasActions');
                    setRoom(await getRoomInfo(room.id));
                    window.dispatchEvent(new CustomEvent('room-data-updated'));
                    toast.success(lang === 'es' ? 'Orden actualizado' : 'Order updated');
                } else {
                    toast.error(res.error || 'Error');
                }
            } catch (error) {
                toast.error("Error");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleReorderCat = async (catId: string, direction: 'up' | 'down') => {
        const cats = [...room.categories];
        const idx = cats.findIndex(c => c.id === catId);
        if (idx === -1) return;
        
        const newIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= cats.length) return;
        
        const [moved] = cats.splice(idx, 1);
        cats.splice(newIdx, 0, moved);
        
        if (isGuest) {
            guestStore.reorderCategories(room.id, cats);
            setRoom({ ...guestStore.getRoom(room.id) } as any);
            window.dispatchEvent(new CustomEvent('room-data-updated'));
        } else {
            setLoading(true);
            try {
                const { reorderCategories } = await import('@/lib/salasActions');
                const res = await reorderCategories(room.id, cats.map(c => c.id));
                if (res.success) {
                    const { getRoomInfo } = await import('@/lib/salasActions');
                    setRoom(await getRoomInfo(room.id));
                    window.dispatchEvent(new CustomEvent('room-data-updated'));
                    toast.success(lang === 'es' ? 'Orden de categorías actualizado' : 'Category order updated');
                } else toast.error(res.error || 'Error');
            } catch (error) { toast.error("Error"); } finally { setLoading(false); }
        }
    };

    const onDragStart = (e: React.DragEvent, type: 'cat' | 'sub', id: string, catId?: string) => {
        setDraggingItem({ type, id, catId });
        e.dataTransfer.setData('text/plain', id);
        e.currentTarget.classList.add('dragging');
    };

    const onDragEnd = (e: React.DragEvent) => {
        e.currentTarget.classList.remove('dragging');
        setDraggingItem(null);
    };

    const onDragOver = (e: React.DragEvent, targetCatId?: string) => {
        e.preventDefault();
        if (draggingItem?.type === 'sub' && draggingItem.catId === targetCatId) return;
        const target = e.currentTarget as HTMLElement;
        target.classList.add('drag-over');
    };

    const onDragLeave = (e: React.DragEvent) => {
        const target = e.currentTarget as HTMLElement;
        target.classList.remove('drag-over');
    };

    const onDrop = (e: React.DragEvent, targetId: string, targetType: 'cat' | 'sub', destCatId?: string) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLElement;
        target.classList.remove('drag-over');
        if (!draggingItem || draggingItem.id === targetId) return;

        // Block reordering within same category via drag
        if (draggingItem.type === 'sub' && draggingItem.catId === destCatId) {
            return;
        }

        if (draggingItem.type === 'cat' && targetType === 'cat') {
            const newCats = [...room.categories];
            const srcIdx = newCats.findIndex(c => c.id === draggingItem.id);
            const destIdx = newCats.findIndex(c => c.id === targetId);
            const [moved] = newCats.splice(srcIdx, 1);
            newCats.splice(destIdx, 0, moved);
            
            if (isGuest) {
                guestStore.reorderCategories(room.id, newCats);
                setRoom({ ...guestStore.getRoom(room.id) } as any);
                window.dispatchEvent(new CustomEvent('room-data-updated'));
            } else {
                setLoading(true);
                import('@/lib/salasActions').then(async (m) => {
                    const res = await m.reorderCategories(room.id, newCats.map(c => c.id));
                    if (res.success) {
                        setRoom(await m.getRoomInfo(room.id));
                        window.dispatchEvent(new CustomEvent('room-data-updated'));
                        toast.success(lang === 'es' ? 'Orden actualizado' : 'Order updated');
                    } else toast.error(res.error || 'Error');
                    setLoading(false);
                });
            }
        } else if (draggingItem.type === 'sub') {
            const finalDestCatId = destCatId || targetId;
            if (draggingItem.catId && finalDestCatId) {
                if (isGuest) {
                    const data = guestStore.getRoom(room.id);
                    if (!data) return;
                    const destCat = data.categories.find(c => c.id === finalDestCatId);
                    if (!destCat) return;
                    let newIdx = 0;
                    if (targetType === 'sub') newIdx = destCat.subcategories.findIndex(s => s.id === targetId);
                    else newIdx = destCat.subcategories.length;
                    guestStore.moveSubcategory(draggingItem.catId, finalDestCatId, draggingItem.id, newIdx);
                    setRoom({ ...guestStore.getRoom(room.id) } as any);
                    window.dispatchEvent(new CustomEvent('room-data-updated'));
                } else {
                    // Acción para usuarios reales
                    setLoading(true);
                    const destCat = room.categories.find((c: any) => c.id === finalDestCatId);
                    let newIdx = 0;
                    if (targetType === 'sub' && destCat) {
                        newIdx = destCat.subcategories.findIndex((s: any) => s.id === targetId);
                    } else if (destCat) {
                        newIdx = destCat.subcategories.length;
                    }

                    moveSubcategory(draggingItem.id, finalDestCatId, newIdx).then(res => {
                        if (res.success) {
                            toast.success(lang === 'es' ? 'Orden actualizado' : 'Order updated');
                            window.dispatchEvent(new CustomEvent('room-data-updated'));
                            import('@/lib/salasActions').then(async ({ getRoomInfo }) => {
                                setRoom(await getRoomInfo(room.id));
                            });
                        } else {
                            toast.error(res.error || 'Error');
                        }
                    }).finally(() => setLoading(false));
                }
            }
        }
    };

    const generalSub = (room.categories || []).flatMap((c: any) => c.subcategories || []).find((s: any) => s.name === 'Chat General');

    const categories = (room.categories || []).map((cat: any) => ({
        ...cat,
        subcategories: (cat.subcategories || []).filter((sub: any) => sub.name !== 'Chat General')
    })).filter((cat: any) => (cat.subcategories || []).length > 0 || (cat.name !== 'General' && cat.name !== 'Chat General'));

    return (
        <aside className="room-sidebar">
            <div className="categories-container">
                <div className="general-chat-link">
                    <a
                        href="#general"
                        className={`sub-link ${!currentSubId || currentSubId === 'general' || currentSubId === generalSub?.id ? 'active' : ''}`}
                        onClick={(e) => {
                            window.location.hash = '';
                            window.dispatchEvent(new CustomEvent('subcategory-change', { detail: 'general' }));
                            setCurrentSubId('general');
                            scrollToChat();
                        }}
                    >
                        <MessageSquare size={18} />
                        <span style={{ fontSize: '1rem', fontWeight: '900' }}>{roomsT.chat.generalChat}</span>
                    </a>
                </div>

                <div className="sidebar-section-header">
                    <h3 className="section-title">{roomsT.sidebar.categories}</h3>
                    {canManage && (
                        <button onClick={() => setIsManageModalOpen(true)} className="action-btn-sidebar manage" title={roomsT.sidebar.manageStructure}>
                            <Wrench size={18} />
                        </button>
                    )}
                </div>

                <div className="categories-list">
                    {isAddingCategory && (
                        <form onSubmit={handleAddCategory} className="fade-in add-form">
                            <input autoFocus value={newName} onChange={e => setNewName(e.target.value)} placeholder={roomsT.sidebar.placeholderName} onBlur={() => !newName && setIsAddingCategory(false)} />
                        </form>
                    )}
                    {categories.map((cat: any) => (
                        <div key={cat.id} className="category-group">
                            <div className="category-header">
                                <div className="cat-name">
                                    {cat.subcategories.some((s: any) => s.id === currentSubId) ? <FolderOpen size={16} color="var(--accent)" /> : <Folder size={16} color="#94a3b8" />}
                                    {cat.name}
                                </div>
                                {canManage && (
                                    <button 
                                        className="mini-wrench-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.dispatchEvent(new CustomEvent('open-management-modal', { detail: { catId: cat.id } }));
                                        }}
                                        title={lang === 'es' ? 'Gestionar categoría' : 'Manage category'}
                                    >
                                        <Wrench size={12} />
                                    </button>
                                )}
                            </div>
                            <div className="sub-list">
                                {cat.subcategories.map((sub: any) => (
                                    <a key={sub.id} href={`#${sub.slug || sub.id}`} className={`sub-link ${currentSubId === sub.id || currentSubId === sub.slug ? 'active' : ''}`} onClick={(e) => {
                                        window.dispatchEvent(new CustomEvent('subcategory-change', { detail: sub.id }));
                                        setCurrentSubId(sub.id);
                                        scrollToChat();
                                    }}>{(() => {
                                        const parts = (sub.slug || '').split('-');
                                        const display = (parts.length > 1 && parts[0].length === 4) ? parts.slice(1).join('-') : (sub.slug || '');
                                        return '#' + display;
                                    })()}</a>
                                ))}
                                {isAddingSub === cat.id && (
                                    <form onSubmit={(e) => handleAddSub(e, cat.id)} className="fade-in sub-add-form">
                                        <input autoFocus value={newName} onChange={e => setNewName(e.target.value)} placeholder={roomsT.sidebar.placeholderName} onBlur={() => !newName && setIsAddingSub(null)} />
                                    </form>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="sidebar-history-footer">
                <a href="#history" className={`sub-link ${currentSubId === 'history' ? 'active' : ''}`} onClick={() => {
                    window.dispatchEvent(new CustomEvent('subcategory-change', { detail: 'history' }));
                    setCurrentSubId('history');
                    scrollToChat();
                }}><HistoryIcon size={18} /><span style={{ fontWeight: '900' }}>Historial<span className="hide-mobile-text"> de Mensajes</span></span></a>
            </div>

            <div className="members-section">
                <h3 className="section-title">{roomsT.sidebar.members} ({room.members?.length || 0})</h3>
                <div className="members-list">
                    {room.members?.map((member: any) => {
                        const isMe = member.id === 'guest-me' || member.id === session?.user?.id || (isGuest && (member.id === 'guest-me' || member.user.name === 'Invitado'));
                        return (
                            <div key={member.id} className="member-item">
                                <img src={member.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent((member.user.name || 'U').replace(/\s*\([^)]*\)/g, '').trim())}`} alt={member.user.name} className="member-avatar" />
                                <div className="member-info">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <span className="member-name">{member.user.name}{(isMe && !member.user.name.includes('(tú)')) ? ' (tú)' : ''}</span>
                                        {(member.role === 'admin' || member.userId === room.creatorId) && <ShieldCheck size={14} className="admin-badge-icon" />}
                                    </div>
                                    <span className="member-date">Se unió el {new Date(member.createdAt).toLocaleDateString(lang, { day: 'numeric', month: 'long' })}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {isManageModalOpen && (
                <div className="modal-overlay" onClick={() => setIsManageModalOpen(false)}>
                    <div className="modal-content fade-up" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-icon-wrapper"><Settings2 size={20} /></div>
                            <h3>Gestionar Estructura</h3>
                            <button className="close-btn" onClick={() => setIsManageModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-actions-top">
                                <p className="modal-tip">💡 Arrastrá y soltá para mover entre categorías</p>
                            </div>


                            <div className="manage-list">
                                {categories.length === 0 && !isAddingInModal && <p className="empty-modal-text">No hay categorías para gestionar.</p>}
                                
                                 {categories.map((cat: any, catIdx: number) => (
                                    <div key={cat.id} className="manage-item-group" onDragOver={(e) => onDragOver(e, cat.id)} onDragLeave={onDragLeave} onDrop={(e) => onDrop(e, cat.id, 'cat')}>
                                        <div className="manage-row category" draggable={!editingId} onDragStart={(e) => onDragStart(e, 'cat', cat.id)} onDragEnd={onDragEnd}>
                                            {editingId === cat.id ? (
                                                <div className="edit-input-wrapper">
                                                    <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} onFocus={e => e.target.select()} onKeyDown={e => e.key === 'Enter' && handleUpdateCat(cat.id, editValue)} />
                                                    <button onClick={() => handleUpdateCat(cat.id, editValue)} className="btn-save-mini"><Check size={16} /></button>
                                                    <button onClick={() => setEditingId(null)} className="btn-cancel-mini"><X size={16} /></button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="drag-handle"><GripVertical size={16} /></div>
                                                    <Folder size={18} className="icon-cat" />
                                                    <span className="name">{cat.name}</span>
                                                    <div className="actions">
                                                        <button onClick={() => handleReorderCat(cat.id, 'up')} className="btn-action reorder" title={lang === 'es' ? 'Subir' : 'Move up'} disabled={catIdx === 0}><ChevronUp size={16} /></button>
                                                        <button onClick={() => handleReorderCat(cat.id, 'down')} className="btn-action reorder" title={lang === 'es' ? 'Bajar' : 'Move down'} disabled={catIdx === categories.length - 1}><ChevronDown size={16} /></button>
                                                        <button onClick={() => { setEditingId(cat.id); setEditValue(cat.name); }} className="btn-action edit"><Pencil size={14} /></button>
                                                        <button onClick={() => handleDeleteCat(cat.id)} className="btn-action delete"><Trash2 size={14} /></button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className="manage-subs">
                                            {cat.subcategories.map((sub: any) => (
                                                <div key={sub.id} className="manage-row sub" draggable={!editingId} onDragStart={(e) => onDragStart(e, 'sub', sub.id, cat.id)} onDragEnd={onDragEnd} onDragOver={(e) => onDragOver(e, cat.id)} onDragLeave={onDragLeave} onDrop={(e) => onDrop(e, sub.id, 'sub', cat.id)}>
                                                    {editingId === sub.id ? (
                                                        <div className="edit-input-wrapper complex">
                                                            <div className="input-with-label">
                                                                <label>Slug (# canal)</label>
                                                                <div className="input-hash-wrapper">
                                                                    <span className="hash-prefix">#</span>
                                                                    <input value={editSlugValue} onChange={e => setEditSlugValue(strictSlugify(e.target.value))} onFocus={e => e.target.select()} onKeyDown={e => e.key === 'Enter' && handleUpdateSub(sub.id, editValue, editSlugValue, editDescValue)} placeholder="ej: matrices" />
                                                                </div>
                                                            </div>
                                                            <div className="input-with-label">
                                                                <label>{lang === 'es' ? 'Descripción (opcional)' : 'Description (optional)'}</label>
                                                                <textarea 
                                                                    value={editDescValue} 
                                                                    onChange={e => setEditDescValue(e.target.value.slice(0, 600))} 
                                                                    onFocus={e => e.target.select()}
                                                                    onKeyDown={e => {
                                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                                            e.preventDefault();
                                                                            handleUpdateSub(sub.id, editValue, editSlugValue, editDescValue);
                                                                        }
                                                                    }}
                                                                    placeholder={lang === 'es' ? 'Máx 600 caracteres...' : 'Max 600 chars...'}
                                                                    className="modal-textarea-desc"
                                                                />
                                                                <span className="char-count-modal">{editDescValue.length}/600</span>
                                                            </div>
                                                            <div className="edit-actions">
                                                                <button onClick={() => handleUpdateSub(sub.id, editValue, editSlugValue, editDescValue)} className="btn-save-mini"><Check size={14} /></button>
                                                                <button onClick={() => setEditingId(null)} className="btn-cancel-mini"><X size={14} /></button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="drag-handle small"><GripVertical size={14} /></div>
                                                            <div className="sub-info-display horizontal">
                                                                <span className="slug-display">#{(() => {
                                                                    const parts = (sub.slug || '').split('-');
                                                                    return (parts.length > 1 && parts[0].length === 4) ? parts.slice(1).join('-') : (sub.slug || '');
                                                                })()}</span>
                                                            </div>
                                                            <div className="actions">
                                                                <button onClick={() => handleReorderSub(cat.id, sub.id, 'up')} className="btn-action reorder" title={lang === 'es' ? 'Subir' : 'Move up'} disabled={cat.subcategories.indexOf(sub) === 0}><ChevronUp size={14} /></button>
                                                                <button onClick={() => handleReorderSub(cat.id, sub.id, 'down')} className="btn-action reorder" title={lang === 'es' ? 'Bajar' : 'Move down'} disabled={cat.subcategories.indexOf(sub) === cat.subcategories.length - 1}><ChevronDown size={14} /></button>
                                                                <button onClick={() => { 
                                                                    setEditingId(sub.id); 
                                                                    setEditValue(sub.name); 
                                                                    const parts = (sub.slug || '').split('-');
                                                                    const coreSlug = (parts.length > 1 && parts[0].length === 4) ? parts.slice(1).join('-') : sub.slug;
                                                                    setEditSlugValue(coreSlug.replace(/^#/, '')); 
                                                                    setEditDescValue(sub.description || ''); 
                                                                }} className="btn-action edit"><Pencil size={12} /></button>
                                                                <button onClick={() => handleDeleteSub(sub.id)} className="btn-action delete"><Trash2 size={12} /></button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                            {isAddingInModal?.type === 'sub' && isAddingInModal.catId === cat.id ? (
                                                <form onSubmit={handleModalAdd} className="manage-row sub add-sub-modal">
                                                    <Hash size={14} color="var(--accent)" />
                                                    <input autoFocus value={modalNewName} onChange={e => setModalNewName(e.target.value)} placeholder="Nueva subcategoría..." onBlur={() => !modalNewName && setIsAddingInModal(null)} />
                                                    <button type="submit" className="btn-save-mini"><Check size={14} /></button>
                                                </form>
                                            ) : (draggingItem?.type === 'sub' && draggingItem.catId === cat.id) ? null : (
                                                <button 
                                                    className={`btn-add-sub-subtle ${draggingItem?.type === 'sub' ? 'drop-active' : ''}`}
                                                    onClick={() => setIsAddingInModal({ type: 'sub', catId: cat.id })}
                                                    onDragOver={(e) => onDragOver(e, cat.id)}
                                                    onDragLeave={onDragLeave}
                                                    onDrop={(e) => onDrop(e, cat.id, 'cat')}
                                                >
                                                    {draggingItem?.type === 'sub' ? (
                                                        <span>Soltá subcategorías acá</span>
                                                    ) : (
                                                        <>
                                                            <Plus size={14} />
                                                            <span>Añadir subcategoría</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {isAddingInModal?.type === 'cat' ? (
                                    <form onSubmit={handleModalAdd} className="manage-item-group add-form-modal">
                                        <div className="manage-row">
                                            <Folder size={18} color="var(--accent)" />
                                            <input autoFocus value={modalNewName} onChange={e => setModalNewName(e.target.value)} placeholder="Nombre de la categoría..." onBlur={() => !modalNewName && setIsAddingInModal(null)} />
                                            <button type="submit" className="btn-save-mini"><Check size={16} /></button>
                                        </div>
                                    </form>
                                ) : (
                                    <button className="btn-add-bottom-subtle" onClick={() => setIsAddingInModal({ type: 'cat' })}>
                                        <Plus size={18} />
                                        <span>Añadir nueva categoría</span>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-footer cancel" onClick={() => setIsManageModalOpen(false)}>Cerrar</button>
                            <button className="btn-footer confirm" onClick={() => {
                                if (editingId) {
                                    const isSub = room.categories.some((c: any) => c.subcategories.some((s: any) => s.id === editingId || s.slug === editingId));
                                    if (isSub) handleUpdateSub(editingId, editValue, editSlugValue, editDescValue);
                                    else handleUpdateCat(editingId, editValue);
                                    window.dispatchEvent(new CustomEvent('room-data-updated'));
                                }
                                if (modalNewName) {
                                    handleModalAdd(new Event('submit') as any);
                                }
                                setIsManageModalOpen(false);
                            }}>
                                <CheckCircle2 size={18} /> Listo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .room-sidebar { width: 280px; flex-shrink: 0; padding-right: 1rem; height: 100%; display: flex; flex-direction: column; margin-top: 14px; }
                .categories-container { flex: 1; min-width: 0; overflow-y: auto; padding-right: 0.5rem; }
                .general-chat-link { margin-bottom: 2rem; }
                .sidebar-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; padding: 0 0.5rem; }
                .section-title { margin: 0; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.75rem; font-weight: 800; color: #94a3b8; }
                .action-btn-sidebar { border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; background: transparent; }
                .action-btn-sidebar.manage { 
                    color: #94a3b8; 
                    background: transparent; 
                    width: 32px; 
                    height: 32px; 
                    border-radius: 10px; 
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .action-btn-sidebar.manage:hover { 
                    color: var(--accent); 
                    background: rgba(0, 112, 243, 0.08); 
                }
                .action-btn-sidebar.manage svg { transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .action-btn-sidebar.manage:hover svg { transform: scaleY(-1); }
                .action-btn-sidebar.plus { background: var(--accent-light); color: var(--accent); border-radius: 10px; width: 32px; height: 32px; }
                .add-form input { width: 100%; padding: 0.8rem 1rem; border-radius: 14px; border: 2px solid var(--accent); background: #fff; font-size: 0.95rem; font-weight: 600; outline: none; margin-bottom: 1rem; }
                .sub-add-form input { width: 100%; padding: 0.5rem 0.8rem; border-radius: 10px; border: 1px solid var(--accent); font-size: 0.85rem; outline: none; margin-top: 0.2rem; }
                .category-group { margin-bottom: 1.25rem; }
                .category-header { display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0.8rem; border-radius: 12px; transition: all 0.2s; }
                .category-header:hover { background: #f8fafc; }
                .cat-name { display: flex; align-items: center; gap: 0.6rem; font-size: 0.95rem; font-weight: 800; color: #1e293b; }
                .mini-plus-btn { opacity: 0; width: 24px; height: 24px; border-radius: 6px; border: none; background: #e2e8f0; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .mini-wrench-btn { opacity: 0; width: 24px; height: 24px; border-radius: 8px; border: none; background: transparent; color: #cbd5e1; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); margin-left: 0.5rem; }
                .mini-wrench-btn svg { transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .category-header:hover .mini-plus-btn, .category-header:hover .mini-wrench-btn { opacity: 1; }
                .mini-wrench-btn:hover { background: rgba(0, 112, 243, 0.08); color: var(--accent); }
                .mini-wrench-btn:hover svg { transform: scaleY(-1); }
                .sub-list { padding-left: 0.5rem; margin-left: 1.2rem; border-left: 2px solid #f1f5f9; margin-top: 0.2rem; display: flex; flex-direction: column; gap: 0.25rem; }
                .sub-link { display: flex; align-items: center; gap: 0.8rem; padding: 0.6rem 0.8rem; border-radius: 10px; color: #64748b; font-size: 0.9rem; font-weight: 600; transition: all 0.2s; text-decoration: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .sub-link:hover { background: #f1f5f9; color: #1e293b; transform: translateX(4px); }
                .sub-link.active { background: rgba(0, 112, 243, 0.1) !important; color: var(--accent) !important; font-weight: 900; }
                .sidebar-history-footer { margin-top: auto; padding-top: 1.5rem; border-top: 1px solid #f1f5f9; margin-bottom: 1.5rem; }
                .members-section { border-top: 1px solid #f1f5f9; padding-top: 1.5rem; }
                .member-item { display: flex; align-items: center; gap: 0.8rem; padding: 0.6rem 0.8rem; border-radius: 12px; }
                .member-avatar { width: 34px; height: 34px; border-radius: 10px; border: 2px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.05); flex-shrink: 0; }
                .member-info { display: flex; flex-direction: column; gap: 0.15rem; }
                .member-name { font-size: 0.85rem; font-weight: 800; color: #1e293b; line-height: 1.2; }
                .member-date { font-size: 0.7rem; color: #94a3b8; font-weight: 600; }
                .admin-badge-icon { color: #10b981; opacity: 0.8; }

                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
                .modal-content { background: #fff; width: 100%; max-width: 550px; border-radius: 32px; box-shadow: 0 25px 70px rgba(0,0,0,0.2); overflow: hidden; display: flex; flex-direction: column; }
                .modal-header { padding: 1.5rem 2rem; display: flex; align-items: center; gap: 1rem; border-bottom: 1px solid #f1f5f9; background: #fff; }
                .modal-icon-wrapper { width: 44px; height: 44px; background: rgba(0, 112, 243, 0.05); color: var(--accent); border-radius: 14px; display: flex; align-items: center; justify-content: center; }
                .modal-header h3 { margin: 0; font-size: 1.4rem; font-weight: 900; color: #1e293b; letter-spacing: -0.02em; }
                .close-btn { margin-left: auto; background: #f8fafc; border: none; color: #94a3b8; cursor: pointer; width: 36px; height: 36px; border-radius: 12px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .close-btn:hover { color: #ef4444; background: #fee2e2; transform: rotate(90deg); }

                .modal-body { padding: 1.5rem 1.5rem; max-height: 60vh; overflow-y: auto; background: #fcfdfe; }
                .modal-actions-top { display: flex; flex-direction: column; gap: 0.8rem; margin-bottom: 1.2rem; }
                .modal-tip { font-size: 0.8rem; font-weight: 600; color: #64748b; background: #fff; padding: 0.7rem 1rem; border-radius: 12px; border: 1px solid #f1f5f9; text-align: center; }
                
                .manage-list { display: flex; flex-direction: column; gap: 1rem; }
                .manage-item-group { border: 1px solid #f1f5f9; border-radius: 24px; padding: 0.5rem; background: #fff; transition: all 0.2s; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
                .manage-item-group.drag-over { border-color: var(--accent); background: rgba(0, 112, 243, 0.02); }

                .manage-row { display: flex; align-items: center; gap: 0.7rem; padding: 0.7rem 1rem; border-radius: 16px; transition: all 0.2s; min-height: 54px; }
                .manage-row:hover { background: #f8fafc; }
                .manage-row.category { background: #fcfdfe; margin-bottom: 0.4rem; border: 1px solid #f1f5f9; cursor: grab; }
                .manage-row.category:active { cursor: grabbing; }
                .manage-row.sub { margin-left: 1.2rem; font-size: 0.9rem; border: 1px solid transparent; cursor: grab; }
                .manage-row.sub:active { cursor: grabbing; }
                .manage-row .name { flex: 1; font-weight: 800; color: #334155; font-size: 0.95rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                
                .edit-input-wrapper.complex { flex-direction: column; align-items: stretch; gap: 0.8rem; padding: 1rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; width: 100%; }
                .input-with-label { display: flex; flex-direction: column; gap: 0.3rem; }
                .input-with-label label { font-size: 0.65rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; }
                .input-hash-wrapper input { flex: 1; border: none; outline: none; background: transparent; font-size: 0.9rem; font-weight: 700; color: #1e293b; padding: 0.2rem 0; }
                
                .modal-textarea-desc { width: 100%; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.6rem; font-size: 0.85rem; min-height: 120px; resize: vertical; outline: none; transition: border-color 0.2s; font-family: inherit; }
                .modal-textarea-desc:focus { border-color: var(--accent); }
                .char-count-modal { align-self: flex-end; font-size: 0.65rem; font-weight: 800; color: #94a3b8; margin-top: -0.2rem; }

                .edit-actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
                
                .sub-info-display.horizontal { flex: 1; display: flex; align-items: center; gap: 0.5rem; min-width: 0; }
                .slug-display { font-size: 0.9rem; font-weight: 800; color: #334155; }
                .name-display-grey { font-size: 0.8rem; color: #94a3b8; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

                .add-form-modal { margin-bottom: 0.5rem; }
                .add-form-modal input, .add-sub-modal input { flex: 1; background: none; border: none; outline: none; font-weight: 700; font-size: 0.95rem; color: #1e293b; min-width: 0; }
                
                .drag-handle { color: #cbd5e1; cursor: grab; padding: 0.5rem; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s; }
                .drag-handle:hover { background: #f1f5f9; color: var(--accent); }
                .drag-handle.small { padding: 0.4rem; }
                .drag-handle:active { cursor: grabbing; }

                .actions { display: flex; gap: 0.4rem; }
                .btn-action { width: 32px; height: 32px; border-radius: 9px; border: none; background: #fff; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; border: 1px solid #f1f5f9; flex-shrink: 0; }
                .btn-action:hover { background: var(--accent); color: #fff; border-color: var(--accent); transform: scale(1.05); }
                .btn-action.plus { background: rgba(16, 185, 129, 0.05); color: #10b981; }
                .btn-action.plus:hover { background: #10b981; color: #fff; }
                .btn-action.delete:hover { background: #fee2e2; color: #ef4444; border-color: #fecaca; }
                .btn-action:disabled { opacity: 0.3; cursor: not-allowed; transform: none !important; background: #f8fafc !important; color: #cbd5e1 !important; border-color: #f1f5f9 !important; }
                .btn-action.reorder:hover { background: rgba(0, 112, 243, 0.05); color: var(--accent); border-color: rgba(0, 112, 243, 0.1); }

                .btn-add-bottom-subtle { 
                    width: 100%; padding: 1.25rem; border: 2px dashed #e2e8f0; border-radius: 24px; background: none; color: #94a3b8; font-weight: 800; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.75rem; transition: all 0.2s; margin-top: 0.5rem; 
                }
                .btn-add-bottom-subtle:hover { border-color: var(--accent); color: var(--accent); background: rgba(0, 112, 243, 0.02); }

                .btn-add-sub-subtle {
                    width: calc(100% - 2.4rem); margin: 0.4rem 1.2rem 0.6rem 1.2rem; padding: 0.75rem; border: 2px dashed #e2e8f0; border-radius: 16px; background: none; color: #94a3b8; font-weight: 700; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.2s;
                }
                .btn-add-sub-subtle:hover { border-color: var(--accent); color: var(--accent); background: rgba(0, 112, 243, 0.02); }
                .btn-add-sub-subtle.drop-active { border-color: #10b981; color: #10b981; background: rgba(16, 185, 129, 0.05); }

                .modal-footer { padding: 1.2rem 1.5rem; display: flex; align-items: center; justify-content: flex-end; gap: 1rem; border-top: 1px solid #f1f5f9; background: #fff; }
                .btn-footer { padding: 0.75rem 1.5rem; border-radius: 14px; font-weight: 800; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.6rem; }
                .btn-footer.cancel { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; }
                .btn-footer.confirm { background: linear-gradient(135deg, #0070f3 0%, #00a2ff 100%); color: #fff; border: none; box-shadow: 0 4px 12px rgba(0, 112, 243, 0.2); }

                .edit-input-wrapper { display: flex; align-items: center; gap: 0.4rem; flex: 1; }
                .edit-input-wrapper input { flex: 1; padding: 0.4rem 0.8rem; border-radius: 10px; border: 2px solid var(--accent); background: #fff; font-size: 0.95rem; font-weight: 700; outline: none; min-width: 0; }
                .room-settings-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.5rem; margin-bottom: 2rem; }
                .settings-title { margin: 0 0 1rem 0; font-size: 0.9rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
                .room-edit-row { background: transparent !important; border: none !important; padding: 0 !important; margin: 0 !important; }
                .btn-save-mini.large { padding: 0.6rem 1.2rem; font-size: 0.9rem; width: auto !important; height: auto !important; min-width: fit-content; }
                .btn-save-mini { background: #10b981; color: #fff; border: none; width: 32px; height: 32px; border-radius: 9px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .btn-cancel-mini { background: #f1f5f9; color: #64748b; border: none; width: 32px; height: 32px; border-radius: 9px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

                .input-hash-wrapper { display: flex; align-items: center; background: #fff; border: 2px solid var(--accent); border-radius: 10px; padding: 0 0.8rem; flex: 1; }
                .hash-prefix { color: var(--accent); font-weight: 900; font-size: 1rem; margin-right: 0.1rem; }
                .input-hash-wrapper input { border: none !important; padding: 0.4rem 0 !important; }
                
                .empty-cat-dropzone { padding: 0.8rem; text-align: center; font-size: 0.8rem; font-weight: 700; color: #94a3b8; border: 2px dashed #e2e8f0; border-radius: 14px; margin: 0.4rem 1.2rem; transition: all 0.2s; }
                
                .fade-up { animation: fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes fade-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 1024px) {
                    .room-sidebar { width: 100%; border-bottom: 1px solid #f1f5f9; padding-bottom: 1rem; }
                    .members-section, .sidebar-history-footer { display: none; }
                    .modal-overlay { padding: 0.5rem; }
                    .modal-content { border-radius: 24px; max-height: 95vh; }
                    .modal-header { padding: 1.2rem 1.5rem; }
                    .modal-body { padding: 1rem 1rem; }
                    .manage-row { padding: 0.6rem 0.8rem; gap: 0.5rem; }
                    .manage-row.sub { margin-left: 0.8rem; }
                    .modal-footer { flex-direction: row; gap: 0.75rem; padding: 1rem 1rem; }
                    .btn-footer { flex: 1; justify-content: center; padding: 0.7rem 1rem; font-size: 0.85rem; }
                }
            `}</style>
        </aside>
    );
}
