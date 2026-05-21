'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AlertTriangle, Bell, X } from 'lucide-react';
import { translations } from '../lib/translations';
import { useLanguage } from '../context/LanguageContext';
import { formatMarkdown } from '../lib/utils';

export default function NotificationBanners({ limitTo = 'all' }: { limitTo?: 'ivu' | 'mate' | 'none' | 'all' }) {
    const { lang } = useLanguage();
    const { data: session } = useSession();
    const [dbNotifications, setDbNotifications] = useState<any[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const [hiddenIds, setHiddenIds] = useState<string[]>([]);

    useEffect(() => {
        setIsMounted(true);
        // Load hidden notifications from localStorage based on session
        const hiddenKey = session ? 'user_hidden_notifications' : 'hidden_notifications';
        const hidden = localStorage.getItem(hiddenKey);
        if (hidden) setHiddenIds(JSON.parse(hidden));
        else setHiddenIds([]); // Reset when session changes

        fetch('/api/notifications')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setDbNotifications(data);
            })
            .catch(console.error);
    }, [session]);

    const closeNotification = (id: string) => {
        const newHidden = [...hiddenIds, id];
        setHiddenIds(newHidden);
        const hiddenKey = session ? 'user_hidden_notifications' : 'hidden_notifications';
        localStorage.setItem(hiddenKey, JSON.stringify(newHidden));
    };

    if (!isMounted) return null;

    // Filter out notifications that don't have a message in the current language
    const activeNotifications = dbNotifications
        .filter(n => !hiddenIds.includes(n.id))
        .filter(n => {
            const msg = typeof n.message === 'object' ? n.message[lang] : n.message;
            return msg && msg.trim().length > 0;
        });

    if (activeNotifications.length === 0) return null;

    return (
        <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {activeNotifications.map(notification => {
                const message = typeof notification.message === 'object' ? notification.message[lang] : notification.message;
                const description = typeof notification.description === 'object' ? notification.description[lang] : notification.description;
                const type = notification.type || 'info';
                
                // Color mapping based on type
                const styles = {
                    danger: { bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', border: '#b91c1c', icon: <AlertTriangle size={18} /> },
                    warning: { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', border: '#b45309', icon: <AlertTriangle size={18} /> },
                    success: { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: '#047857', icon: <Bell size={18} /> },
                    info: { bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', border: '#1d4ed8', icon: <Bell size={18} /> }
                }[type as 'danger' | 'warning' | 'success' | 'info'];

                const url = notification.url;

                const Content = () => (
                    <div className="notification-content" style={{ cursor: url ? 'pointer' : 'default', width: '100%' }}>
                        <div className="notification-icon" style={{ background: 'rgba(255,255,255,0.2)' }}>
                            {styles.icon}
                        </div>
                        <div className="notification-text">
                            <p 
                                style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.01em' }} 
                                dangerouslySetInnerHTML={{ __html: formatMarkdown(message) }} 
                            />
                            {description && (
                                <p 
                                    style={{ margin: '0.1rem 0 0', opacity: 0.9, fontSize: '0.85rem', fontWeight: 500 }} 
                                    dangerouslySetInnerHTML={{ __html: formatMarkdown(description) }} 
                                />
                            )}
                        </div>
                    </div>
                );

                return (
                    <div key={notification.id} className={`notification-banner ${type}`} style={{ 
                        background: styles.bg,
                        color: 'white',
                        border: `1px solid ${styles.border}`,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        position: 'relative',
                        borderRadius: '16px',
                        overflow: 'hidden'
                    }}>
                        {url ? (
                            <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                                <Content />
                            </a>
                        ) : (
                            <Content />
                        )}
                        <button 
                            className="notification-close" 
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                closeNotification(notification.id);
                            }}
                            style={{ zIndex: 10 }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
