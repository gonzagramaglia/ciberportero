'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../lib/translations';
import { ChevronLeft, ExternalLink, Mail, Copy, Check, Github, Youtube, Calendar, Zap } from 'lucide-react';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useState, useEffect } from 'react';
import NotificationBanners from '../../components/NotificationBanners';

export default function LinksPage() {
    const { lang } = useLanguage();
    const t = translations[lang];
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        document.title = 'Ciberportero | Links';
    }, []);

    const [isFinished, setIsFinished] = useState(false);
    const [isClassesFinished, setIsClassesFinished] = useState(false);
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
    const [classesCountdown, setClassesCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

    useEffect(() => {
        const enrollmentTarget = new Date('2026-04-01T23:59:59-03:00').getTime();
        const classesTarget = new Date('2026-04-08T09:00:00-03:00').getTime();
        
        const updateCountdowns = () => {
            const now = new Date().getTime();
            
            // Enrollment Countdown
            const eDistance = enrollmentTarget - now;
            if (eDistance < 0) {
                setCountdown({ days: 0, hours: 0, mins: 0, secs: 0 });
                setIsFinished(true);
            } else {
                setCountdown({
                    days: Math.floor(eDistance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((eDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    mins: Math.floor((eDistance % (1000 * 60 * 60)) / (1000 * 60)),
                    secs: Math.floor((eDistance % (1000 * 60)) / 1000)
                });
                setIsFinished(false);
            }

            // Classes Countdown
            const cDistance = classesTarget - now;
            if (cDistance < 0) {
                setClassesCountdown({ days: 0, hours: 0, mins: 0, secs: 0 });
                setIsClassesFinished(true);
            } else {
                setClassesCountdown({
                    days: Math.floor(cDistance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((cDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    mins: Math.floor((cDistance % (1000 * 60 * 60)) / (1000 * 60)),
                    secs: Math.floor((cDistance % (1000 * 60)) / 1000)
                });
                setIsClassesFinished(false);
            }
        };
        
        const timer = setInterval(updateCountdowns, 1000);
        updateCountdowns();
        return () => clearInterval(timer);
    }, []);

    const handleCopyEmail = () => {
        if (!t.contact?.email) return;
        navigator.clipboard.writeText(t.contact.email);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const links = t.links || [];

    return (
        <div className="container fade-in page-container">
            {/* Widget de Inscripciones (Izquierda) */}
            <div className={`sidebar-widget sidebar-widget-left`}>
                <div className="countdown-header">
                    <Calendar size={14} />
                    <span>{t.countdown.ivuTitle}</span>
                </div>
                {!isFinished ? (
                    <>
                        <div className="countdown-timer">
                            <div className="countdown-unit">
                                <span className="countdown-number">{countdown.hours}</span>
                                <span className="countdown-label">{t.countdown.hours}</span>
                            </div>
                            <span className="countdown-sep">:</span>
                            <div className="countdown-unit">
                                <span className="countdown-number">{countdown.mins}</span>
                                <span className="countdown-label">{t.countdown.minutes}</span>
                            </div>
                            <span className="countdown-sep">:</span>
                            <div className="countdown-unit">
                                <span className="countdown-number">{countdown.secs}</span>
                                <span className="countdown-label">{t.countdown.seconds}</span>
                            </div>
                        </div>
                        <p className="countdown-desc" style={{ color: '#fff', opacity: 0.9 }}>
                            Cierre de inscripciones <strong>Hoy</strong> a las <strong>23:59hs</strong>.
                        </p>
                    </>
                ) : (
                    <div style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <p style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, lineHeight: '1.2', color: '#fff' }}>{t.countdown.enrollmentClosed}</p>
                        <p style={{ fontSize: '0.7rem', opacity: 0.9, margin: 0, lineHeight: '1.4', color: '#fff' }}>{t.countdown.enrollmentClosedDesc}</p>
                    </div>
                )}
            </div>

            {/* Widget de Inicio de Clases (Derecha) */}
            <div className={`sidebar-widget sidebar-widget-right`} style={{ 
                background: 'linear-gradient(135deg, #1a4a6e 0%, #103253 100%)',
                boxShadow: '0 8px 24px rgba(16, 50, 83, 0.35)',
                padding: '1.1rem'
            }}>
                <div className="countdown-header">
                    <Zap size={14} />
                    <span>{t.countdown.classesTitle}</span>
                </div>
                {!isClassesFinished ? (
                    <>
                        <div className="countdown-timer">
                            {classesCountdown.days > 0 && (
                                <>
                                    <div className="countdown-unit">
                                        <span className="countdown-number">{classesCountdown.days}</span>
                                        <span className="countdown-label">{t.countdown.days}</span>
                                    </div>
                                    <span className="countdown-sep">:</span>
                                </>
                            )}
                            <div className="countdown-unit">
                                <span className="countdown-number">{classesCountdown.hours}</span>
                                <span className="countdown-label">{t.countdown.hours}</span>
                            </div>
                            <span className="countdown-sep">:</span>
                            <div className="countdown-unit">
                                <span className="countdown-number">{classesCountdown.mins}</span>
                                <span className="countdown-label">{t.countdown.minutes}</span>
                            </div>
                            <span className="countdown-sep">:</span>
                            <div className="countdown-unit">
                                <span className="countdown-number">{classesCountdown.secs}</span>
                                <span className="countdown-label">{t.countdown.seconds}</span>
                            </div>
                        </div>
                        <p className="countdown-desc" style={{ color: '#fff', opacity: 0.9 }}>
                            {t.countdown.classesDesc}
                        </p>
                    </>
                ) : (
                    <div style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <p style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, lineHeight: '1.2', color: '#fff' }}>{t.countdown.classesStarted}</p>
                        <p style={{ fontSize: '0.7rem', opacity: 0.9, margin: 0, lineHeight: '1.4', color: '#fff' }}>{t.countdown.classesStartedDesc}</p>
                    </div>
                )}
            </div>

            <NotificationBanners limitTo="none" />


            <div className="nav-header-row">
                <Link href="/" className="back-link">
                    <ChevronLeft size={18} />
                    {t.back}
                </Link>
                <LanguageSwitcher />
            </div>

            <header style={{ marginTop: '0.25rem', marginBottom: '3rem' }}>
                <h1 style={{ margin: 0, fontSize: '3rem', fontWeight: '900', color: '#000', letterSpacing: '-0.03em' }}>{t.featured?.title}</h1>
                <p style={{ color: 'var(--muted)', fontSize: '1.2rem', marginTop: '0.5rem', fontWeight: '500' }} dangerouslySetInnerHTML={{ __html: t.featured?.description || '' }} />
            </header>

            <main>
                <ul className="post-list links-grid">
                    {links.map((link) => {
                        const isWhatsApp = link.url.includes('chat.whatsapp.com');
                        const isDiscord = link.url.includes('discord.gg');
                        const isDrive = link.url.includes('drive.google.com');
                        const isYoutube = link.url.includes('youtube.com');
                        const isMoodle = link.url.includes('campus.fadena');
                        const isSIU = link.url.includes('autogestion.fadena');
                        const hasIcon = isWhatsApp || isDiscord || isDrive || isMoodle || isSIU || isYoutube;

                        const iconSrc = isWhatsApp ? '/wsp.png' : isDiscord ? '/discord.png' : isDrive ? '/drive.webp' : isMoodle ? '/moodle.png' : isYoutube ? '/youtube.png' : '/siu-guarani.png';
                        const iconAlt = isWhatsApp ? 'WhatsApp' : isDiscord ? 'Discord' : isDrive ? 'Google Drive' : isMoodle ? 'Moodle' : isYoutube ? 'YouTube' : 'SIU Guaraní';
                        const iconW = isDiscord ? 34 : isDrive ? 46 : isYoutube ? 44 : 40;
                        const iconH = isDrive ? 38 : isYoutube ? 44 : 40;

                        return (
                            <li key={link.url} className="post-item" style={{ marginBottom: 0 }}>
                                <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    {hasIcon ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: 46, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                                                <Image
                                                    src={iconSrc}
                                                    alt={iconAlt}
                                                    width={iconW}
                                                    height={iconH}
                                                    style={{ flexShrink: 0, borderRadius: '8px' }}
                                                />
                                            </div>
                                            <div>
                                                <span className="post-title" style={{ marginBottom: 0, fontSize: '1.2rem' }}>{link.name}</span>
                                                <p className="post-description" style={{ fontSize: '0.9rem' }}>{link.desc}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <ExternalLink size={20} color="var(--accent)" />
                                                <span className="post-title" style={{ marginBottom: 0, fontSize: '1.2rem' }}>{link.name}</span>
                                            </div>
                                            <p className="post-description" style={{ fontSize: '0.9rem' }}>{link.desc}</p>
                                        </>
                                    )}
                                </a>
                            </li>
                        );
                    })}
                </ul>

                <div className="contact-container" style={{ marginTop: '4rem', marginBottom: '1.25rem', padding: '2.5rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '24px', border: '1px solid rgba(16, 185, 129, 0.1)', borderLeft: '4px solid var(--success)' }}>
                    <div className="contact-container-inner">
                        <Mail size={22} color="var(--success)" />
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>{t.contact?.title}</h2>
                    </div>
                    <p style={{ color: 'var(--muted)', marginBottom: '1.5rem', fontSize: '1rem', fontWeight: '500' }}>{t.contact?.description}</p>
                    <div className="contact-container-inner">
                        <button
                            onClick={handleCopyEmail}
                            className="post-title email-button"
                            style={{
                                fontSize: '1.1rem',
                                background: 'none',
                                border: 'none',
                                color: 'var(--success)',
                                cursor: 'pointer',
                                padding: 0,
                                font: 'inherit',
                                textAlign: 'inherit',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem'
                            }}
                        >
                            {t.contact?.email}
                            {copied ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Check size={18} color="var(--success)" />
                                    <span className="mobile-hide" style={{ fontSize: '0.9rem', fontWeight: 700 }}>{t.contact?.copied}</span>
                                </div>
                            ) : (
                                <Copy size={18} />
                            )}
                        </button>
                    </div>
                </div>
            </main>

            <footer className="footer-main">
                <a href="https://github.com/gonzalogramagia/ciberportero" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
                    <Github size={18} />
                </a>
                <span>{t.footer}</span>
                <a href="https://youtu.be/Sdz38CpLrUs" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
                    <Youtube size={22} />
                </a>
            </footer>
        </div>
    );
}
