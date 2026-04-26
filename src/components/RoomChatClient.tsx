'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Hash, Send, Image as ImageIcon, X, Loader2, MessageSquare, Reply as ReplyIcon, Trash2, History as HistoryIcon } from 'lucide-react';
import { addRoomMessage, deleteMessage } from '@/lib/salasActions';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { translations } from '@/lib/translations';
import { guestStore } from '@/lib/guestStore';

export default function RoomChatClient({ subcategoryId, initialMessages, isGuest }: any) {
    const { lang } = useLanguage();
    const [currentSubId, setCurrentSubId] = useState<string | null>(subcategoryId || null);
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const confirmTimer = useRef<any>(null);
    const [messages, setMessages] = useState(initialMessages || []);
    const [text, setText] = useState('');
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);
    const [replyingTo, setReplyingTo] = useState<any>(null);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const t = translations[lang as keyof typeof translations] || translations.es;
    const roomsT = t.rooms;

    const isGeneral = !currentSubId || currentSubId === 'general';
    const isHistory = currentSubId === 'history';

    function formatMessageDate(date: Date, lang: string, short = false) {
        if (lang !== 'es') {
            return date.toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US', {
                weekday: short ? undefined : 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true
            });
        }
        if (short) {
            return `${date.getDate()}/${date.getMonth() + 1} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
        const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return `El ${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]} a las ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getHours() >= 12 ? 'p. m.' : 'a. m.'}`;
    }

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            if (hash) setCurrentSubId(hash);
        };
        const handleCustomChange = (e: any) => {
            if (e.detail) setCurrentSubId(e.detail);
        };
        window.addEventListener('hashchange', handleHashChange);
        window.addEventListener('subcategory-change', handleCustomChange);
        handleHashChange();
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
            window.removeEventListener('subcategory-change', handleCustomChange);
        };
    }, []);

    const handleLogClick = (msg: any) => {
        const subId = msg.subcategoryId || msg.subcategory?.id;
        if (!subId) return;
        window.location.hash = `#${subId}`;
        window.dispatchEvent(new CustomEvent('subcategory-change', { detail: subId }));
        setCurrentSubId(subId);
        setTimeout(() => {
            const el = document.getElementById(msg.id);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('message-highlight');
                setTimeout(() => el.classList.remove('message-highlight'), 3000);
            }
        }, 500);
    };

    useEffect(() => {
        if (!currentSubId && subcategoryId) {
            setCurrentSubId(subcategoryId);
            return;
        }
        const loadMessages = async () => {
            setLoadingMessages(true);
            try {
                if (isGuest) {
                    const data = guestStore.getData();
                    const room = data.rooms.find(r => r.id === 'test-room');
                    if (isGeneral) {
                        setMessages(room?.generalMessages || []);
                    } else if (isHistory) {
                        if (room) {
                            const catMsgs = room.categories.flatMap(c => 
                                c.subcategories.flatMap(s => 
                                    s.messages.map(m => ({ ...m, categoryName: c.name, subcategoryName: s.name }))
                                )
                            );
                            const genMsgs = room.generalMessages.map(m => ({ ...m, categoryName: 'General', subcategoryName: 'Chat General' }));
                            const allMsgs = [...catMsgs, ...genMsgs];
                            setMessages(allMsgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
                        }
                    } else {
                        const sub = guestStore.getSubcategory(currentSubId!);
                        setMessages([...(sub?.messages || [])].reverse());
                    }
                } else {
                    const { getSubcategoryMessages, getAllRoomMessages, getGeneralMessages } = await import('@/lib/salasActions');
                    const roomId = window.location.pathname.split('/').pop();
                    if (isHistory) {
                        if (roomId) setMessages(await getAllRoomMessages(roomId));
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
    }, [currentSubId, isGuest, isGeneral, isHistory, subcategoryId]);

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
                
                // Refresh local state
                if (isGeneral && roomId) {
                    const room = guestStore.getRoom(roomId);
                    setMessages([...(room?.generalMessages || [])].reverse());
                } else if (currentSubId) {
                    const sub = guestStore.getSubcategory(currentSubId);
                    setMessages([...(sub?.messages || [])].reverse());
                }
            } else {
                const res = await deleteMessage(msgId);
                if (res.error) {
                    toast.error(res.error);
                } else {
                    toast.success(lang === 'es' ? 'Mensaje eliminado' : 'Message deleted');
                    const { getSubcategoryMessages, getGeneralMessages } = await import('@/lib/salasActions');
                    const roomId = window.location.pathname.split('/').pop();
                    if (isGeneral && roomId) {
                        setMessages(await getGeneralMessages(roomId));
                    } else if (currentSubId) {
                        setMessages(await getSubcategoryMessages(currentSubId));
                    }
                }
            }
        } catch (err) {
            console.error(err);
        }
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
                const msg = guestStore.addMessage(currentSubId!, content, imageUrls, isReply ? replyingTo?.id : undefined);
                if (msg) {
                    if (isReply) { setReplyText(''); setReplyingTo(null); } else { setText(''); }
                    setSelectedImages([]);
                    if (isGeneral) {
                        const room = guestStore.getRoom('test-room');
                        setMessages(room?.generalMessages || []);
                    } else {
                        const sub = guestStore.getSubcategory(currentSubId!);
                        setMessages(sub?.messages || []);
                    }
                }
            } else {
                const res = await addRoomMessage(currentSubId!, content, imageUrls, isReply ? replyingTo?.id : undefined);
                if (res.success) {
                    if (isReply) { setReplyText(''); setReplyingTo(null); } else { setText(''); }
                    setSelectedImages([]);
                    const { getSubcategoryMessages, getGeneralMessages } = await import('@/lib/salasActions');
                    const roomId = window.location.pathname.split('/').pop();
                    if (isGeneral && roomId) {
                        setMessages(await getGeneralMessages(roomId));
                    } else {
                        setMessages(await getSubcategoryMessages(currentSubId!));
                    }
                } else toast.error(res.error || 'Error');
            }
        } catch (error) { toast.error("Error al enviar"); } finally { setSending(false); setUploading(false); }
    };

    return (
        <div className="room-chat-wrapper">
            <div className="chat-content-container">
                <div className="chat-top-header">
                        <div className="status-badge" style={{ background: isHistory ? 'rgba(0, 112, 243, 0.05)' : '#f8fafc', borderColor: isHistory ? 'rgba(0, 112, 243, 0.1)' : '#e2e8f0' }}>
                            {isHistory ? <HistoryIcon size={16} color="var(--accent)" /> : <MessageSquare size={16} color="var(--accent)" />}
                                {isHistory ? (
                                    <>
                                        <span style={{ color: 'var(--accent)', marginRight: '0.4rem', fontWeight: '900' }}>{lang === 'es' ? 'Historial' : 'History'}</span>
                                        <span style={{ opacity: 0.3, marginRight: '0.4rem' }}>•</span>
                                        <span style={{ color: '#64748b', fontWeight: '900' }}>{lang === 'es' ? 'Todos los Mensajes' : 'All Messages'}</span>
                                    </>
                                ) : isGeneral ? (
                                    <>
                                        <span style={{ color: 'var(--accent)', marginRight: '0.4rem', fontWeight: '900' }}>{lang === 'es' ? 'Chat General' : 'General Chat'}</span>
                                        <span style={{ opacity: 0.3, marginRight: '0.4rem' }}>•</span>
                                        <span style={{ color: '#64748b', fontWeight: '900' }}>{lang === 'es' ? 'Conversación Global' : 'Global Conversation'}</span>
                                    </>
                                ) : (
                                    <>
                                        <span style={{ color: 'var(--accent)', marginRight: '0.4rem', fontWeight: '900' }}>
                                            {isGuest ? (guestStore.getCategoryBySubId(currentSubId!)?.name || (roomsT.chat.chatTitle)) : (roomsT.chat.chatTitle)}
                                        </span>
                                        <span style={{ opacity: 0.3, marginRight: '0.4rem' }}>•</span>
                                        <span style={{ color: '#64748b', fontWeight: '900' }}>{isGuest ? guestStore.getSubcategory(currentSubId!)?.name : roomsT.chat.messages}</span>
                                    </>
                        )}
                    </div>
                </div>

                {!isHistory && (
                    <div className="main-input-sticky">
                        <div className="input-card">
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
                                        {selectedImages.map((file, i) => (
                                            <div key={i} className="thumb-box">
                                                <img src={URL.createObjectURL(file)} />
                                                <button type="button" onClick={() => setSelectedImages(prev => prev.filter((_, idx) => idx !== i))} className="del-img-btn"><X size={12} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="input-footer-row">
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="icon-btn"><ImageIcon size={22} /><input type="file" ref={fileInputRef} hidden accept="image/*" multiple onChange={(e) => { if (e.target.files) setSelectedImages(prev => [...prev, ...Array.from(e.target.files!)].slice(0, 3)); }} /></button>
                                    <button type="submit" disabled={sending || uploading || (!text.trim() && selectedImages.length === 0)} className="room-btn-primary">
                                        {sending ? <Loader2 size={22} className="spin" /> : <><span className="hide-mobile">{roomsT.chat.post}</span><Send size={18} /></>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="messages-scroller">
                    {loadingMessages ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: '1rem', color: '#94a3b8' }}>
                        <Loader2 className="spin" size={60} color="var(--accent)" strokeWidth={2.5} />
                        <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{lang === 'es' ? 'Cargando mensajes...' : 'Loading messages...'}</span>
                    </div>
                ) : messages.length === 0 ? (
                        <div className="empty-view fade-in">
                            <div className="empty-icon-circle">
                                <MessageSquare size={42} />
                            </div>
                            <h3>{roomsT.chat.emptyMessages}</h3>
                            <p>{lang === 'es' ? 'Sé el primero en iniciar la conversación en este chat.' : 'Be the first to start the conversation in this chat.'}</p>
                        </div>
                    ) : (
                        messages.map((msg: any) => {
                            if (isHistory) {
                                return (
                                    <div key={msg.id} className="log-row-premium" onClick={() => handleLogClick(msg)}>
                                        <div className="accent-bar" />
                                        <img src={msg.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent((msg.user.name || 'U').replace(/\s*\([^)]*\)/g, '').trim())}`} className="log-avatar" />
                                        <div className="log-main">
                                            <div className="log-meta">
                                                <span className="log-user">{msg.user.name}</span>
                                                <span className="log-time">{formatMessageDate(new Date(msg.createdAt), lang, true)}</span>
                                            </div>
                                            <p className="log-text">{msg.content}</p>
                                        </div>
                                        <div className="log-tags hide-mobile-tags">
                                            <span className="tag-sub">{msg.subcategoryName}</span>
                                        </div>
                                    </div>
                                );
                            }

                            const isMyMsg = msg.user.name.includes('(tú)') || msg.user.name === 'Invitado';
                            return (
                                <div key={msg.id} className="message-item-wrapper" id={msg.id}>
                                    <div className="message-card">
                                        <div className="msg-header">
                                            <img src={msg.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent((msg.user.name || 'U').replace(/\s*\([^)]*\)/g, '').trim())}`} className="msg-avatar" />
                                            <div className="msg-meta">
                                                <span className="msg-user">{msg.user.name}{isMyMsg && !msg.user.name.includes('(tú)') ? ' (tú)' : ''}</span>
                                                <span className="msg-date">{formatMessageDate(new Date(msg.createdAt), lang)}</span>
                                            </div>
                                        </div>
                                        <div className="msg-body">
                                            <p className="msg-text">{msg.content}</p>
                                            {msg.images && (msg.images as string[]).map((img, i) => (
                                                <div key={i} className="msg-img-box"><img src={img} onClick={() => window.open(img, '_blank')} /></div>
                                            ))}
                                        </div>
                                        <div className="msg-actions">
                                            {replyingTo?.id === msg.id ? (
                                                <div className="inline-reply-box">
                                                    <div className="reply-banner">
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                            <div className="reply-indicator-dot" />
                                                            <span>{lang === 'es' ? 'Respondiendo a' : 'Replying to'} <strong>{msg.user.name}</strong></span>
                                                        </div>
                                                        <button type="button" onClick={() => setReplyingTo(null)} className="close-reply-btn" title={lang === 'es' ? 'Cancelar respuesta' : 'Cancel reply'}>
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                    <div className="reply-input-area">
                                                        <form onSubmit={(e) => handleSend(e, true)}>
                                                            <textarea autoFocus value={replyText} onChange={e => setReplyText(e.target.value)} placeholder={roomsT.chat.whatAreYouThinking} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e, true); } }} />
                                                            <div className="reply-footer">
                                                                <button type="button" onClick={() => fileInputRef.current?.click()} className="icon-btn"><ImageIcon size={20} /></button>
                                                                <button type="submit" disabled={sending || uploading || (!replyText.trim() && selectedImages.length === 0)} className="room-btn-primary mini">
                                                                    {sending ? <Loader2 size={20} className="spin" /> : <><span style={{ marginRight: '0.4rem' }}>{lang === 'es' ? 'Responder' : 'Reply'}</span><Send size={16} /></>}
                                                                </button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="action-row">
                                                    <button onClick={() => setReplyingTo(msg)} className="btn-reply-trigger"><ReplyIcon size={14} /> <span>{lang === 'es' ? 'Responder' : 'Reply'}</span></button>
                                                    {isMyMsg && (
                                                        <button 
                                                            onClick={() => handleDeleteMessage(msg.id)} 
                                                            className={`btn-delete-trigger ${confirmDeleteId === msg.id ? 'confirming' : ''}`}
                                                        >
                                                            <Trash2 size={14} /> 
                                                            <span>{confirmDeleteId === msg.id ? (lang === 'es' ? '¿Estás seguro?' : 'Are you sure?') : (lang === 'es' ? 'Eliminar' : 'Delete')}</span>
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {msg.replies && msg.replies.length > 0 && (
                                            <div className="replies-list">
                                                {msg.replies.map((r: any) => (
                                                    <div key={r.id} className="reply-item">
                                                        <img src={r.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent((r.user.name || 'U').replace(/\s*\([^)]*\)/g, '').trim())}`} className="reply-avatar" />
                                                        <div className="reply-main">
                                                            <div className="reply-meta">
                                                                <span className="reply-user">{r.user.name}</span>
                                                                <span className="reply-time">{formatMessageDate(new Date(r.createdAt), lang)}</span>
                                                                {(r.user.name.includes('(tú)') || r.user.name === 'Invitado') && (
                                                                    <button 
                                                                        onClick={() => handleDeleteMessage(r.id, true, msg.id)} 
                                                                        style={{ 
                                                                            background: 'none', 
                                                                            border: 'none', 
                                                                            padding: 0, 
                                                                            marginLeft: '0.8rem', 
                                                                            color: confirmDeleteId === r.id ? '#ef4444' : '#cbd5e1', 
                                                                            cursor: 'pointer', 
                                                                            display: 'inline-flex', 
                                                                            alignItems: 'center',
                                                                            fontWeight: confirmDeleteId === r.id ? '800' : '400',
                                                                            fontSize: confirmDeleteId === r.id ? '0.75rem' : 'inherit'
                                                                        }} 
                                                                        title={lang === 'es' ? 'Eliminar' : 'Delete'}
                                                                    >
                                                                        {confirmDeleteId === r.id ? (lang === 'es' ? '¿Seguro?' : 'Sure?') : <Trash2 size={12} />}
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <p className="reply-text">{r.content}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <style jsx global>{`
                .room-chat-wrapper { display: flex; flex-direction: column; min-height: 100vh; max-width: 850px; margin: 0 auto; position: relative; padding: 0 1rem; }
                .chat-content-container { display: flex; flex-direction: column; gap: 1.5rem; padding-bottom: 5rem; }
                .chat-top-header { margin-top: 1rem; display: flex; justify-content: space-between; align-items: center; }
                .status-badge { display: inline-flex; align-items: center; gap: 0.6rem; padding: 0.5rem 1.2rem; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 0.9rem; }
                
                .main-input-sticky { position: sticky; top: 1rem; z-index: 50; }
                .input-card { background: #fff; border: 2px solid #f1f5f9; border-radius: 24px; padding: 1rem; box-shadow: 0 10px 40px rgba(0,0,0,0.06); }
                textarea { width: 100%; border: none; background: none; outline: none; resize: none; font-size: 1.1rem; color: #1e293b; padding: 0.5rem; min-height: 40px; }
                .input-footer-row { display: flex; align-items: center; justify-content: space-between; margin-top: 0.5rem; border-top: 1px solid #f8fafc; padding-top: 0.5rem; }
                
                .icon-btn { background: #f8fafc; border: none; color: #94a3b8; padding: 0.6rem; border-radius: 12px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
                .icon-btn:hover { color: var(--accent); background: #f1f5f9; transform: scale(1.05); }
                
                .room-btn-primary { 
                    background: linear-gradient(135deg, #0070f3 0%, #00a2ff 100%); 
                    color: #fff; 
                    border: none; 
                    padding: 0 1.8rem; 
                    height: 46px; 
                    border-radius: 14px; 
                    font-weight: 800; 
                    display: flex; 
                    align-items: center; 
                    gap: 0.6rem; 
                    cursor: pointer; 
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
                    box-shadow: 0 4px 15px rgba(0, 112, 243, 0.3);
                    font-size: 0.95rem;
                }
                .room-btn-primary.mini { height: 42px; padding: 0 1.6rem; font-size: 0.9rem; border-radius: 12px; }
                .room-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0, 112, 243, 0.4); filter: brightness(1.05); }
                .room-btn-primary:disabled { background: #f1f5f9; color: #cbd5e1; cursor: not-allowed; box-shadow: none; border: 1px solid #e2e8f0; }
                
                .messages-scroller { display: flex; flex-direction: column; gap: 1.5rem; flex: 1; }
                .empty-view { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 6rem 2rem; text-align: center; color: #94a3b8; }
                .empty-icon-circle { width: 100px; height: 100px; background: #fff; border: 2px dashed #e2e8f0; border-radius: 40px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; color: #cbd5e1; }
                .empty-view h3 { font-size: 1.4rem; font-weight: 900; color: #1e293b; margin: 0 0 0.5rem 0; letter-spacing: -0.02em; }
                .empty-view p { font-size: 1rem; font-weight: 500; color: #94a3b8; margin: 0; }
                
                .message-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 24px; padding: 1.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
                .msg-header { display: flex; align-items: center; gap: 1.2rem; margin-bottom: 1.2rem; }
                .msg-avatar { width: 48px; height: 48px; border-radius: 16px; object-fit: cover; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .msg-user { font-weight: 900; font-size: 1.1rem; color: #1e293b; letter-spacing: -0.01em; }
                .msg-date { font-size: 0.8rem; color: #94a3b8; font-weight: 700; display: block; margin-top: 0.1rem; }
                .msg-text { font-size: 1.15rem; line-height: 1.6; color: #334155; margin: 0; font-weight: 500; }
                .msg-img-box { margin-top: 1.2rem; border-radius: 20px; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                .msg-img-box img { width: 100%; cursor: zoom-in; transition: transform 0.3s; }
                .msg-img-box img:hover { transform: scale(1.02); }
                
                .msg-actions { margin-top: 1.2rem; }
                .action-row { display: flex; gap: 0.8rem; }
                .btn-reply-trigger { background: #f8fafc; border: none; padding: 0.6rem 1.2rem; border-radius: 12px; font-weight: 900; color: #64748b; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; border: 1px solid #f1f5f9; }
                .btn-reply-trigger:hover { background: #fff; color: var(--accent); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 112, 243, 0.08); border-color: var(--accent); }
                .btn-delete-trigger { background: #f8fafc; border: none; padding: 0.6rem 1.2rem; border-radius: 12px; font-weight: 900; color: #94a3b8; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; border: 1px solid #f1f5f9; }
                .btn-delete-trigger:hover { background: #fff; color: #ef4444; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.08); border-color: #fecaca; }
                
                .inline-reply-box { border: 2px solid var(--accent); border-radius: 24px; overflow: hidden; margin-top: 1.5rem; box-shadow: 0 20px 50px rgba(0, 112, 243, 0.12); background: #fff; }
                .reply-banner { background: #fcfdfe; padding: 1rem 1.5rem; display: flex; align-items: center; justify-content: space-between; font-size: 0.9rem; border-bottom: 1px solid #f1f5f9; }
                .reply-indicator-dot { width: 10px; height: 10px; background: var(--accent); border-radius: 50%; box-shadow: 0 0 0 4px rgba(0, 112, 243, 0.1); }
                .close-reply-btn { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #94a3b8; cursor: pointer; transition: all 0.2s; }
                .close-reply-btn:hover { background: #fee2e2; color: #ef4444; transform: rotate(90deg); }
                
                .reply-input-area { padding: 0.8rem; background: #fff; }
                .reply-footer { display: flex; align-items: center; justify-content: space-between; padding: 0.8rem; border-top: 1px solid #f8fafc; }

                .replies-list { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #f8fafc; display: flex; flex-direction: column; gap: 1rem; }
                .reply-item { display: flex; gap: 1rem; background: #fcfdfe; padding: 1.2rem; border-radius: 20px; border: 1px solid #f8fafc; }
                .reply-avatar { width: 32px; height: 32px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
                .reply-user { font-weight: 900; font-size: 0.9rem; color: #1e293b; }
                .reply-time { font-size: 0.75rem; color: #94a3b8; margin-left: 0.6rem; font-weight: 600; }
                .reply-text { font-size: 1rem; margin: 0.3rem 0 0 0; color: #475569; font-weight: 500; line-height: 1.5; }

                .log-row-premium { display: flex; align-items: center; gap: 1.2rem; padding: 0.8rem 1.2rem; background: #fff; border-radius: 18px; border: 1px solid #f1f5f9; cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden; margin-bottom: 0.5rem; }
                .log-row-premium:hover { border-color: var(--accent); transform: translateX(8px); box-shadow: 0 8px 25px rgba(0, 112, 243, 0.08); }
                .accent-bar { position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--accent); opacity: 0; transition: opacity 0.2s; }
                .log-row-premium:hover .accent-bar { opacity: 1; }
                .log-avatar { width: 36px; height: 36px; border-radius: 12px; }
                .log-main { flex: 1; min-width: 0; }
                .log-user { font-weight: 900; font-size: 0.9rem; color: #1e293b; }
                .log-time { font-size: 0.75rem; color: #94a3b8; margin-left: 0.6rem; font-weight: 700; }
                .log-text { margin: 0.1rem 0 0 0; font-size: 0.95rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500; }
                .log-tags { display: flex; align-items: center; gap: 0.4rem; font-size: 0.65rem; font-weight: 900; background: #f8fafc; padding: 0.4rem 0.8rem; border-radius: 10px; color: #94a3b8; border: 1px solid #f1f5f9; text-transform: uppercase; letter-spacing: 0.02em; }
                .tag-sub { color: var(--accent); }

                .message-highlight { animation: highlight-pulse 2s ease-out; }
                @keyframes highlight-pulse { 0% { box-shadow: 0 0 0 0px rgba(0, 112, 243, 0.4); } 100% { box-shadow: 0 0 0 20px rgba(0, 112, 243, 0); } }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @media (max-width: 600px) { 
                    .hide-mobile { display: none; } 
                    .hide-mobile-tags { display: none; }
                    .log-row-premium { padding: 0.8rem; gap: 0.8rem; }
                    .log-time { display: block; margin-left: 0; margin-top: 0.1rem; font-size: 0.7rem; }
                    .log-avatar { width: 32px; height: 32px; }
                }
            `}</style>
        </div>
    );
}
