'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../lib/translations';
import { Github, Youtube, Home } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

interface BlogClientProps {
    initialPosts: any[];
}

export default function BlogClient({ initialPosts }: BlogClientProps) {
    const { lang } = useLanguage();
    const t = translations[lang];
    const [posts, setPosts] = useState(initialPosts);
    const [isLoadingPosts, setIsLoadingPosts] = useState(false);

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoadingPosts(true);
            try {
                const response = await fetch(`/api/posts?lang=${lang}&unlisted=true`);
                const data = await response.json();
                setPosts(data);
            } finally {
                setIsLoadingPosts(false);
            }
        };
        if (lang) fetchPosts();
    }, [lang]);

    return (
        <div className="container fade-in home-container">
            <header style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.2rem', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.2rem' }}>
                        <h1 style={{ margin: 0, fontSize: '3rem', fontWeight: '900', color: '#000', letterSpacing: '-0.03em' }}>
                            Blog
                        </h1>
                    </div>
                    <div className="home-lang-container" style={{ marginBottom: 0, marginTop: '0.6rem' }}>
                        <LanguageSwitcher />
                    </div>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: '1.1rem', marginTop: '0.2rem', fontWeight: '500' }}>
                    <span style={{ fontStyle: 'italic', opacity: 0.9 }}>
                        {lang === 'es' ? 'Artículos, glosarios y notas sobre ciberseguridad, programación y más.' :
                         lang === 'pt' ? 'Artigos, glossários e notas sobre cibersegurança, programação e mais.' :
                         'Articles, glossaries, and notes on cybersecurity, programming, and more.'}
                    </span>
                </p>
            </header>

            <main style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <ul className="post-list">
                    {isLoadingPosts ? (
                        [1, 2, 3].map(i => (
                            <li key={i} className="post-item" style={{ pointerEvents: 'none' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    <div style={{ width: '120px', height: '14px', borderRadius: '8px', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                                    <div style={{ width: `${60 + i * 10}%`, height: '20px', borderRadius: '8px', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                                </div>
                            </li>
                        ))
                    ) : posts.length > 0 ? (
                        posts.map((post: any) => (
                            <li key={post.slug} className="post-item">
                                <Link href={`/blog/${post.slug}`}>
                                    <span className="post-date">{new Date(post.date).toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</span>
                                    <span className="post-title">{post.title}</span>
                                    <p className="post-description">{post.description}</p>
                                </Link>
                            </li>
                        ))
                    ) : (
                        <div style={{
                            padding: '3rem 1rem',
                            textAlign: 'center',
                            background: '#f8fafc',
                            borderRadius: '12px',
                            border: '1px dashed var(--border)',
                            color: 'var(--muted)'
                        }}>
                            <p style={{ margin: 0, fontWeight: '500' }}>
                                {lang === 'es' ? 'No hay posts unlisted en este momento.' :
                                    lang === 'pt' ? 'Não há posts unlisted no momento.' :
                                        'No unlisted posts at this time.'}
                            </p>
                        </div>
                    )}
                </ul>
            </main>

            <footer className="footer-main">
                <Link href={lang === 'en' ? '/en' : lang === 'pt' ? '/pt' : '/'} style={{ display: 'flex', color: 'inherit' }}><Home size={18} /></Link>
                <span>{t.footer}</span>
                <a href="https://youtu.be/Sdz38CpLrUs" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}><Youtube size={22} /></a>
            </footer>

            <style jsx>{`
                @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
            `}</style>
        </div>
    );
}
