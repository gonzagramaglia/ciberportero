'use client';

import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../lib/translations';
import { useState, useEffect } from 'react';
import { PostData } from '../lib/posts-client';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { Github, Youtube, CheckCircle, BookOpen, Calendar, Info, Link as LinkIcon, X, ArrowRight, Layers, Star, Zap } from 'lucide-react';
import NotificationBanners from '../components/NotificationBanners';
import { useSession } from 'next-auth/react';
import { SignInButton } from '../components/AuthButtons';

export default function Home() {
    const { lang } = useLanguage();
    const { data: session } = useSession();
    const [posts, setPosts] = useState<Omit<PostData, 'content'>[]>([]);
    const [isGuest, setIsGuest] = useState(false);
    const t = translations[lang];
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleImageClick = (src: string) => {
        if (typeof window !== 'undefined' && window.innerWidth < 768 && src === '/cyberdefense-fadena-undef.png') {
            window.open('https://undef.edu.ar/fadena/carreras-de-grado/licciberdefensa/', '_blank');
            return;
        }
        setSelectedImage(src);
    };

    useEffect(() => {
        setIsGuest(localStorage.getItem("ciberportero_guest") === "true");
        const fetchPosts = async () => {
            const response = await fetch(`/api/posts?lang=${lang}`);
            const data = await response.json();
            setPosts(data);
        };
        fetchPosts();
    }, [lang]);

    useEffect(() => {
        document.title = 'Ciberportero';
    }, []);

    useEffect(() => {
        if (selectedImage) {
            document.body.classList.add('lightbox-open');
        } else {
            document.body.classList.remove('lightbox-open');
        }
        return () => document.body.classList.remove('lightbox-open');
    }, [selectedImage]);

    const isAuthenticated = !!session || isGuest;

    const [isFinished, setIsFinished] = useState(false);
    const [isClassesFinished, setIsClassesFinished] = useState(false);
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
    const [classesCountdown, setClassesCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

    useEffect(() => {
        const enrollmentTarget = new Date('2026-04-01T23:59:59-03:00').getTime();
        const classesTarget = new Date('2026-04-13T09:00:00-03:00').getTime();
        
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

    return (
        <div className="container fade-in home-container">
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

            <NotificationBanners />

            {selectedImage && (
                <div className="lightbox-overlay" onClick={() => setSelectedImage(null)}>
                    <div className="lightbox-content">
                        <button className="lightbox-close" onClick={() => setSelectedImage(null)}>
                            <X size={24} />
                        </button>
                        <img src={selectedImage} alt="Enlarged view" onClick={() => setSelectedImage(null)} style={{ cursor: 'zoom-out' }} />
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1.5rem' }}>
                <LanguageSwitcher />
            </div>

            <header style={{ marginBottom: '3rem' }}>
                <h1 style={{ margin: 0, fontSize: '3rem', fontWeight: '900', color: '#000', letterSpacing: '-0.03em' }}>{t.title}</h1>
                <p style={{ color: 'var(--muted)', fontSize: '1.2rem', marginTop: '0.5rem', fontWeight: '500' }}>{t.description}</p>
            </header>

            <main style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="featured-grid">
                    <Link 
                        href="/links" 
                        className="post-item featured roadmap-block links-card" 
                        style={{ display: 'block', textDecoration: 'none', border: '1px solid var(--success)', background: 'rgba(16, 185, 129, 0.03)' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span className="featured-tag" style={{ background: 'var(--success)', color: 'white' }}>{t.featured?.tag || 'Destaque'}</span>
                        </div>

                        <span className="post-title" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--success)' }}>
                            <LinkIcon size={28} className="bell-animation" color="var(--success)" />
                            {t.featured?.title}
                        </span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
                            <p className="post-description" dangerouslySetInnerHTML={{ __html: t.featured?.description || '' }} style={{ margin: 0 }} />
                        </div>
                    </Link>

                    <Link 
                        href="/plan" 
                        className="post-item featured roadmap-block plan-card" 
                        style={{ display: 'block', textDecoration: 'none', border: '1px solid var(--accent)', background: 'rgba(0,112,243,0.02)' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span className="featured-tag" style={{ background: 'var(--accent)', color: 'white' }}>{t.featured?.tag || 'Destaque'}</span>
                        </div>

                        <span className="post-title" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--accent)' }}>
                            <Zap size={28} className="bell-animation" fill="var(--accent)" />
                            {t.plan?.title}
                        </span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
                            <p className="post-description" dangerouslySetInnerHTML={{ __html: t.plan?.description || '' }} style={{ margin: 0 }} />
                        </div>
                    </Link>

                    <Link 
                        href="/dashboard" 
                        className="post-item featured roadmap-block dashboard-card" 
                        style={{ display: 'block', textDecoration: 'none', border: '1px solid var(--accent)', background: 'rgba(0,112,243,0.02)' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span className="featured-tag" style={{ background: 'var(--accent)', color: 'white' }}>{t.featured?.tag || 'Destaque'}</span>
                        </div>

                        <span className="post-title" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--accent)' }}>
                            <CheckCircle size={28} className="bell-animation" />
                            {t.studentPortal?.guestTitle}
                        </span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
                            <p className="post-description" dangerouslySetInnerHTML={{ __html: t.studentPortal?.guestDesc || '' }} style={{ margin: 0 }} />
                        </div>
                    </Link>
                </div>

                {lang === 'es' && (
                    <>
                        <div style={{ marginTop: '1.5rem', marginBottom: '0.8rem' }}>
                            <span className="featured-tag" style={{ background: '#f8fafc', color: 'var(--muted)', border: '1px solid var(--border)', marginBottom: '1rem' }}>Info</span>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#000', display: 'flex', alignItems: 'center', gap: '0.8rem', margin: 0 }}>
                                <Info size={26} style={{ color: 'var(--muted)' }} />
                                <span className="mobile-hide">Información de la Carrera</span>
                                <span className="mobile-only">Info de la Carrera</span>
                            </h2>
                        </div>

                        <a 
                            href="https://undef.edu.ar/fadena/carreras-de-grado/licciberdefensa/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="intro-cover"
                        >
                            <img
                                src="/cyberdefense-fadena-undef.png"
                                alt="Cyberdefense FADENA UNDEF"
                                style={{ width: '100%', borderRadius: '12px' }}
                            />
                        </a>

                        <Link href="/links" className="intro-cover">
                            <img
                                src="/moodle-siu.png"
                                alt="Moodle y SIU"
                                style={{ width: '100%', borderRadius: '12px' }}
                            />
                        </Link>

                        <div style={{ marginTop: '1.5rem', marginBottom: '0.8rem' }}>
                            <span className="featured-tag" style={{ background: '#f8fafc', color: 'var(--muted)', border: '1px solid var(--border)', marginBottom: '1rem' }}>Info</span>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#000', display: 'flex', alignItems: 'center', gap: '0.8rem', margin: 0 }}>
                                <Calendar size={26} style={{ color: 'var(--muted)' }} />
                                Calendario Tentativo
                            </h2>
                        </div>

                        <div className="intro-cover" onClick={() => handleImageClick('/intro.png')}>
                            <img
                                src="/intro.png"
                                alt="Calendario Académico de Grado 2026"
                                style={{ width: '100%', borderRadius: '12px', cursor: 'zoom-in' }}
                            />
                        </div>
                    </>
                )}

                <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                    <span className="featured-tag" style={{ background: '#f8fafc', color: 'var(--muted)', border: '1px solid var(--border)', marginBottom: '1rem' }}>Feed</span>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#000', display: 'flex', alignItems: 'center', gap: '0.8rem', margin: 0 }}>
                        <BookOpen size={26} style={{ color: 'var(--muted)' }} />
                        Blog
                    </h2>
                </div>

                <ul className="post-list">
                    {posts.map((post) => (
                        <li key={post.slug} className="post-item">
                            <Link href={`/${post.slug}`}>
                                <span className="post-date">{new Date(post.date).toLocaleDateString(lang, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    timeZone: 'UTC'
                                })}</span>
                                <span className="post-title">{post.title}</span>
                                <p className="post-description">{post.description}</p>
                            </Link>
                        </li>
                    ))}
                </ul>
            </main>

            <div className="home-cover">
                <a href="https://youtu.be/Sdz38CpLrUs" target="_blank" rel="noopener noreferrer">
                    <img
                        src="/blog.png"
                        alt="Ciberportero Blog Cover"
                        style={{ width: '100%', borderRadius: '12px', cursor: 'pointer' }}
                    />
                </a>
            </div>

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
