'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../lib/translations';
import { Github, Youtube, Home, ChevronLeft, Coffee, Plus } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useSession } from 'next-auth/react';

interface BlogClientProps {
    initialPosts: any[];
}

export default function BlogClient({ initialPosts }: BlogClientProps) {
    const { lang } = useLanguage();
    const t = translations[lang];
    const [posts, setPosts] = useState(initialPosts);
    const [isLoadingPosts, setIsLoadingPosts] = useState(false);
    const { data: session } = useSession();
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    // Compute tags frequency
    const tagFrequencies = useMemo(() => {
        const freqs: Record<string, number> = {};
        posts.forEach((p: any) => {
            const tags = (p.tags && Array.isArray(p.tags) && p.tags.length > 0) ? p.tags : ['Otros'];
            tags.forEach((t: string) => {
                freqs[t] = (freqs[t] || 0) + 1;
            });
        });

        // Sort tags by frequency (descending)
        return Object.entries(freqs)
            .sort((a, b) => b[1] - a[1])
            .map(([tag]) => tag);
    }, [posts]);

    // Set default selected tag when tags are loaded
    useEffect(() => {
        if (tagFrequencies.length > 0 && !selectedTag) {
            setSelectedTag(tagFrequencies[0]);
        } else if (tagFrequencies.length === 0) {
            setSelectedTag(null);
        }
    }, [tagFrequencies, selectedTag]);

    const filteredPosts = useMemo(() => {
        if (!selectedTag) return posts;
        return posts.filter((p: any) => {
            const tags = (p.tags && Array.isArray(p.tags) && p.tags.length > 0) ? p.tags : ['Otros'];
            return tags.includes(selectedTag);
        });
    }, [posts, selectedTag]);

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
        <div className="container fade-in page-container">
            <div className="nav-header-row" style={{ marginTop: '-0.5rem', marginBottom: '2.5rem' }}>
                <Link href={lang === 'en' ? "/en" : lang === 'pt' ? "/pt" : "/"} className="back-link"><ChevronLeft size={16} />Volver al inicio</Link>
                <div className="mobile-only">
                    <LanguageSwitcher />
                </div>
            </div>

            <header style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.2rem', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.2rem' }}>
                        <h1 style={{ margin: 0, fontSize: '3rem', fontWeight: '900', color: '#000', letterSpacing: '-0.03em' }}>
                            Blog
                        </h1>
                        {session?.user?.role === 'admin' && (
                            <Link href="/editor/posts" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', background: '#f8fafc', color: '#64748b', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0', textDecoration: 'none', transition: 'all 0.2s', marginTop: '0.5rem' }}>
                                <Plus size={14} /><span>Gestionar Posts</span>
                            </Link>
                        )}
                    </div>
                    <div className="home-lang-container mobile-hide" style={{ marginBottom: 0, marginTop: '0.6rem' }}>
                        <LanguageSwitcher />
                    </div>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: '1.1rem', marginTop: '0.2rem', fontWeight: '500' }}>
                    <span style={{ fontStyle: 'italic', opacity: 0.9 }}>
                        {lang === 'es' ? 'Posts sobre ciberseguridad, desarrollo web y más.' :
                            lang === 'pt' ? 'Posts sobre cibersegurança, desenvolvimento web e mais.' :
                                'Posts about cybersecurity, web development and more.'}
                    </span>
                </p>
            </header>

            <main style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tagFrequencies.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1rem', scrollbarWidth: 'none' }}>
                        {tagFrequencies.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '999px',
                                    border: 'none',
                                    background: selectedTag === tag ? '#0f172a' : '#f1f5f9',
                                    color: selectedTag === tag ? '#fff' : '#64748b',
                                    fontWeight: '700',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                )}

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
                    ) : filteredPosts.length > 0 ? (
                        filteredPosts.map((post: any) => (
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
                <a href="https://cafecito.app/gonzagramaglia" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', color: 'inherit' }}><Coffee size={18} /></a>
                <span>{t.footer}</span>
                <a href="https://youtu.be/Sdz38CpLrUs" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}><Youtube size={22} /></a>
            </footer>

            <style jsx>{`
                @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
            `}</style>
        </div>
    );
}
