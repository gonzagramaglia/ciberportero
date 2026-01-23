'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import { useState, useEffect } from 'react';
import { PostData } from '@/lib/posts-client';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Home() {
    const { lang } = useLanguage();
    const [posts, setPosts] = useState<Omit<PostData, 'content'>[]>([]);
    const t = translations[lang];

    useEffect(() => {
        // Fetch posts for the current language
        const fetchPosts = async () => {
            const response = await fetch(`/api/posts?lang=${lang}`);
            const data = await response.json();
            setPosts(data);
        };
        fetchPosts();
    }, [lang]);

    return (
        <div className="container fade-in">
            <header>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>{t.title}</h1>
                    <LanguageSwitcher />
                </div>
                <p>{t.description}</p>
            </header>

            <main>
                <div className="post-item featured">
                    <Link href="/links">
                        <span className="featured-tag">{t.featured?.tag}</span>
                        <span className="post-title">{t.featured?.title}</span>
                        <p className="post-description">{t.featured?.description}</p>
                    </Link>
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

            <div style={{ marginTop: '4rem', marginBottom: '0' }}>
                <a href="https://youtu.be/Sdz38CpLrUs" target="_blank" rel="noopener noreferrer">
                    <img
                        src="/blog.png"
                        alt="Ciberportero Blog Cover"
                        style={{ width: '100%', borderRadius: '12px', cursor: 'pointer' }}
                    />
                </a>
            </div>

            <footer>
                {t.footer}
            </footer>
        </div>
    );
}
