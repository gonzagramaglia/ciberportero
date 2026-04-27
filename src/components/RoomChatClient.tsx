'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { MessageSquare, Send, Loader2, History as HistoryIcon, Image as ImageIcon, X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Hash, Paperclip, MessageCircle, Reply as ReplyIcon, Trash2, Pencil, Check, Smile, ClipboardClock, Pin, PinOff, GripVertical, ShieldCheck } from 'lucide-react';
import { addRoomMessage, deleteMessage, addGeneralMessage, updateCategory, updateSubcategory, togglePinMessage, reorderPinnedMessages } from '@/lib/salasActions';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { translations } from '@/lib/translations';
import { guestStore } from '@/lib/guestStore';

export default function RoomChatClient({ roomId: propRoomId, subcategoryId, initialMessages, isGuest, session }: any) {
    const { lang } = useLanguage();
    const [currentSubId, setCurrentSubId] = useState<string | null>(subcategoryId || 'general');
    const [roomId, setRoomId] = useState<string | null>(propRoomId || null);
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const confirmTimer = useRef<any>(null);
    const [messages, setMessages] = useState(initialMessages || []);
    const [text, setText] = useState('');
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);
    const [replyingTo, setReplyingTo] = useState<any>(null);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [targetMessageId, setTargetMessageId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [draggingPinId, setDraggingPinId] = useState<string | null>(null);

    const t = translations[lang as keyof typeof translations] || translations.es;
    const roomsT = t.rooms;

    const [room, setRoom] = useState<any>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [editingCatId, setEditingCatId] = useState<string | null>(null);
    const [editCatValue, setEditCatValue] = useState('');
    const [editingSubId, setEditingSubId] = useState<string | null>(null);
    const [editSubValue, setEditSubValue] = useState('');

    useEffect(() => {
        const getRoomData = async (targetId: string) => {
            if (isGuest) {
                setRoom(guestStore.getRoom(targetId || 'test-room'));
            } else {
                const { getRoomInfo } = await import('@/lib/salasActions');
                setRoom(await getRoomInfo(targetId));
            }
        };

        if (roomId) getRoomData(roomId);
        
        const handleRefresh = () => {
            if (roomId) {
                getRoomData(roomId);
                setRefreshTrigger(prev => prev + 1);
            }
        };
        window.addEventListener('room-data-updated', handleRefresh);
        return () => window.removeEventListener('room-data-updated', handleRefresh);
    }, [isGuest, roomId]);

    const isGeneral = !currentSubId || currentSubId === 'general';
    const isHistory = currentSubId === 'history';

    function formatMessageDate(date: Date, lang: string, short = false) {
        const connector = lang === 'es' ? ' a las ' : lang === 'pt' ? ' às ' : ' at ';
        
        if (lang !== 'es') {
            return date.toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
                weekday: 'long', day: 'numeric', month: 'long'
            }) + connector + date.toLocaleTimeString(lang === 'pt' ? 'pt-BR' : 'en-US', {
                hour: '2-digit', minute: '2-digit', hour12: false
            });
        }
        
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const dayName = days[date.getDay()];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
        
        return `${dayName} ${day} de ${month}${connector}${time}`;
    }

    useEffect(() => {
        const validateAndSetSubId = async (id: string | null) => {
            if (!id || id === 'general' || id === 'history') {
                setCurrentSubId(id || 'general');
                return;
            }

            if (room?.categories) {
                const exists = room.categories.some((c: any) => 
                    c.subcategories?.some((s: any) => 
                        s.id === id || (s.id.includes('-') && s.id.split('-').slice(1).join('-') === id)
                    )
                );
                if (!exists && !isGuest && roomId) {
                    const { getRoomInfo } = await import('@/lib/salasActions');
                    const updated = await getRoomInfo(roomId);
                    if (updated) setRoom(updated);
                }
            }

            if (isGuest) {
                const sub = guestStore.getSubcategory(id);
                if (!sub) {
                    window.location.hash = 'general';
                    setCurrentSubId('general');
                    return;
                }
            }
            setCurrentSubId(id);
        };

        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            validateAndSetSubId(hash || null);
        };

        const handleCustomChange = (e: any) => {
            if (e.detail !== undefined) validateAndSetSubId(e.detail);
        };

        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);
        window.addEventListener('subcategory-change', handleCustomChange);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
            window.removeEventListener('subcategory-change', handleCustomChange);
        };
    }, [isGuest]);

    const handleLogClick = (msg: any) => {
        const subId = msg.subcategoryId || msg.subcategory?.id || 'general';
        window.location.hash = `#${subId}`;
        window.dispatchEvent(new CustomEvent('subcategory-change', { detail: subId }));
        setCurrentSubId(subId);
        setTargetMessageId(msg.id);
    };

    useEffect(() => {
        if (targetMessageId && !loadingMessages && messages.length > 0) {
            const el = document.getElementById(targetMessageId);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('message-highlight');
                setTimeout(() => {
                    el.classList.remove('message-highlight');
                    setTargetMessageId(null);
                }, 3000);
            }
        }
    }, [messages, loadingMessages, targetMessageId]);

    useEffect(() => {
        const loadMessages = async () => {
            setLoadingMessages(true);
            try {
                if (isGuest) {
                    const roomId = window.location.pathname.split('/').pop();
                    const room = guestStore.getRoom(roomId || 'test-room');
                    if (isGeneral) {
                        setMessages([...(room?.generalMessages || [])].reverse());
                    } else if (isHistory) {
                        if (room) {
                            const allMsgs: any[] = [];
                            const processMsg = (m: any, catName: string, subName: string, subId: string) => {
                                allMsgs.push({ ...m, subcategoryId: subId, categoryName: catName, subcategoryName: subName });
                                if (m.replies && m.replies.length > 0) {
                                    m.replies.forEach((rep: any) => {
                                        allMsgs.push({ ...rep, subcategoryId: subId, categoryName: catName, subcategoryName: subName, isReply: true });
                                    });
                                }
                            };

                            room.categories.forEach((c: any) => {
                                c.subcategories.forEach((s: any) => {
                                    s.messages.forEach((m: any) => processMsg(m, c.name, s.name, s.id));
                                });
                            });
                            room.generalMessages.forEach((m: any) => processMsg(m, 'General', 'Chat General', 'general'));
                            
                            setMessages(allMsgs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
                        }
                    } else {
                        const sub = guestStore.getSubcategory(currentSubId!);
                        setMessages([...(sub?.messages || [])].reverse());
                    }
                } else {
                    const { getSubcategoryMessages, getAllRoomMessages, getGeneralMessages } = await import('@/lib/salasActions');
                    const roomId = window.location.pathname.split('/').pop();
                    if (isHistory) {
                        if (roomId) {
                            const dbMsgs = await getAllRoomMessages(roomId);
                            setMessages(dbMsgs.map((m: any) => ({
                                ...m,
                                subcategoryName: m.subcategory?.name || 'Chat General',
                                categoryName: m.subcategory?.category?.name || 'General'
                            })));
                        }
                    } else if (isGeneral) {
                        if (roomId) setMessages(await getGeneralMessages(roomId));
                    } else {
                        setMessages(await getSubcategoryMessages(currentSubId!));
                    }
                }
            } catch (err) {
                console.error("Error loading messages:", err);
            } finally {
                setLoadingMessages(false);
            }
        };
        loadMessages();
    }, [currentSubId, isGuest, isGeneral, isHistory, refreshTrigger]);

    const handleDeleteMessage = async (msgId: string, isReply = false, parentId?: string) => {
        if (confirmDeleteId !== msgId) {
            setConfirmDeleteId(msgId);
            if (confirmTimer.current) clearTimeout(confirmTimer.current);
            confirmTimer.current = setTimeout(() => setConfirmDeleteId(null), 2500);
            return;
        }

        if (confirmTimer.current) clearTimeout(confirmTimer.current);
        setConfirmDeleteId(null);
        
        try {
            if (isGuest) {
                const roomId = window.location.pathname.split('/').pop();
                guestStore.deleteMessage(isGeneral ? 'general' : currentSubId!, msgId, isReply, parentId);
                toast.success(lang === 'es' ? 'Mensaje eliminado' : 'Message deleted');
                
                if (isGeneral && roomId) {
                    const room = guestStore.getRoom(roomId);
                    setMessages([...(room?.generalMessages || [])].reverse());
                } else if (currentSubId) {
                    const sub = guestStore.getSubcategory(currentSubId);
                    setMessages([...(sub?.messages || [])].reverse());
                }
            } else {
                const res = await deleteMessage(msgId);
                if (res.error) toast.error(res.error);
                else {
                    toast.success(lang === 'es' ? 'Mensaje eliminado' : 'Message deleted');
                    const { getSubcategoryMessages, getGeneralMessages } = await import('@/lib/salasActions');
                    const roomId = window.location.pathname.split('/').pop();
                    if (isGeneral && roomId) setMessages(await getGeneralMessages(roomId));
                    else if (currentSubId) setMessages(await getSubcategoryMessages(currentSubId));
                }
            }
        } catch (err) { console.error(err); }
    };

    const renderFormattedText = (text: string) => {
        if (!text) return null;
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);
        return parts.map((part, i) => {
            if (part.match(urlRegex)) {
                return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="msg-link">{part}</a>;
            }
            const boldItalicRegex = /(\*[^*]+\*|_[^_]+_)/g;
            const subParts = part.split(boldItalicRegex);
            return subParts.map((subPart, j) => {
                if (subPart.startsWith('*') && subPart.endsWith('*')) {
                    return <strong key={`${i}-${j}`}>{subPart.slice(1, -1)}</strong>;
                }
                if (subPart.startsWith('_') && subPart.endsWith('_')) {
                    return <em key={`${i}-${j}`}>{subPart.slice(1, -1)}</em>;
                }
                return subPart;
            });
        });
    };

    const renderInlineReplyBox = (target: any) => {
        if (replyingTo?.id !== target.id) return null;
        return (
            <div className="inline-reply-box fade-in" style={{ marginTop: '0.75rem' }}>
                <div className="reply-banner">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div className="reply-indicator-dot" />
                        <span>{lang === 'es' ? 'Respondiendo a' : 'Replying to'} <strong>{target.user?.name || target.user?.id || 'Usuario'}</strong></span>
                    </div>
                    <button type="button" onClick={() => setReplyingTo(null)} className="close-reply-btn"><X size={16} /></button>
                </div>
                <div className="reply-input-area">
                    <form onSubmit={(e) => handleSend(e, true)}>
                        <textarea autoFocus value={replyText} onChange={e => setReplyText(e.target.value)} placeholder={roomsT.chat.whatAreYouThinking} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e, true); } }} />
                        <div className="reply-footer">
                                            <div style={{ display: 'flex', gap: '0.6rem' }}>
                                                <a href="https://emojis.hoy.today/" target="_blank" rel="noopener noreferrer" className="icon-btn emoji-hide-mobile" title={lang === 'es' ? 'Emojis' : 'Emojis'}>
                                                    <Smile size={18} />
                                                </a>
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="icon-btn" title={lang === 'es' ? 'Subir imagen' : 'Upload image'}>
                                    <ImageIcon size={18} />
                                </button>
                            </div>
                            <button type="submit" disabled={sending || (!replyText.trim() && selectedImages.length === 0)} className="room-btn-primary mini" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1.2rem', width: 'auto' }}>
                                {sending ? <Loader2 size={18} className="spin" /> : (
                                    <>
                                        <span>{lang === 'es' ? 'Responder' : 'Reply'}</span>
                                        <Send size={14} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const pinnedMessagesList = messages.filter((m: any) => m.isPinned).sort((a: any, b: any) => (a.pinOrder || 0) - (b.pinOrder || 0));

    const findCurrentContext = () => {
        if (!room?.categories || isGeneral || isHistory) return { cat: null, sub: null };
        for (const cat of room.categories) {
            if (!cat.subcategories) continue;
            const sub = (cat.subcategories as any[]).find((s: any) => 
                s.id === currentSubId || 
                (s.id.includes('-') && s.id.split('-').slice(1).join('-') === currentSubId) ||
                (currentSubId?.includes('-') && currentSubId.split('-').slice(1).join('-') === s.id)
            );
            if (sub) return { cat, sub };
        }
        return { cat: null, sub: null };
    };

    const context = findCurrentContext();
    const currentCat = context.cat as any;
    const currentSub = context.sub as any;
    const myMember = room?.members?.find((m: any) => m.userId === session?.user?.id || (isGuest && (m.id === 'guest-me' || m.user.name === 'Invitado')));
    const isAdmin = myMember?.role === 'admin';
    const isReallyCreator = (room?.creatorId === session?.user?.id && !!session?.user?.id) || (isGuest && room?.creatorId === 'guest' && roomId !== 'test-room');
    
    let canManage = (!!session?.user?.id && (isReallyCreator || isAdmin)) || (isGuest && isAdmin);
    if (isGuest && roomId === 'test-room') canManage = false;

    const handleMovePin = async (msgId: string, dir: 'up' | 'down') => {
        const currentIndex = pinnedMessagesList.findIndex((m: any) => m.id === msgId);
        if (currentIndex === -1) return;
        
        const newIndex = currentIndex + (dir === 'up' ? -1 : 1);
        if (newIndex < 0 || newIndex >= pinnedMessagesList.length) return;
        
        const newList = [...pinnedMessagesList];
        const [moved] = newList.splice(currentIndex, 1);
        newList.splice(newIndex, 0, moved);
        
        const orderedIds = newList.map((m: any) => m.id);
        
        if (isGuest) {
            const sid = currentSubId || 'general';
            guestStore.reorderPins(sid, orderedIds);
            setRefreshTrigger(prev => prev + 1);
        } else {
            await reorderPinnedMessages(currentSubId === 'general' ? (roomId || '') : (currentSubId || ''), orderedIds);
            setRefreshTrigger(prev => prev + 1);
        }
    };

    const handlePinMessage = async (msgId: string) => {
        if (isGuest) {
            const sid = currentSubId || 'general';
            guestStore.togglePin(sid, msgId);
            setRefreshTrigger(prev => prev + 1);
            toast.success(lang === 'es' ? 'Estado de pin actualizado' : 'Pin state updated');
        } else {
            const res = await togglePinMessage(msgId);
            if (res.error) toast.error(res.error);
            else {
                toast.success(lang === 'es' ? 'Estado de pin actualizado' : 'Pin state updated');
                setRefreshTrigger(prev => prev + 1);
            }
        }
    };

    const renderMessage = (msg: any, isPinnedView = false) => {
        const isMe = msg.userId === session?.user?.id || (isGuest && (msg.userId === 'guest-me' || msg.user.name === 'Invitado'));
        const canDelete = isMe || canManage;
        
        return (
            <div key={msg.id} id={msg.id} className={`message-item-wrapper fade-in ${msg.isPinned ? 'pinned-highlight' : ''} ${isPinnedView ? 'in-pinned-list' : ''}`}>
                <div className="message-card">
                    <div className="msg-header">
                        <img src={msg.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent((msg.user.name || 'U').replace(/\s*\([^)]*\)/g, '').trim())}`} className="msg-avatar" />
                        <div className="msg-meta">
                            <div className="msg-meta-header">
                                <span className="msg-user">{msg.user.name}{(isMe && !msg.user.name.includes('(tú)')) ? ' (tú)' : ''}</span>
                                {msg.user.role === 'admin' && <ShieldCheck size={14} className="admin-badge-icon" />}
                            </div>
                            <div className="msg-meta-info">
                                <span className="msg-date">{formatMessageDate(new Date(msg.createdAt), lang)}</span>
                                {canDelete && (
                                    <button onClick={() => handleDeleteMessage(msg.id)} className={`btn-delete-top ${confirmDeleteId === msg.id ? 'confirming' : ''}`}>
                                        {confirmDeleteId === msg.id ? (lang === 'es' ? '¿Seguro?' : 'Sure?') : <Trash2 size={14} />}
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="msg-header-actions" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <div className="pin-controls-group">
                                {isPinnedView && canManage && (
                                    <button onClick={() => handleMovePin(msg.id, 'up')} className="reorder-btn" title={lang === 'es' ? 'Subir' : 'Move up'}><ChevronUp size={16} /></button>
                                )}
                                {canManage && (
                                    <button onClick={() => handlePinMessage(msg.id)} className={`btn-pin-top ${msg.isPinned ? 'active' : ''}`} title={msg.isPinned ? 'Despinear' : 'Pinear'}>
                                        {msg.isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                                    </button>
                                )}
                                {isPinnedView && canManage && (
                                    <button onClick={() => handleMovePin(msg.id, 'down')} className="reorder-btn" title={lang === 'es' ? 'Bajar' : 'Move down'}><ChevronDown size={16} /></button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="msg-body">
                        <p className="msg-text">{renderFormattedText(msg.content)}</p>
                        {msg.images && msg.images.length > 0 && (
                            <div className="msg-images-grid">
                                {msg.images.map((img: string, i: number) => (
                                    <div key={i} className="msg-img-box"><img src={img} alt="Post" onClick={() => window.open(img, '_blank')} /></div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="msg-actions">
                        {renderInlineReplyBox(msg)}
                        {replyingTo?.id !== msg.id && (
                            <button onClick={() => setReplyingTo(msg)} className="btn-reply-trigger">
                                <ReplyIcon size={14} /> <span>{lang === 'es' ? 'Responder' : 'Reply'}</span>
                            </button>
                        )}
                    </div>

                    {msg.replies && msg.replies.length > 0 && (
                        <div className="replies-list">
                            {msg.replies.map((r: any) => {
                                const isReplyMe = r.userId === session?.user?.id || (isGuest && (r.userId === 'guest-me' || r.user.name === 'Invitado'));
                                return (
                                    <div key={r.id} className="reply-item">
                                        <div className="reply-header">
                                            <img src={r.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent((r.user.name || 'U').replace(/\s*\([^)]*\)/g, '').trim())}`} className="reply-avatar" />
                                            <div className="reply-meta">
                                                <span className="reply-user">{r.user.name}{(isReplyMe && !r.user.name.includes('(tú)')) ? ' (tú)' : ''}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                    <span className="reply-time">{formatMessageDate(new Date(r.createdAt), lang)}</span>
                                                    {isReplyMe && (
                                                        <button onClick={() => handleDeleteMessage(r.id, true, msg.id)} className={`reply-del-btn ${confirmDeleteId === r.id ? 'confirming' : ''}`}>
                                                            {confirmDeleteId === r.id ? (lang === 'es' ? '¿Seguro?' : 'Sure?') : <Trash2 size={12} />}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="reply-body">
                                            <p className="reply-text">{renderFormattedText(r.content)}</p>
                                            <button onClick={() => setReplyingTo(r)} className="reply-action-btn">
                                                <ReplyIcon size={12} /> <span>{lang === 'es' ? 'Responder' : 'Reply'}</span>
                                            </button>
                                        </div>
                                        {renderInlineReplyBox(r)}

                                        {r.replies && r.replies.length > 0 && (
                                            <div className="nested-replies-list">
                                                {r.replies.map((nr: any) => {
                                                    const isNestedReplyMe = nr.userId === session?.user?.id || (isGuest && (nr.userId === 'guest-me' || nr.user.name === 'Invitado'));
                                                    return (
                                                        <div key={nr.id} className="nested-reply-item">
                                                            <div className="reply-header">
                                                                <img src={nr.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent((nr.user.name || 'U').replace(/\s*\([^)]*\)/g, '').trim())}`} className="reply-avatar mini" />
                                                                <div className="reply-meta">
                                                                    <span className="reply-user mini">{nr.user.name}{(isNestedReplyMe && !nr.user.name.includes('(tú)')) ? ' (tú)' : ''}</span>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                                        <span className="reply-time mini">{formatMessageDate(new Date(nr.createdAt), lang)}</span>
                                                                        {isNestedReplyMe && (
                                                                            <button onClick={() => handleDeleteMessage(nr.id, true, msg.id)} className={`reply-del-btn ${confirmDeleteId === nr.id ? 'confirming' : ''}`}>
                                                                                {confirmDeleteId === nr.id ? (lang === 'es' ? '¿Seguro?' : 'Sure?') : <Trash2 size={10} />}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="reply-body">
                                                                <p className="reply-text mini">{renderFormattedText(nr.content)}</p>
                                                                <button onClick={() => setReplyingTo(nr)} className="reply-action-btn">
                                                                    <ReplyIcon size={10} /> <span>{lang === 'es' ? 'Responder' : 'Reply'}</span>
                                                                </button>
                                                            </div>
                                                            {renderInlineReplyBox(nr)}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const handleSend = async (e: React.FormEvent, isReply = false) => {
        e.preventDefault();
        const content = isReply ? replyText : text;
        if (!content.trim() && selectedImages.length === 0) return;
        setSending(true);
        try {
            const imageUrls: string[] = [];
            if (selectedImages.length > 0) {
                setUploading(true);
                for (const file of selectedImages) {
                    if (isGuest) imageUrls.push(URL.createObjectURL(file));
                    else {
                        const ext = file.name.split('.').pop();
                        const path = `room-chats/${currentSubId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
                        const { data, error } = await supabase.storage.from('images').upload(path, file);
                        if (error) throw error;
                        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(path);
                        imageUrls.push(publicUrl);
                    }
                }
            }
            if (isGuest) {
                guestStore.addMessage(isGeneral ? 'general' : currentSubId!, content, imageUrls, isReply ? replyingTo?.id : undefined);
                if (isReply) { setReplyText(''); setReplyingTo(null); } else { setText(''); }
                setSelectedImages([]);
                
                const room = guestStore.getRoom(roomId || 'test-room');
                if (isGeneral) setMessages([...(room?.generalMessages || [])].reverse());
                else {
                    const sub = guestStore.getSubcategory(currentSubId!);
                    setMessages([...(sub?.messages || [])].reverse());
                }
            } else {
                let res;
                if (isGeneral) {
                    res = await addGeneralMessage(roomId || '', content, imageUrls, isReply ? replyingTo?.id : undefined);
                } else {
                    res = await addRoomMessage(currentSubId!, content, imageUrls, isReply ? replyingTo?.id : undefined);
                }
                
                if (res.success) {
                    if (isReply) { setReplyText(''); setReplyingTo(null); } else { setText(''); }
                    setSelectedImages([]);
                    const { getSubcategoryMessages, getGeneralMessages } = await import('@/lib/salasActions');
                    if (isGeneral && roomId) setMessages(await getGeneralMessages(roomId));
                    else setMessages(await getSubcategoryMessages(currentSubId!));
                } else toast.error(res.error || 'Error');
            }
        } catch (error) { toast.error("Error al enviar"); } finally { setSending(false); setUploading(false); }
    };

    const handleUpdateSub = async (subId: string, name: string) => {
        if (!name) return;
        try {
            if (isGuest) {
                const updated = guestStore.updateSubcategory(room.id, subId, name);
                setRoom({ ...guestStore.getRoom(room.id) } as any);
                if (updated?.id && updated.id !== subId) {
                    window.location.hash = updated.id;
                    setCurrentSubId(updated.id);
                }
            } else {
                const res = await updateSubcategory(subId, name);
                if (res.success) {
                    const { getRoomInfo } = await import('@/lib/salasActions');
                    const updatedRoom = await getRoomInfo(room.id);
                    setRoom(updatedRoom);
                } else toast.error(res.error || 'Error');
            }
            setEditingSubId(null);
            toast.success(lang === 'es' ? 'Subcategoría actualizada' : 'Subcategory updated');
            window.dispatchEvent(new CustomEvent('room-data-updated'));
        } catch (error) { toast.error("Error al actualizar"); }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragover' || e.type === 'dragenter') setIsDragging(true);
        else setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files);
            const images = files.filter(f => f.type.startsWith('image/')).slice(0, 3);
            if (images.length > 0) {
                setSelectedImages(prev => [...prev, ...images].slice(0, 3));
            }
        }
    };

    return (
        <div className="room-chat-wrapper">
            <div className="chat-content-container">
                <div className="chat-top-header">
                    <div className="status-badge" style={{ background: isHistory ? 'rgba(0, 112, 243, 0.05)' : '#f8fafc', borderColor: isHistory ? 'rgba(0, 112, 243, 0.1)' : '#e2e8f0' }}>
                        {isHistory ? <HistoryIcon size={16} color="var(--accent)" /> : <MessageSquare size={16} color="var(--accent)" />}
                        
                        {isHistory ? (
                            <>
                                <span className="path-segment active">{lang === 'es' ? 'Historial' : 'History'}</span>
                                <span className="path-separator">•</span>
                                <span className="path-segment">{lang === 'es' ? 'Todos los Mensajes' : 'All Messages'}</span>
                            </>
                        ) : isGeneral ? (
                            <>
                                <span className="path-segment active">{lang === 'es' ? 'Chat General' : 'General Chat'}</span>
                                <span className="path-separator">•</span>
                                <span className="path-segment">{lang === 'es' ? 'Conversación Global' : 'Global Conversation'}</span>
                            </>
                        ) : currentSub ? (
                            <>
                                <div className="breadcrumb-item">
                                    <span className="path-segment active">
                                        {currentCat?.name || roomsT.chat.chatTitle}
                                    </span>
                                </div>
                                <span className="path-separator"><ChevronRight size={14} /></span>
                                <div className="breadcrumb-item">
                                    {editingSubId === currentSub.id ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input 
                                                autoFocus
                                                value={editSubValue}
                                                onChange={e => setEditSubValue(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleUpdateSub(currentSub.id, editSubValue)}
                                                onBlur={() => setEditingSubId(null)}
                                                className="breadcrumb-edit-input"
                                            />
                                            <Check size={14} color="#10b981" style={{ cursor: 'pointer' }} onClick={() => handleUpdateSub(currentSub.id, editSubValue)} />
                                        </div>
                                    ) : (
                                        <span className="path-segment sub">
                                            <Hash size={14} />
                                            {currentSub.name}
                                            {canManage && (
                                                <button 
                                                    className="breadcrumb-edit-btn"
                                                    onClick={() => { setEditingSubId(currentSub.id); setEditSubValue(currentSub.name); }}
                                                >
                                                    <Pencil size={12} />
                                                </button>
                                            )}
                                        </span>
                                    )}
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>

                {!isHistory && (
                    <div className="main-input-sticky">
                        <div 
                            className={`input-card ${isDragging ? 'is-dragging' : ''}`}
                            onDragOver={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={handleDrop}
                        >
                            <form onSubmit={(e) => handleSend(e, false)}>
                                <textarea 
                                    value={text} 
                                    onChange={e => setText(e.target.value)} 
                                    placeholder={isGeneral ? roomsT.chat.mainPlaceholder : roomsT.chat.whatAreYouThinking}
                                    rows={text.split('\n').length > 2 ? 4 : 1}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e, false); } }}
                                />
                                {selectedImages.length > 0 && (
                                    <div className="preview-row">
                                        {selectedImages.map((file: any, i: number) => (
                                            <div key={i} className="thumb-box">
                                                <img src={URL.createObjectURL(file)} />
                                                <button type="button" onClick={() => setSelectedImages(prev => prev.filter((_: any, idx: number) => idx !== i))} className="del-img-btn"><X size={12} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="input-footer-row">
                                    <div className="input-actions-left">
                                        <a href="https://emojis.hoy.today/" target="_blank" rel="noopener noreferrer" className="icon-btn emoji-hide-mobile" title={lang === 'es' ? 'Emojis' : 'Emojis'}>
                                            <Smile size={20} />
                                        </a>
                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="icon-btn" title={lang === 'es' ? 'Subir imagen' : 'Upload image'}>
                                            <ImageIcon size={20} />
                                            <input type="file" ref={fileInputRef} hidden accept="image/*" multiple onChange={(e) => { if (e.target.files) setSelectedImages(prev => [...prev, ...Array.from(e.target.files!)].slice(0, 3)); }} />
                                        </button>
                                    </div>
                                    <button type="submit" disabled={sending || uploading || (!text.trim() && selectedImages.length === 0)} className="room-btn-primary">
                                        {sending ? <Loader2 size={22} className="spin" /> : <><span className="hide-mobile">{roomsT.chat.post}</span><Send size={18} /></>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <a 
                    href={lang === 'en' ? 'https://hoy.today/en' : 'https://hoy.today'} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="floating-hoy-btn"
                    title="Hoy.Today"
                >
                    <ClipboardClock size={32} />
                </a>

                <div className="messages-scroller">
                    {pinnedMessagesList.length > 0 && !isHistory && (
                        <div className="pinned-section-wrapper fade-in">
                            <div className="pinned-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <Pin size={18} color="#f59e0b" fill="#f59e0b" />
                                    <span>{lang === 'es' ? 'Mensajes Destacados' : 'Pinned Messages'}</span>
                                </div>
                                <span className="pinned-badge">{pinnedMessagesList.length}</span>
                            </div>
                            <div className="pinned-full-list">
                                {pinnedMessagesList.map((msg: any) => renderMessage(msg, true))}
                            </div>
                            <div className="pinned-divider">
                                <span>{lang === 'es' ? 'Mensajes Recientes' : 'Recent Messages'}</span>
                            </div>
                        </div>
                    )}

                    {loadingMessages ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: '1rem', color: '#94a3b8' }}>
                            <Loader2 className="spin" size={60} color="var(--accent)" strokeWidth={2.5} />
                            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{lang === 'es' ? 'Cargando mensajes...' : 'Loading messages...'}</span>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="empty-view fade-in">
                            <div className="empty-icon-circle"><MessageSquare size={32} /></div>
                            <h3>{isHistory ? (lang === 'es' ? 'No hay mensajes todavía' : 'No messages yet') : roomsT.chat.emptyMessages}</h3>
                            {!isHistory && <p>{roomsT.chat.startConversation}</p>}
                        </div>
                    ) : (
                        <div className="messages-list-flow">
                            {messages.filter((m: any) => !m.isPinned).map((msg: any) => {
                                if (isHistory) {
                                    const isMe = msg.userId === session?.user?.id || (isGuest && (msg.userId === 'guest-me' || msg.user.name === 'Invitado'));
                                    return (
                                        <div key={msg.id} className="log-row-premium" onClick={() => handleLogClick(msg)}>
                                            <div className="accent-bar" />
                                            <div className="log-row-content" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.6rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', width: '100%' }}>
                                                    <img src={msg.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent((msg.user.name || 'U').replace(/\s*\([^)]*\)/g, '').trim())}`} className="log-avatar" />
                                                    <div className="log-main">
                                                        <div className="log-meta">
                                                            <span className="log-user">{msg.user.name}{(isMe && !msg.user.name.includes('(tú)')) ? ' (tú)' : ''}</span>
                                                            <span className="log-time">{formatMessageDate(new Date(msg.createdAt), lang, true)}</span>
                                                        </div>
                                                        <p className="log-text">{msg.content}</p>
                                                    </div>
                                                </div>
                                                <div className="log-tags" style={{ alignSelf: 'flex-start', marginLeft: '3rem' }}>
                                                    <span className="tag-cat">{msg.categoryName}</span>
                                                    <ChevronRight size={10} />
                                                    <span className="tag-sub">{msg.subcategoryName}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return renderMessage(msg);
                            })}
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .room-chat-wrapper { display: flex; flex-direction: column; min-height: 100vh; max-width: 850px; margin: 0 auto; position: relative; padding: 0 1rem; }
                .chat-content-container { display: flex; flex-direction: column; gap: 1.5rem; padding-bottom: 5rem; }
                .chat-top-header { margin-top: 1rem; display: flex; align-items: center; }
                
                .status-badge { display: inline-flex; align-items: center; gap: 0.6rem; padding: 0.6rem 1.4rem; border-radius: 14px; border: 1px solid #e2e8f0; font-size: 0.9rem; }
                .path-segment { font-weight: 800; color: #94a3b8; display: flex; align-items: center; gap: 0.4rem; }
                .breadcrumb-item { display: flex; align-items: center; }
                .breadcrumb-edit-btn { background: none; border: none; padding: 4px; color: #94a3b8; cursor: pointer; border-radius: 4px; transition: all 0.2s; margin-left: 4px; display: inline-flex; align-items: center; vertical-align: middle; }
                .breadcrumb-edit-btn:hover { color: var(--accent); background: rgba(0, 112, 243, 0.05); }
                .breadcrumb-edit-input { background: white; border: 1px solid #e2e8f0; border-radius: 6px; padding: 2px 8px; font-size: 0.9rem; color: #1e293b; font-weight: 600; width: 150px; outline: none; }
                .breadcrumb-edit-input:focus { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(0, 112, 243, 0.1); }
                .path-segment.active { color: var(--accent); }
                .path-segment.sub { color: #1e293b; }
                .path-separator { opacity: 0.3; margin: 0 0.2rem; color: #94a3b8; }
                
                .main-input-sticky { position: sticky; top: 1rem; z-index: 50; }
                .input-card { background: #fff; border: 2px solid #f1f5f9; border-radius: 24px; padding: 1rem; box-shadow: 0 10px 40px rgba(0,0,0,0.06); transition: all 0.2s; }
                .input-card.is-dragging { border-color: var(--accent); background: rgba(0, 112, 243, 0.02); transform: scale(1.02); }
                textarea { width: 100%; border: none; background: none; outline: none; resize: none; font-size: 1.1rem; color: #1e293b; padding: 0.5rem; min-height: 40px; }
                .input-footer-row { display: flex; align-items: center; justify-content: space-between; margin-top: 0.5rem; border-top: 1px solid #f8fafc; padding-top: 0.5rem; }
                .input-actions-left { display: flex; align-items: center; gap: 0.8rem; }
                
                .preview-row { display: flex; gap: 1.2rem; margin-top: 1rem; padding: 0.2rem; flex-wrap: wrap; }
                .thumb-box { position: relative; width: 80px; height: 80px; border-radius: 18px; border: 2px solid #f1f5f9; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 15px rgba(0,0,0,0.05); background: #fff; }
                .thumb-box:hover { transform: translateY(-4px) scale(1.02); border-color: var(--accent); box-shadow: 0 10px 25px rgba(0, 112, 243, 0.15); }
                .thumb-box img { width: 100%; height: 100%; object-fit: cover; border-radius: 16px; }
                .del-img-btn { position: absolute; top: -10px; right: -10px; background: #fff; color: #ef4444; border: 1px solid #fee2e2; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25); transition: all 0.2s ease; z-index: 10; }
                .del-img-btn:hover { background: #ef4444; color: #fff; transform: scale(1.1) rotate(90deg); border-color: #ef4444; }
                
                .icon-btn { background: #f8fafc; border: none; color: #94a3b8; padding: 0.6rem; border-radius: 12px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; text-decoration: none; }
                .icon-btn:hover { color: var(--accent); background: #f1f5f9; transform: scale(1.05); }

                .floating-hoy-btn {
                    position: fixed;
                    bottom: 4rem;
                    right: 4.5rem;
                    width: 64px;
                    height: 64px;
                    background: #fff;
                    color: #0f172a;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    z-index: 9999;
                    border: 2px solid #e2e8f0;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    text-decoration: none;
                }
                .floating-hoy-btn:hover { 
                    background: #facc15 !important; 
                    color: #000 !important; 
                    transform: scale(1.1) rotate(10deg); 
                    border-color: #facc15 !important; 
                    box-shadow: 0 15px 40px rgba(250, 204, 21, 0.4) !important; 
                }
                @media (max-width: 768px) { .floating-hoy-btn { display: none; } }
                
                .room-btn-primary { 
                    background: linear-gradient(135deg, #0070f3 0%, #00a2ff 100%); 
                    color: #fff; border: none; padding: 0 1.8rem; height: 46px; border-radius: 14px; font-weight: 800; display: flex; align-items: center; gap: 0.6rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 15px rgba(0, 112, 243, 0.3);
                }
                .room-btn-primary.mini { height: 38px; padding: 0 1.2rem; }
                .room-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0, 112, 243, 0.4); }
                .room-btn-primary:disabled { background: #f1f5f9; color: #cbd5e1; cursor: not-allowed; box-shadow: none; }
                
                .messages-scroller { display: flex; flex-direction: column; gap: 1.5rem; }
                .message-item-wrapper { width: 100%; transition: all 0.3s; }
                .message-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 24px; padding: 1.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
                .msg-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
                .msg-avatar { width: 44px; height: 44px; border-radius: 14px; border: 2px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
                .msg-meta { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; }
                .msg-meta-header { display: flex; align-items: center; gap: 0.6rem; }
                .msg-meta-info { display: flex; align-items: center; gap: 0.8rem; }
                .msg-user { font-weight: 900; color: #1e293b; font-size: 1.05rem; }
                .msg-date { font-size: 0.8rem; color: #94a3b8; font-weight: 700; }
                .msg-link { color: var(--accent); text-decoration: none; font-weight: 700; word-break: break-all; }
                .msg-link:hover { text-decoration: underline; }
                .msg-text { font-size: 1.1rem; line-height: 1.6; color: #334155; margin: 0; font-weight: 500; }
                .msg-img-box { margin-top: 1rem; border-radius: 16px; overflow: hidden; border: 1px solid #f1f5f9; }
                .msg-img-box img { width: 100%; max-width: 100%; height: auto; display: block; cursor: pointer; transition: transform 0.2s; }
                .msg-img-box img:hover { transform: scale(1.01); }
                
                .msg-actions { margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid #f8fafc; }
                .btn-reply-trigger { background: #f8fafc; border: 1px solid #f1f5f9; padding: 0.5rem 1rem; border-radius: 10px; font-size: 0.85rem; font-weight: 800; color: #64748b; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; }
                .btn-reply-trigger:hover { color: var(--accent); background: rgba(0, 112, 243, 0.05); border-color: rgba(0, 112, 243, 0.1); }

                .empty-view { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 6rem 2rem; text-align: center; background: #fff; border: 2px dashed #f1f5f9; border-radius: 32px; }
                .empty-icon-circle { width: 80px; height: 80px; background: rgba(0, 112, 243, 0.05); color: var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; }
                .empty-view h3 { margin: 0 0 0.5rem 0; font-size: 1.5rem; font-weight: 900; color: #1e293b; }
                .empty-view p { margin: 0; color: #94a3b8; font-weight: 600; font-size: 1.1rem; max-width: 300px; line-height: 1.5; }
                
                .log-row-premium { display: flex; align-items: center; gap: 1.2rem; padding: 0.8rem 1.2rem; background: #fff; border-radius: 18px; border: 1px solid #f1f5f9; cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden; margin-bottom: 0.5rem; }
                .log-row-premium:hover { border-color: var(--accent); transform: translateX(8px); }
                .accent-bar { position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--accent); opacity: 0; }
                .log-row-premium:hover .accent-bar { opacity: 1; }
                .log-avatar { width: 36px; height: 36px; border-radius: 12px; }
                .log-main { flex: 1; min-width: 0; }
                .log-user { font-weight: 900; font-size: 0.9rem; color: #1e293b; }
                .log-time { font-size: 0.75rem; color: #94a3b8; margin-left: 0.6rem; font-weight: 700; }
                .log-text { margin: 0.1rem 0 0 0; font-size: 0.95rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500; }
                .log-row-content { display: flex; align-items: center; justify-content: space-between; gap: 1rem; width: 100%; }
                .log-tags { display: flex; align-items: center; gap: 0.4rem; font-size: 0.65rem; font-weight: 900; background: #f8fafc; padding: 0.4rem 0.8rem; border-radius: 10px; color: #94a3b8; border: 1px solid #f1f5f9; text-transform: uppercase; letter-spacing: 0.02em; flex-shrink: 0; }
                
                .reply-item { background: #fcfdfe; padding: 1.25rem; border-radius: 20px; border: 1px solid #f8fafc; display: flex; flex-direction: column; gap: 0.8rem; }
                .reply-header { display: flex; align-items: center; gap: 0.8rem; }
                .reply-avatar { width: 32px; height: 32px; border-radius: 10px; }
                .reply-meta { flex: 1; display: flex; align-items: center; gap: 0.6rem; }
                .reply-user { font-weight: 900; font-size: 0.85rem; color: #1e293b; }
                .reply-time { font-size: 0.75rem; color: #94a3b8; font-weight: 700; }
                .reply-body { margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.4rem; }
                .reply-text { font-size: 1rem; margin: 0; color: #475569; line-height: 1.5; font-weight: 500; }
                .reply-action-btn { display: flex; align-items: center; gap: 0.4rem; background: none; border: none; color: #94a3b8; font-size: 0.75rem; font-weight: 800; cursor: pointer; width: fit-content; padding: 0.2rem 0; transition: all 0.2s; }
                .reply-action-btn:hover { color: var(--accent); }
                .reply-del-btn { background: #f8fafc; border: 1px solid #f1f5f9; padding: 0.4rem 0.6rem; color: #64748b; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; transition: all 0.2s; border-radius: 8px; font-size: 0.75rem; font-weight: 800; }
                .reply-del-btn:hover { color: #ef4444; background: #fff1f2; border-color: #fee2e2; }
                .reply-del-btn.confirming { color: #ef4444; font-weight: 800; background: #fff1f2; padding: 0.3rem 0.6rem; border: 1px solid #fee2e2; }

                .nested-replies-list { margin-top: 0.75rem; margin-left: 1.5rem; border-left: 2px solid #f1f5f9; padding-left: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
                .nested-reply-item { background: #fcfdfe; border: 1px solid #f8fafc; padding: 0.6rem; border-radius: 12px; }
                .reply-avatar.mini { width: 24px; height: 24px; }
                .reply-user.mini { font-size: 0.8rem; }
                .reply-time.mini { font-size: 0.7rem; }
                .reply-text.mini { font-size: 0.9rem; }

                .inline-reply-box { margin-top: 1rem; border: 2px solid #f1f5f9; border-radius: 20px; overflow: hidden; background: #fcfdfe; box-shadow: 0 4px 15px rgba(0,0,0,0.03); transition: all 0.2s; }
                
                .pinned-header { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 0.75rem; padding-left: 0.5rem; }
                .pinned-section-wrapper { margin-bottom: 1.5rem; }
                .pinned-full-list { display: flex; flex-direction: column; gap: 1.5rem; margin-top: 1rem; }
                .pinned-divider { display: flex; align-items: center; gap: 1.5rem; margin: 2rem 0 1rem 0; }
                .pinned-divider::before, .pinned-divider::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }
                .pinned-divider span { font-size: 0.8rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; }
                
                .message-card.pinned-highlight { border: 2px solid #fde68a; background: #fffbeb; box-shadow: 0 10px 30px rgba(245, 158, 11, 0.08); }
                .message-card.in-pinned-list { border-left: 6px solid #f59e0b; }
                
                .btn-pin-top, .btn-delete-top { background: #f8fafc; border: 1px solid #f1f5f9; color: #94a3b8; padding: 0.5rem; border-radius: 10px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
                .btn-pin-top:hover, .btn-pin-top.active { color: #f59e0b; background: #fffbeb; border-color: #fde68a; }
                .btn-delete-top:hover { color: #ef4444; background: #fff1f2; border-color: #fee2e2; }
                .btn-delete-top.confirming { color: #ef4444; font-weight: 800; background: #fff1f2; padding: 0.3rem 0.6rem; border: 1px solid #fee2e2; }

                .reorder-btn { background: #f8fafc; border: 1px solid #f1f5f9; color: #94a3b8; padding: 0.4rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .reorder-btn:hover { color: var(--accent); background: #f1f5f9; border-color: #e2e8f0; }
                .pin-controls-group { display: flex; align-items: center; gap: 0.4rem; }

                .message-highlight { animation: flash 2s ease-out; }
                @keyframes flash {
                    0% { background-color: rgba(250, 204, 21, 0.3); }
                    100% { background-color: transparent; }
                }

                .btn-reply-trigger.pinned { color: var(--accent); font-weight: 800; }
                .reply-banner { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1.2rem; background: #f8fafc; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; color: #64748b; }
                .reply-indicator-dot { width: 8px; height: 8px; background: var(--accent); border-radius: 50%; }
                .close-reply-btn { background: #fff; border: 1px solid #e2e8f0; color: #64748b; padding: 0.3rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .close-reply-btn:hover { background: #fee2e2; color: #ef4444; border-color: #fecaca; transform: scale(1.1); }
                .reply-input-area { padding: 0.5rem; }
                .reply-input-area textarea { min-height: 80px; padding: 0.75rem; font-size: 1.05rem; }
                .reply-footer { display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 1rem; border-top: 1px solid #f8fafc; }

                .spin { animation: spin 1.1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                @media (max-width: 768px) {
                    .pin-controls-group { flex-direction: column; gap: 0.2rem !important; }
                    .emoji-hide-mobile { display: none; }
                    .msg-meta-info { flex-direction: row-reverse; justify-content: flex-end; }
                    
                    .main-input-sticky { position: static; margin-bottom: 1rem; }
                    .log-row-content { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
                    .log-tags { align-self: flex-start; }
                    .hide-mobile { display: none; }
                    textarea { min-height: 140px; }
                    .reply-input-area textarea { min-height: 100px; }
                    .input-card { padding: 0.75rem; }
                }
            `}</style>
        </div>
    );
}
