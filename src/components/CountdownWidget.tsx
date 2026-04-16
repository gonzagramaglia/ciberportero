'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../lib/translations';

interface CountdownData {
    id?: string;
    slot: 'left' | 'right';
    title: string;
    targetDate: string | Date;
    url?: string;
    isActive: boolean;
}

interface CountdownWidgetProps {
    countdowns?: CountdownData[];
}

export default function CountdownWidget({ countdowns: initialCountdowns }: CountdownWidgetProps) {
    const { lang } = useLanguage();
    const t = translations[lang].countdown;
    const [countdowns, setCountdowns] = useState<CountdownData[]>(initialCountdowns || []);

    useEffect(() => {
        if (initialCountdowns) {
            setCountdowns(initialCountdowns);
        } else {
            // Fetch global countdowns if not provided as props
            fetch(`/api/countdowns?lang=${lang}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setCountdowns(data);
                })
                .catch(err => console.error("Error fetching countdowns:", err));
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
                        <span className="countdown-number">{time.days}</span>
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

    return (
        <>
            {countdowns.map(cd => {
                const time = times[cd.slot];
                if (!time) return null;

                const content = (
                    <div className={`sidebar-widget sidebar-widget-${cd.slot}`} style={{ cursor: cd.url ? 'pointer' : 'default' }}>
                        <div className="countdown-header">
                            <Clock size={14} />
                            <span>{cd.title}</span>
                        </div>
                        {!time.expired ? (
                            <TimerGrid time={time} />
                        ) : (
                            <p className="countdown-desc" style={{ textAlign: 'center', fontWeight: 700, marginBottom: '0.5rem' }}>
                                {t.available}
                            </p>
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
