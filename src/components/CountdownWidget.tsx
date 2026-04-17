'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../lib/translations';

interface CountdownData {
    id?: string;
    slot: 'left' | 'right';
    title: string;
    description?: string;
    expiredMessage?: string;
    targetDate: string | Date;
    url?: string;
    isActive: boolean;
}

interface CountdownWidgetProps {
    countdowns?: CountdownData[];
    isInline?: boolean;
}

export default function CountdownWidget({ countdowns: initialCountdowns, isInline }: CountdownWidgetProps) {
    const { lang } = useLanguage();
    const t = translations[lang].countdown;
    const [isLoading, setIsLoading] = useState(!initialCountdowns);
    const [countdowns, setCountdowns] = useState<CountdownData[]>(initialCountdowns || []);

    useEffect(() => {
        if (initialCountdowns) {
            setCountdowns(initialCountdowns);
            setIsLoading(false);
        } else {
            setIsLoading(true);
            fetch(`/api/countdowns?lang=${lang}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setCountdowns(data);
                })
                .catch(err => console.error("Error fetching countdowns:", err))
                .finally(() => setIsLoading(false));
        }
    }, [initialCountdowns, lang]);

    const calculateTimeLeft = (target: string | Date) => {
        const now = new Date();
        const diff = new Date(target).getTime() - now.getTime();

        if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60),
            expired: false,
        };
    };

    const pad = (n: number) => String(n).padStart(2, '0');

    const [times, setTimes] = useState<Record<string, any>>({});

    useEffect(() => {
        const updateAll = () => {
            const newTimes: Record<string, any> = {};
            countdowns.forEach(cd => {
                if (cd.slot) {
                    newTimes[cd.slot] = calculateTimeLeft(cd.targetDate);
                }
            });
            setTimes(newTimes);
        };

        updateAll();
        const timer = setInterval(updateAll, 1000);
        return () => clearInterval(timer);
    }, [countdowns]);

    const TimerGrid = ({ time }: { time: any }) => (
        <div className="countdown-timer">
            {time.days > 0 && (
                <>
                    <div className="countdown-unit">
                        <span className="countdown-number">{pad(time.days)}</span>
                        <span className="countdown-label">{t.days}</span>
                    </div>
                    <span className="countdown-sep">:</span>
                </>
            )}
            <div className="countdown-unit">
                <span className="countdown-number">{pad(time.hours)}</span>
                <span className="countdown-label">{t.hours}</span>
            </div>
            <span className="countdown-sep">:</span>
            <div className="countdown-unit">
                <span className="countdown-number">{pad(time.minutes)}</span>
                <span className="countdown-label">{t.minutes}</span>
            </div>
            <span className="countdown-sep">:</span>
            <div className="countdown-unit">
                <span className="countdown-number">{pad(time.seconds)}</span>
                <span className="countdown-label">{t.seconds}</span>
            </div>
        </div>
    );

    const processText = (text?: string) => {
        if (!text) return null;
        return text.split('\n').map((line, i) => (
            <span key={i} style={{ display: 'block' }}>
                {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={j} style={{ fontWeight: 900 }}>{part.slice(2, -2)}</strong>;
                    }
                    return part;
                })}
            </span>
        ));
    };

    if (isLoading) {
        return (
            <>
                <div className="sidebar-widget sidebar-widget-left skeleton-pulse" style={{ height: '85px', opacity: 0.5 }}></div>
                <div className="sidebar-widget sidebar-widget-right skeleton-pulse" style={{ height: '85px', opacity: 0.5 }}></div>
            </>
        );
    }

    return (
        <>
            {countdowns.map(cd => {
                const time = times[cd.slot];
                if (!time) return null;

                const widgetClass = isInline 
                    ? `inline-countdown ${initialCountdowns ? 'post-specific' : ''}` 
                    : `sidebar-widget sidebar-widget-${cd.slot} ${initialCountdowns ? 'post-specific' : ''}`;

                const content = (
                    <div className={widgetClass} style={{ cursor: cd.url ? 'pointer' : 'default' }}>
                        <div className="countdown-header" style={{ marginBottom: (cd.description || !time.expired) ? '0.5rem' : '0' }}>
                            <Clock size={14} />
                            <span style={{ fontWeight: 900 }}>{processText(cd.title)}</span>
                        </div>
                        
                        {!time.expired ? (
                            <>
                                {cd.description && (
                                    <p className="countdown-desc" style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.5rem', fontWeight: 600 }}>
                                        {processText(cd.description)}
                                    </p>
                                )}
                                <TimerGrid time={time} />
                            </>
                        ) : (
                            <div className="countdown-desc" style={{ fontWeight: 700, margin: 0, fontSize: '0.9rem' }}>
                                {processText(cd.expiredMessage) || t.available}
                            </div>
                        )}
                    </div>
                );

                if (cd.url) {
                    return (
                        <a 
                            key={cd.slot} 
                            href={cd.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            {content}
                        </a>
                    );
                }

                return <div key={cd.slot}>{content}</div>;
            })}
        </>
    );
}
