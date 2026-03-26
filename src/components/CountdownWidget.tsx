'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../lib/translations';

export default function CountdownWidget() {
    const { lang } = useLanguage();
    const t = translations[lang].countdown;
    // New target date for Inscripción a Materias: March 31, 2026 at 12:00
    const targetDate = new Date('2026-03-31T12:00:00-03:00');

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

    const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate));

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(targetDate));
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
            {/* Left Side: Inscripción Countdown */}
            <a 
                href="https://autogestion.fadena.undef.edu.ar/3w/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="sidebar-widget sidebar-widget-left" 
                style={{ textDecoration: 'none', color: 'white' }}
            >
                <div className="countdown-header">
                    <Clock size={14} />
                    <span>{t.ivuTitle}</span>
                </div>
                {!timeLeft.expired ? (
                    <TimerLines time={timeLeft} />
                ) : (
                    <p className="countdown-desc" style={{ textAlign: 'center', fontWeight: 700, marginBottom: '0.5rem' }}>{t.available}</p>
                )}
                <p className="countdown-desc" dangerouslySetInnerHTML={{ __html: t.ivuDesc }} />
            </a>

            {/* Right Side: SIU Image Widget */}
            <div className="sidebar-widget sidebar-widget-right">
                <a href="/siu.png" target="_blank" rel="noopener noreferrer">
                    <img 
                        src="/siu.png" 
                        alt="Inscripción SIU Guaraní" 
                    />
                </a>
            </div>
        </>
    );
}
