'use client';

import { useState, useEffect } from 'react';
import { Clock, BookOpen, GraduationCap } from 'lucide-react';

export default function CountdownWidget() {
    const ivuDate = new Date('2026-03-09T00:00:00-03:00');
    const finalDate = new Date('2026-03-13T00:00:00-03:00');

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
    const [finalTime, setFinalTime] = useState(() => calculateTimeLeft(finalDate));

    useEffect(() => {
        const timer = setInterval(() => {
            setIvuTime(calculateTimeLeft(ivuDate));
            setFinalTime(calculateTimeLeft(finalDate));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const pad = (n: number) => String(n).padStart(2, '0');

    const TimerLines = ({ time }: { time: any }) => (
        <div className="countdown-timer">
            <div className="countdown-unit">
                <span className="countdown-number">{pad(time.days)}</span>
                <span className="countdown-label">días</span>
            </div>
            <span className="countdown-sep">:</span>
            <div className="countdown-unit">
                <span className="countdown-number">{pad(time.hours)}</span>
                <span className="countdown-label">hs</span>
            </div>
            <span className="countdown-sep">:</span>
            <div className="countdown-unit">
                <span className="countdown-number">{pad(time.minutes)}</span>
                <span className="countdown-label">min</span>
            </div>
            <span className="countdown-sep">:</span>
            <div className="countdown-unit">
                <span className="countdown-number">{pad(time.seconds)}</span>
                <span className="countdown-label">seg</span>
            </div>
        </div>
    );

    return (
        <>
            {/* Left Bottom: IVU Countdown */}
            <a href="https://campus.fadena.undef.edu.ar/mod/choice/view.php?id=27815" target="_blank" rel="noopener noreferrer" className="sidebar-widget sidebar-widget-left" style={{ textDecoration: 'none', color: 'white' }}>
                <div className="countdown-header">
                    <Clock size={14} />
                    <span>Act. Integradora – Curso de Intro a la Vida Universitaria</span>
                </div>
                {!ivuTime.expired ? (
                    <TimerLines time={ivuTime} />
                ) : (
                    <p className="countdown-desc" style={{ textAlign: 'center', fontWeight: 700, marginBottom: '0.5rem' }}>¡Ya disponible!</p>
                )}
                <p className="countdown-desc">
                    Disponible el <strong>lunes 9/3</strong> según turno. Obligatoria para el ingreso.
                </p>
            </a>

            {/* Left Top: Matemática */}
            <div className="sidebar-widget sidebar-widget-math">
                <div className="countdown-header">
                    <BookOpen size={14} />
                    <span>Act. Integradora – Curso de Matemática</span>
                </div>
                <p className="countdown-desc" style={{ textAlign: 'center', marginTop: '0.25rem' }}>
                    <strong>Fecha aún no confirmada</strong>
                </p>
                <p className="countdown-desc" style={{ marginTop: '0.5rem' }}>
                    Pendiente de confirmación. Se publicará en el aula virtual.
                </p>
            </div>

        </>
    );
}
