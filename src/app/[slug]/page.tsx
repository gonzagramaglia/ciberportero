'use client';

import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronLeft, Github, Youtube, ArrowUp, ArrowDown, X, Link2, Check, Edit } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../lib/translations';
import { useState, useEffect } from 'react';
import { PostData } from '../../lib/posts-client';
import { useParams, notFound } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LanguageSwitcher from '../../components/LanguageSwitcher';

import NotificationBanners from '../../components/NotificationBanners';
import CommentSection from '../../components/CommentSection';

export default function Post() {
    const { slug } = useParams();
    const { lang } = useLanguage();
    const [post, setPost] = useState<PostData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showTop, setShowTop] = useState(false);
    const [showBottom, setShowBottom] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const { data: session } = useSession();
    const t = translations[lang];

    const handleCopy = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            setShowTop(scrollY > 300);
            setShowBottom(scrollY + windowHeight < documentHeight - 100);
        };

        window.addEventListener('scroll', handleScroll);

        // Check once immediately
        handleScroll();

        // And check again after a small delay to ensure content is rendered
        const timer = setTimeout(handleScroll, 100);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timer);
        };
    }, [loading]);

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

    useEffect(() => {
        if (post && slug) {
            if (slug.toString().includes('codeforces')) {
                document.title = 'Ciberportero | Codeforces';
            } else {
                document.title = `Ciberportero | ${post.title}`;
            }
        }
    }, [post, slug]);

    useEffect(() => {
        if (selectedImage) {
            document.body.classList.add('lightbox-open');
        } else {
            document.body.classList.remove('lightbox-open');
        }
        return () => document.body.classList.remove('lightbox-open');
    }, [selectedImage]);

    if (loading) return <div className="container fade-in"></div>;
    if (!post) return notFound();

    return (
        <>
            {selectedImage && (
                <div className="lightbox-overlay" style={{ zIndex: 9999 }} onClick={() => setSelectedImage(null)}>
                    <div className="lightbox-content">
                        <button className="lightbox-close" onClick={() => setSelectedImage(null)}>
                            <X size={24} />
                        </button>
                        <img src={selectedImage} alt="Enlarged view" onClick={() => setSelectedImage(null)} style={{ cursor: 'zoom-out' }} />
                    </div>
                </div>
            )}

            <div className="container fade-in post-container">
                <NotificationBanners limitTo={
                    post.slug.includes('mate') ? 'mate' :
                        post.slug.includes('ivu') ? 'ivu' :
                            post.slug.includes('codeforces') ? 'none' : 'all'
                } />
                <div className="nav-header-row">
                    <Link href="/" className="back-link">
                        <ChevronLeft size={16} />
                        {t.back}
                    </Link>
                    <LanguageSwitcher availableLangs={post?.availableLangs} />
                </div>

                <article className="post-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                        <span className="post-date" style={{ margin: 0 }}>{new Date(post.date).toLocaleDateString(lang, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            timeZone: 'UTC'
                        })}</span>
                        {session?.user?.role === 'admin' && post.id && (
                            <Link 
                                href={`/admin/posts/${post.id}`}
                                className="admin-edit-badge"
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.4rem', 
                                    fontSize: '0.7rem', 
                                    fontWeight: 800, 
                                    textTransform: 'uppercase',
                                    background: '#f8fafc',
                                    color: '#64748b',
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '6px',
                                    border: '1px solid #e2e8f0',
                                    textDecoration: 'none'
                                }}
                            >
                                <Edit size={12} />
                                <span>Editar</span>
                            </Link>
                        )}
                    </div>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                            h1: ({ node, ...props }) => (
                                <h1 {...props} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    {props.children}
                                </h1>
                            ),
                            img: ({ node, ...props }) => {
                                const src = props.src as string;
                                return (
                                    <img
                                        {...props}
                                        style={{ cursor: 'zoom-in' }}
                                        onClick={() => setSelectedImage(src || null)}
                                    />
                                );
                            },
                            del: ({ node, ...props }) => <span style={{ color: '#ca8a04', fontWeight: '800' }} {...props} />
                        }}
                    >
                        {post.content}
                    </ReactMarkdown>
                </article>

                <div className="copy-container">
                    <button
                        onClick={handleCopy}
                        className={`copy-button ${copied ? 'success' : ''}`}
                    >
                        {copied ? <Check size={16} /> : <Link2 size={16} />}
                        <span>{copied ? t.share.copied : t.share.copy}</span>
                    </button>
                </div>

                <CommentSection postSlug={slug as string} lang={lang} />

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

            <div className="fab-container">
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className={`fab-button ${showTop ? 'visible' : ''}`}
                    aria-label="Scroll to top"
                >
                    <ArrowUp size={20} />
                </button>
                <button
                    onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })}
                    className={`fab-button ${showBottom ? 'visible' : ''}`}
                    aria-label="Scroll to bottom"
                >
                    <ArrowDown size={20} />
                </button>
            </div>
        </>
    );
}
