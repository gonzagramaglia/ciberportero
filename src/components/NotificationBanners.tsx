'use client';

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { translations } from '../lib/translations';
import { useLanguage } from '../context/LanguageContext';

export default function NotificationBanners({ limitTo = 'all' }: { limitTo?: 'ivu' | 'mate' | 'none' | 'all' }) {
    const { lang } = useLanguage();
    const t = translations[lang];
    const [showNotification, setShowNotification] = useState(false);
    const [showNotificationMate, setShowNotificationMate] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (limitTo === 'none') return;

        const hiddenIVU = localStorage.getItem('hide_notification_ivu_v3');
        const hiddenMate = localStorage.getItem('hide_notification_mate_v3');

        const canShowIVU = limitTo === 'all' || limitTo === 'ivu';
        const canShowMate = limitTo === 'all' || limitTo === 'mate';

        if (!hiddenIVU && canShowIVU) setShowNotification(true);
        if (!hiddenMate && canShowMate) setShowNotificationMate(true);
    }, [limitTo]);

    // Update margin logic to only apply negative margin if BOTH are actually visible on screen
    const needsNegativeMargin = showNotificationMate && showNotification;

    const closeIVU = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowNotification(false);
        localStorage.setItem('hide_notification_ivu_v3', 'true');
    };

    const closeMate = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowNotificationMate(false);
        localStorage.setItem('hide_notification_mate_v3', 'true');
    };

    if (!isMounted) return null;

    return (
        <>
            {showNotificationMate && (
                <a
                    href="https://campus.fadena.undef.edu.ar/mod/choice/view.php?id=27826"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="notification-banner"
                >
                    <div className="notification-content">
                        <div className="notification-icon">
                            <Bell size={18} />
                        </div>
                        <div className="notification-text">
                            <strong>{t.notificationMate?.title}</strong>
                            <span dangerouslySetInnerHTML={{ __html: t.notificationMate?.desc || '' }} />
                        </div>
                        <button className="notification-close" onClick={closeMate}>
                            <X size={16} />
                        </button>
                    </div>
                </a>
            )}

            {showNotification && (
                <a
                    href="https://campus.fadena.undef.edu.ar/mod/choice/view.php?id=27815"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="notification-banner"
                    style={{ marginTop: needsNegativeMargin ? '-1.5rem' : '0.5rem' }}
                >
                    <div className="notification-content">
                        <div className="notification-icon">
                            <Bell size={18} />
                        </div>
                        <div className="notification-text">
                            <strong>{t.notification?.title}</strong>
                            <span dangerouslySetInnerHTML={{ __html: t.notification?.desc || '' }} />
                        </div>
                        <button className="notification-close" onClick={closeIVU}>
                            <X size={16} />
                        </button>
                    </div>
                </a>
            )}
        </>
    );
}
