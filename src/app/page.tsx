'use client';

import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../lib/translations';
import { useState, useEffect } from 'react';
import { PostData } from '../lib/posts-client';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { Github, Youtube, CheckCircle, BookOpen, Calendar, Info, Link as LinkIcon, X, ArrowRight, Layers, Star } from 'lucide-react';
import NotificationBanners from '../components/NotificationBanners';
import { useSession } from 'next-auth/react';
import { SignInButton } from '../components/AuthButtons';

function AuthStatus() {
    const { data: session, status } = useSession();
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
        setIsGuest(localStorage.getItem("ciberportero_guest") === "true");
    }, []);

    if (status === 'loading') return null;
    if (!session && !isGuest) return null;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/dashboard" className="dashboard-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {session?.user?.image ? (
                    <img 
                        src={session.user.image} 
                        alt={session.user.name || 'User'} 
                        style={{ width: '24px', height: '24px', borderRadius: '50%' }} 
                    />
                ) : (
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem' }}>I</div>
                )}
                <span className="mobile-hide">{session?.user?.name?.split(' ')[0] || 'Invitado'}</span>
            </Link>
        </div>
    );
}

export default function Home() {
    const { lang } = useLanguage();
    const { data: session } = useSession();
    const [posts, setPosts] = useState<Omit<PostData, 'content'>[]>([]);
    const [isGuest, setIsGuest] = useState(false);
    const t = translations[lang];
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

    return (
        <div className="container fade-in">

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

            <header>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <h1>{t.title}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <LanguageSwitcher />
                    </div>
                </div>
                <p>{t.description}</p>
            </header>

            <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <Link href="/links" className="post-item featured" style={{ display: 'block', textDecoration: 'none' }}>
                    <span className="featured-tag">{t.featured?.tag}</span>
                    <span className="post-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--success)', fontSize: '1.8rem' }}>
                        <LinkIcon size={20} />
                        {t.featured?.title}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
                        <p className="post-description" dangerouslySetInnerHTML={{ __html: t.featured?.description || '' }} style={{ margin: 0 }} />
                    </div>
                </Link>

                {!isAuthenticated ? (
                    <div className="post-item featured portal-guest" style={{ display: 'block' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="featured-tag" style={{ background: 'var(--accent)', color: 'white' }}>Portal</span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1.2rem' }}>
                            <span className="post-title" style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--accent)' }}>
                                <CheckCircle size={28} className="bell-animation" />
                                {t.studentPortal?.guestTitle}
                            </span>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
                                <p className="post-description" style={{ margin: 0, fontSize: '1.1rem', opacity: 0.8, lineHeight: '1.5' }}>
                                    {t.studentPortal?.guestDesc}
                                </p>
                                <SignInButton />
                            </div>
                        </div>
                    </div>
                ) : (
                    <Link 
                        href="/dashboard" 
                        className="post-item featured portal-user" 
                        style={{ display: 'block', textDecoration: 'none' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span className="featured-tag" style={{ background: 'var(--accent)', color: 'white' }}>Portal</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: '700', padding: '0.4rem 0.8rem', background: 'rgba(0,112,243,0.05)', borderRadius: '20px', border: '1px solid rgba(0,112,243,0.1)' }}>
                                <div style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%' }}></div>
                                {session?.user?.name?.split(' ')[0] || 'Invitado'}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1.2rem' }}>
                            <span className="post-title" style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--accent)' }}>
                                <CheckCircle size={28} className="bell-animation" />
                                {t.studentPortal?.guestTitle}
                            </span>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
                                <p className="post-description" style={{ margin: 0, fontSize: '1.1rem', opacity: 0.8, lineHeight: '1.5' }}>
                                    {t.studentPortal?.guestDesc}
                                </p>
                                <ArrowRight className="arrow-portal" size={42} style={{ color: 'var(--accent)', opacity: 0.4 }} />
                            </div>
                        </div>
                    </Link>
                )}

                <Link href="/plan" className="post-item featured" style={{ display: 'block', textDecoration: 'none', borderColor: '#e2e8f0' }}>
                    <span className="featured-tag" style={{ background: '#000', color: '#fff' }}>New</span>
                    <span className="post-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#000', fontSize: '1.8rem' }}>
                        <Layers size={22} />
                        {t.plan?.title}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
                        <p className="post-description" style={{ margin: 0 }}>
                            {t.plan?.description}
                        </p>
                        <ArrowRight className="arrow-portal" size={28} style={{ color: '#000', opacity: 0.1 }} />
                    </div>
                </Link>


                <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
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


            <footer style={{ marginTop: '5rem', padding: '2rem 0', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a href="https://github.com/zzzNata/Mapa-Interactivo-CiberDefensa-UNDEF" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'var(--muted)', fontSize: '0.8rem', fontWeight: '500', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Star size={14} style={{ color: 'var(--accent)', fill: 'var(--accent)', opacity: 0.8 }} />
                    {t.credits}
                </a>
                <span style={{ fontSize: '0.9rem', opacity: 0.6 }}>{t.footer}</span>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <a href="https://youtu.be/Sdz38CpLrUs" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', color: 'inherit' }}>
                        <Youtube size={20} />
                    </a>
                    <a href="https://github.com/gonzalogramagia/ciberportero" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', color: 'inherit' }}>
                        <Github size={18} />
                    </a>
                </div>
            </footer>
        </div>
    );
}
