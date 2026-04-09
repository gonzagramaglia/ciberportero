'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Bell, X } from 'lucide-react';
import { translations } from '../lib/translations';
import { useLanguage } from '../context/LanguageContext';

export default function NotificationBanners({ limitTo = 'all' }: { limitTo?: 'ivu' | 'mate' | 'none' | 'all' }) {
    const { lang } = useLanguage();
    const t = translations[lang];
    const [showNotification, setShowNotification] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (limitTo === 'none') return;

        const hiddenNotification = localStorage.getItem('hide_notification_security_v1');
        if (!hiddenNotification) setShowNotification(true);
    }, [limitTo]);

    const closeNotification = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowNotification(false);
        localStorage.setItem('hide_notification_security_v1', 'true');
    };

    if (!isMounted) return null;

    return (
        <>
            {showNotification && (
                <a
                    href="https://campus.fadena.undef.edu.ar/my/courses.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="notification-banner danger"
                    style={{ 
                        marginTop: '0.5rem',
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: 'white',
                        border: '1px solid #b91c1c',
                        boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)'
                    }}
                >
                    <div className="notification-content">
                        <div className="notification-icon" style={{ background: 'rgba(255,255,255,0.2)' }}>
                            <AlertTriangle size={18} />
                        </div>
                        <div className="notification-text">
                            <strong>{t.notification?.title}</strong>
                            <span dangerouslySetInnerHTML={{ __html: t.notification?.desc || '' }} />
                        </div>
                        <button className="notification-close" onClick={closeNotification}>
                            <X size={16} />
                        </button>
                    </div>
                </a>
            )}
        </>
    );
}
