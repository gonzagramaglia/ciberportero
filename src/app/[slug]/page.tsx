'use client';

import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { ChevronLeft, Github, Youtube, ArrowUp, ArrowDown, X } from 'lucide-react';
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
    const [showTop, setShowTop] = useState(false);
    const [showBottom, setShowBottom] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const t = translations[lang];

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

    if (loading) return <div className="container fade-in"></div>;
    if (!post) return notFound();

    return (
        <>
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
                            a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                            img: ({ node, ...props }) => (
                                <img
                                    {...props}
                                    style={{ cursor: 'zoom-in' }}
                                    onClick={() => setSelectedImage((props.src as string) || null)}
                                />
                            )
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
