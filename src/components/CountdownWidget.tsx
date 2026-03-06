'use client';

import { useState, useEffect } from 'react';
import { Clock, BookOpen } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../lib/translations';

export default function CountdownWidget() {
    const { lang } = useLanguage();
    const t = translations[lang].countdown;
    const ivuDate = new Date('2026-03-09T00:00:00-03:00');
    const mateDate = new Date('2026-03-11T00:00:00-03:00');

    const calculateTimeLeft = (target: Date) => {
        const now = new Date();
        const diff = target.getTime() - now.getTime();

        if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60),
            expired: false,
        };
    };

    const [ivuTime, setIvuTime] = useState(() => calculateTimeLeft(ivuDate));
    const [mateTime, setMateTime] = useState(() => calculateTimeLeft(mateDate));

    useEffect(() => {
        const timer = setInterval(() => {
            setIvuTime(calculateTimeLeft(ivuDate));
            setMateTime(calculateTimeLeft(mateDate));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const pad = (n: number) => String(n).padStart(2, '0');

    const TimerLines = ({ time }: { time: any }) => (
        <div className="countdown-timer">
            <div className="countdown-unit">
                <span className="countdown-number">{pad(time.days)}</span>
                <span className="countdown-label">{t.days}</span>
            </div>
            <span className="countdown-sep">:</span>
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
            {/* Left Bottom: IVU Countdown */}
            <a href="https://campus.fadena.undef.edu.ar/mod/choice/view.php?id=27815" target="_blank" rel="noopener noreferrer" className="sidebar-widget sidebar-widget-left" style={{ textDecoration: 'none', color: 'white' }}>
                <div className="countdown-header">
                    <Clock size={14} />
                    <span>{t.ivuTitle}</span>
                </div>
                {!ivuTime.expired ? (
                    <TimerLines time={ivuTime} />
                ) : (
                    <p className="countdown-desc" style={{ textAlign: 'center', fontWeight: 700, marginBottom: '0.5rem' }}>{t.available}</p>
                )}
                <p className="countdown-desc" dangerouslySetInnerHTML={{ __html: t.ivuDesc }} />
            </a>

            {/* Left Top: Matemática */}
            <a href="https://campus.fadena.undef.edu.ar/course/view.php?id=539" target="_blank" rel="noopener noreferrer" className="sidebar-widget sidebar-widget-math" style={{ textDecoration: 'none', color: 'white' }}>
                <div className="countdown-header">
                    <BookOpen size={14} />
                    <span>{t.mateTitle}</span>
                </div>
                {!mateTime.expired ? (
                    <TimerLines time={mateTime} />
                ) : (
                    <p className="countdown-desc" style={{ textAlign: 'center', fontWeight: 700, marginBottom: '0.5rem' }}>{t.available}</p>
                )}
                <p className="countdown-desc" dangerouslySetInnerHTML={{ __html: t.mateDesc }} />
            </a>
        </>
    );
}
