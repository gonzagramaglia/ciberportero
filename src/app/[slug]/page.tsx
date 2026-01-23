'use client';

import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { ChevronLeft, Github, Youtube } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../lib/translations';
import { useState, useEffect } from 'react';
import { PostData } from '../../lib/posts-client';
import { useParams, notFound } from 'next/navigation';
import LanguageSwitcher from '../../components/LanguageSwitcher';

export default function Post() {
    const { slug } = useParams();
    const { lang } = useLanguage();
    const [post, setPost] = useState<PostData | null>(null);
    const [loading, setLoading] = useState(true);
    const t = translations[lang];

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/posts?slug=${slug}&lang=${lang}`);
                if (!response.ok) throw new Error('Post not found');
                const data = await response.json();
                setPost(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchPost();
    }, [slug, lang]);

    if (loading) return <div className="container fade-in"></div>;
    if (!post) return notFound();

    return (
        <div className="container fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', marginBottom: '2rem' }}>
                <Link href="/" className="back-link" style={{ marginBottom: 0 }}>
                    <ChevronLeft size={16} />
                    {t.back}
                </Link>
                <LanguageSwitcher />
            </div>

            <article className="post-content">
                <span className="post-date">{new Date(post.date).toLocaleDateString(lang, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    timeZone: 'UTC'
                })}</span>
                <ReactMarkdown
                    components={{
                        a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />
                    }}
                >
                    {post.content}
                </ReactMarkdown>
            </article>

            <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a href="https://youtu.be/Sdz38CpLrUs" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
                    <Youtube size={22} />
                </a>
                <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>{t.footer}</Link>
                <a href="https://github.com/gonzalogramagia/ciberportero" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
                    <Github size={18} />
                </a>
            </footer>
        </div>
    );
}
