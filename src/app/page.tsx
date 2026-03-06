'use client';

import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../lib/translations';
import { useState, useEffect } from 'react';
import { PostData } from '../lib/posts-client';
import LanguageSwitcher from '../components/LanguageSwitcher';
import CountdownWidget from '../components/CountdownWidget';
import { Github, Youtube, Bell, X } from 'lucide-react';

export default function Home() {
    const { lang } = useLanguage();
    const [posts, setPosts] = useState<Omit<PostData, 'content'>[]>([]);
    const t = translations[lang];
    const [showNotification, setShowNotification] = useState(true);

    useEffect(() => {
        // Fetch posts for the current language
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
        if (showNotification) {
            const timer = setTimeout(() => {
                setShowNotification(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showNotification]);

    return (
        <div className="container fade-in">
            {showNotification && (
                <a
                    href="https://campus.fadena.undef.edu.ar/mod/choice/view.php?id=27815"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="notification-banner"
                >
                    <div className="notification-content">
                        <div className="notification-icon">
                            <Bell size={18} />
                        </div>
                        <div className="notification-text">
                            <strong>Inscripción a la Actividad Integradora de Intro a la Vida Universitaria</strong>
                            <span>Deberá inscribirse a un turno dentro de los disponibles. Cierra el 7/3 a las 15:00hs.</span>
                        </div>
                        <button
                            className="notification-close"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowNotification(false);
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <div className="notification-progress" />
                </a>
            )}
            <header>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>{t.title}</h1>
                    <LanguageSwitcher />
                </div>
                <p>{t.description}</p>
            </header>

            <main>
                <Link href="/links" className="post-item featured" style={{ display: 'block', textDecoration: 'none' }}>
                    <span className="featured-tag">{t.featured?.tag}</span>
                    <span className="post-title">{t.featured?.title}</span>
                    <p className="post-description">{t.featured?.description}</p>
                </Link>

                <div className="intro-cover">
                    <a href="/intro.png" target="_blank" rel="noopener noreferrer">
                        <img
                            src="/intro.png"
                            alt="Calendario Académico de Grado 2026"
                            style={{ width: '100%', borderRadius: '12px', cursor: 'pointer' }}
                        />
                    </a>
                </div>

                <div className="intro-cover">
                    <a href="/moodle-siu.png" target="_blank" rel="noopener noreferrer">
                        <img
                            src="/moodle-siu.png"
                            alt="Moodle y SIU"
                            style={{ width: '100%', borderRadius: '12px', cursor: 'pointer' }}
                        />
                    </a>
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

            <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a href="https://youtu.be/Sdz38CpLrUs" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
                    <Youtube size={22} />
                </a>
                <span>{t.footer}</span>
                <a href="https://github.com/gonzalogramagia/ciberportero" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
                    <Github size={18} />
                </a>
            </footer>
            <CountdownWidget />
        </div>
    );
}
