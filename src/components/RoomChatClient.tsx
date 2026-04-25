'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Hash, Send, Image as ImageIcon, X, Loader2, MessageSquare, Reply as ReplyIcon } from 'lucide-react';
import { addRoomMessage } from '@/lib/roomsActions';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { translations } from '@/lib/translations';

function MessageItem({ msg, onReply, lang }: any) {
    const { user } = msg;
    const date = new Date(msg.createdAt);

    const t = translations[lang as keyof typeof translations] || translations.es;

    return (
        <div className="message-card-wrapper fade-in">
            <div className="message-card">
                <div className="message-header">
                    <img src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}`} alt={user.name} className="message-avatar" />
                    <div className="message-meta">
                        <span className="message-user">{user.name}</span>
                        <span className="message-date">{date.toLocaleTimeString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-AR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
                
                <div className="message-body">
                    <div className="message-content">
                        <p>{msg.content}</p>
                        {msg.images && (msg.images as string[]).map((img, i) => (
                            <div key={i} className="image-wrapper">
                                <img src={img} alt="Screenshot" className="message-image" onClick={() => window.open(img, '_blank')} />
                            </div>
                        ))}
                    </div>

                    <div className="message-actions">
                        <button onClick={() => onReply(msg)} className="action-btn reply">
                            <ReplyIcon size={14} /> <span>{lang === 'es' ? 'Responder' : lang === 'pt' ? 'Responder' : 'Reply'}</span>
                        </button>
                    </div>
                </div>


                {msg.replies && msg.replies.length > 0 && (
                    <div className="replies-section">
                        {msg.replies.map((reply: any) => (
                            <div key={reply.id} className="reply-bubble">
                                <div className="reply-header">
                                    <img src={reply.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.user.name || 'U')}`} alt={reply.user.name} className="reply-avatar" />
                                    <span className="reply-user">{reply.user.name}</span>
                                    <span className="reply-date">{new Date(reply.createdAt).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="reply-content">
                                    <p>{reply.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
                .message-card-wrapper { margin-bottom: 2rem; position: relative; }
                .message-card { 
                    background: #fff; 
                    border-radius: 24px; 
                    padding: 1.5rem; 
                    box-shadow: 0 4px 20px rgba(0,0,0,0.04); 
                    border: 1px solid #f1f5f9;
                    transition: transform 0.2s;
                }
                .message-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.2rem; }
                .message-avatar { width: 44px; height: 44px; border-radius: 14px; object-fit: cover; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
                .message-meta { display: flex; flex-direction: column; }
                .message-user { font-weight: 900; font-size: 1rem; color: #1e293b; letter-spacing: -0.01em; }
                .message-date { font-size: 0.75rem; color: #94a3b8; font-weight: 600; }
                
                .message-body { padding-left: 3.7rem; }
                .message-content p { margin: 0; line-height: 1.6; color: #334155; font-size: 1.05rem; white-space: pre-wrap; }
                
                .image-wrapper { margin-top: 1.2rem; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; line-height: 0; }
                .message-image { width: 100%; height: auto; cursor: zoom-in; transition: transform 0.3s; }
                .message-image:hover { transform: scale(1.02); }
                
                .message-actions { margin-top: 1.2rem; display: flex; gap: 1rem; }
                .action-btn { 
                    background: #f8fafc; 
                    border: none; 
                    cursor: pointer; 
                    display: flex; 
                    align-items: center; 
                    gap: 0.5rem; 
                    font-size: 0.85rem; 
                    font-weight: 800; 
                    color: #64748b; 
                    padding: 0.5rem 1rem; 
                    border-radius: 10px;
                    transition: all 0.2s;
                }
                .action-btn:hover { background: #f1f5f9; color: var(--accent); }
                
                .replies-section { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 1rem; }
                .reply-bubble { background: #f8fafc; padding: 1rem 1.2rem; border-radius: 18px; border: 1px solid #f1f5f9; }
                .reply-header { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.5rem; }
                .reply-avatar { width: 24px; height: 24px; border-radius: 6px; }
                .reply-user { font-weight: 800; font-size: 0.85rem; color: #1e293b; }
                .reply-date { font-size: 0.7rem; color: #94a3b8; }
                .reply-content p { margin: 0; font-size: 0.95rem; color: #475569; line-height: 1.5; }
                
                .fade-in { animation: fadeIn 0.3s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}

import { guestStore } from '@/lib/guestStore';

export default function RoomChatClient({ subcategoryId, initialMessages, isGuest }: any) {
    const { lang } = useLanguage();
    const [currentSubId, setCurrentSubId] = useState<string | null>(subcategoryId || null);
    const [messages, setMessages] = useState(initialMessages || []);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [replyingTo, setReplyingTo] = useState<any>(null);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const t = translations[lang as keyof typeof translations] || translations.es;
    const roomsT = t.rooms;

    // Handle hash change
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            if (hash) setCurrentSubId(hash);
        };
        
        window.addEventListener('hashchange', handleHashChange);
        handleHashChange(); // initial check
        
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Sync messages when subcategoryId changes
    useEffect(() => {
        if (!currentSubId) return;
        
        const loadMessages = async () => {
            if (isGuest) {
                const sub = guestStore.getSubcategory(currentSubId);
                if (sub) setMessages(sub.messages);
                else setMessages([]);
            } else {
                const { getSubcategoryMessages } = await import('@/lib/roomsActions');
                const msgs = await getSubcategoryMessages(currentSubId);
                setMessages(msgs);
            }
        };
        
        loadMessages();
    }, [currentSubId, isGuest]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const validFiles = files.filter(f => {
                const MAX_FILE_SIZE = 1024 * 1024; // 1MB
                if (f.size > MAX_FILE_SIZE) {
                    toast.error(lang === 'es' ? `${f.name} es muy pesado (>1MB)` : `${f.name} is too heavy (>1MB)`);
                    return false;
                }
                return true;
            });
            setSelectedImages(prev => [...prev, ...validFiles].slice(0, 3));
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() && selectedImages.length === 0) return;
        setSending(true);

        try {
            const imageUrls: string[] = [];
            if (selectedImages.length > 0) {
                setUploading(true);
                for (const file of selectedImages) {
                    if (isGuest) {
                        // Local preview URL for guest mode
                        imageUrls.push(URL.createObjectURL(file));
                    } else {
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
                guestStore.addMessage(currentSubId!, text, imageUrls, replyingTo?.id);
                const sub = guestStore.getSubcategory(currentSubId!);
                if (sub) setMessages([...sub.messages]);
                setText('');
                setSelectedImages([]);
                setReplyingTo(null);
            } else {
                const res = await addRoomMessage(currentSubId!, text, imageUrls, replyingTo?.id);
                if (res.success) {
                    setText('');
                    setSelectedImages([]);
                    setReplyingTo(null);
                    // Update messages without reload
                    const { getSubcategoryMessages } = await import('@/lib/roomsActions');
                    const msgs = await getSubcategoryMessages(currentSubId!);
                    setMessages(msgs);
                } else {
                    toast.error(res.error || 'Error');
                }
            }
        } catch (error) {
            console.error(error);
            toast.error(lang === 'es' ? "Error al enviar" : "Error sending");
        } finally {
            setSending(false);
            setUploading(false);
        }
    };

    return (
        <div className="chat-container">
            {currentSubId && (
                <div className="subcategory-chat-header fade-in">
                    <div className="header-badge">
                        <Hash size={14} />
                        <span>{isGuest ? guestStore.getSubcategory(currentSubId)?.name : roomsT.chat.messages}</span>
                    </div>
                </div>
            )}
            <div className="input-sticky-area top">
                <div className="input-area-container">
                    {replyingTo && (
                        <div className="replying-banner fade-in">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div className="reply-icon-circle"><ReplyIcon size={12} /></div>
                                <span>{lang === 'es' ? 'Respondiendo a' : 'Replying to'} <strong>{replyingTo.user.name}</strong></span>
                            </div>
                            <button onClick={() => setReplyingTo(null)} className="close-reply-btn"><X size={16} /></button>
                        </div>
                    )}

                    <div className="input-box">
                        <form onSubmit={handleSend}>
                            <textarea 
                                value={text} 
                                onChange={e => setText(e.target.value)} 
                                placeholder={roomsT.chat.whatAreYouThinking}
                                rows={text.split('\n').length > 3 ? 5 : 1}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend(e);
                                    }
                                }}
                            />

                            {selectedImages.length > 0 && (
                                <div className="selected-images-preview">
                                    {selectedImages.map((file, i) => (
                                        <div key={i} className="preview-thumb">
                                            <img src={URL.createObjectURL(file)} />
                                            <button type="button" onClick={() => setSelectedImages(prev => prev.filter((_, idx) => idx !== i))} className="remove-img-btn"><X size={12} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="input-footer">
                                <div className="input-tools">
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="tool-btn" title={roomsT.chat.uploadImage}>
                                        <ImageIcon size={22} />
                                        <input type="file" ref={fileInputRef} hidden accept="image/*" multiple onChange={handleFileChange} />
                                    </button>
                                </div>
                                <button type="submit" disabled={sending || uploading || (!text.trim() && selectedImages.length === 0)} className="send-btn">
                                    {sending ? <Loader2 size={20} className="spin" /> : <><span className="mobile-hide">{roomsT.chat.post}</span><Send size={18} /></>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="messages-list">
                {messages.length === 0 ? (
                    <div className="empty-state">
                        <MessageSquare size={64} className="empty-icon" />
                        <p style={{ fontSize: '1.2rem', fontWeight: '700' }}>{roomsT.chat.emptyMessages}</p>
                        <p style={{ opacity: 0.7 }}>{roomsT.chat.startConversation}</p>
                    </div>
                ) : (
                    messages.map((msg: any) => (
                        <MessageItem key={msg.id} msg={msg} lang={lang} onReply={setReplyingTo} />
                    ))
                )}
            </div>

            <style jsx>{`
                .chat-container { 
                    display: flex; 
                    flex-direction: column; 
                    height: calc(100vh - 18rem); 
                    min-height: 500px;
                    max-width: 900px;
                    margin: 0 auto;
                    position: relative;
                }

                .subcategory-chat-header {
                    padding: 0 2rem;
                    margin-bottom: 0.5rem;
                }

                .header-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: #f1f5f9;
                    color: #475569;
                    padding: 0.4rem 1rem;
                    border-radius: 10px;
                    font-size: 0.85rem;
                    font-weight: 800;
                    border: 1px solid #e2e8f0;
                }
                
                .messages-list { 
                    flex: 1; 
                    overflow-y: auto; 
                    padding: 2rem; 
                    display: flex; 
                    flex-direction: column;
                    gap: 1.5rem;
                }
                
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 8rem 2rem;
                    color: #94a3b8;
                    text-align: center;
                }
                
                .empty-icon { opacity: 0.15; margin-bottom: 1.5rem; }

                .input-sticky-area {
                    padding: 2rem;
                    background: linear-gradient(to bottom, #fff 80%, rgba(255, 255, 255, 0));
                    border-bottom: 1px solid #f1f5f9;
                    z-index: 10;
                    position: sticky;
                    top: 0;
                }

                .messages-list::-webkit-scrollbar { width: 6px; }
                .messages-list::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                
                .input-area-container { 
                    width: 100%;
                    margin: 0 auto;
                }
                
                .replying-banner { 
                    display: flex; 
                    align-items: center; 
                    justify-content: space-between; 
                    padding: 0.8rem 1.2rem; 
                    background: var(--accent); 
                    color: #fff;
                    border-radius: 16px 16px 0 0; 
                    margin-bottom: -1rem; 
                    position: relative; 
                    z-index: 1; 
                    font-size: 0.85rem; 
                    border: none;
                }
                
                .replying-banner strong { color: #fff; opacity: 1; }
                
                .reply-icon-circle { 
                    width: 24px; 
                    height: 24px; 
                    background: rgba(255,255,255,0.2); 
                    border-radius: 50%; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    color: #fff;
                }
                
                .close-reply-btn { background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.6); transition: color 0.2s; }
                .close-reply-btn:hover { color: #fff; }

                .input-box { 
                    background: #fff; 
                    border: 2px solid #f1f5f9; 
                    border-radius: 24px; 
                    padding: 0.8rem; 
                    box-shadow: 0 10px 40px rgba(0,0,0,0.06); 
                    position: relative;
                    z-index: 2;
                    transition: all 0.3s;
                }
                
                .input-box:focus-within {
                    border-color: var(--accent);
                    box-shadow: 0 15px 50px rgba(0, 112, 243, 0.1);
                }
                
                textarea { 
                    width: 100%; 
                    border: none; 
                    background: none; 
                    outline: none; 
                    resize: none; 
                    font-size: 1.1rem; 
                    font-family: inherit; 
                    color: #1e293b;
                    padding: 0.8rem 1rem;
                    max-height: 200px;
                }
                
                textarea::placeholder { color: #cbd5e1; }
                
                .selected-images-preview { display: flex; gap: 0.8rem; flex-wrap: wrap; margin: 0.5rem 1rem 1rem 1rem; padding: 0.8rem; background: #f8fafc; border-radius: 16px; }
                .preview-thumb { position: relative; width: 70px; height: 70px; }
                .preview-thumb img { width: 100%; height: 100%; object-fit: cover; border-radius: 12px; border: 2px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .remove-img-btn { position: absolute; top: -8px; right: -8px; background: #ef4444; color: #fff; border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; display: flex; alignItems: center; justifyContent: center; box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3); }

                .input-footer { 
                    display: flex; 
                    alignItems: center; 
                    justify-content: space-between; 
                    padding: 0.5rem;
                }
                
                .tool-btn { 
                    background: #f8fafc; 
                    border: none;
                    color: #94a3b8; 
                    padding: 0.8rem; 
                    border-radius: 16px; 
                    cursor: pointer; 
                    transition: all 0.2s; 
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .tool-btn:hover { background: #f1f5f9; color: var(--accent); transform: scale(1.05); }
                
                .send-btn { 
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
                    font-size: 0.9rem;
                    letter-spacing: 0.02em;
                }
                
                .send-btn:hover:not(:disabled) { 
                    transform: translateY(-2px); 
                    box-shadow: 0 8px 25px rgba(0, 112, 243, 0.4);
                    filter: brightness(1.1);
                }
                
                .send-btn:active:not(:disabled) { transform: translateY(0); }
                
                .send-btn:disabled { 
                    background: #f1f5f9; 
                    color: #cbd5e1; 
                    cursor: not-allowed; 
                    box-shadow: none;
                    border: 1px solid #e2e8f0;
                }
                
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
