'use client';

import React, { useState, useEffect } from 'react';

import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronLeft, Github, Youtube, ArrowUp, ArrowDown, X, Link2, Check, Edit } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../lib/translations';
import { PostData } from '../../lib/posts-client';
import { useParams, notFound } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { timeAgo } from '../../lib/utils';

import NotificationBanners from '../../components/NotificationBanners';
import CommentSection from '../../components/CommentSection';
import CountdownWidget from '../../components/CountdownWidget';

export default function Post() {
    const { slug } = useParams();
    const { lang } = useLanguage();
    const [post, setPost] = useState<PostData | null>(null);
    const [loading, setLoading] = useState(true);
    const subjectSlugs = ['sistemas-operativos-1', 'ingles-1', 'gsi', 'algebra-1', 'analisis-1'];
    const [showTop, setShowTop] = useState(false);
    const [showBottom, setShowBottom] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [isHighlighting, setIsHighlighting] = useState(false);
    const { data: session } = useSession();
    const t = translations[lang];

    const slugify = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    };

    const getFullContent = () => {
        if (!post) return '';
        const trimmed = post.content.trim();
        if (trimmed.startsWith('# ')) return post.content;
        return `# ${post.title}\n\n${post.content}`;
    };

    const fullContent = getFullContent();

    const getToc = (content: string) => {
        const lines = content.split('\n');
        const headers: { level: number; text: string; id: string }[] = [];
        let inCodeBlock = false;

        lines.forEach(line => {
            if (line.startsWith('```')) {
                inCodeBlock = !inCodeBlock;
                return;
            }
            if (inCodeBlock) return;

            const match = line.match(/^(#{1,6})\s+(.+)$/);
            if (match) {
                const level = match[1].length;
                const text = match[2];
                // Remove potential markdown formatting from TOC text
                const cleanText = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').replace(/[*_~`]/g, '');
                headers.push({
                    level,
                    text: cleanText,
                    id: slugify(cleanText)
                });
            }
        });
        return headers;
    };

    const toc = getToc(fullContent);

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

    useEffect(() => {
        if (!loading && post) {
            const handleHash = () => {
                const hash = window.location.hash;
                if (hash) {
                    const id = decodeURIComponent(hash.substring(1));
                    const timer = setTimeout(() => {
                        const element = document.getElementById(id);
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                            
                            // Highlight effect for large screens
                            if (window.innerWidth >= 1024) {
                                const elementsToHighlight: HTMLElement[] = [element];
                                let next = element.nextElementSibling;
                                while (next && !['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(next.tagName)) {
                                    elementsToHighlight.push(next as HTMLElement);
                                    next = next.nextElementSibling;
                                }

                                setIsHighlighting(true);
                                elementsToHighlight.forEach(el => el.classList.add('section-focus'));
                                
                                setTimeout(() => {
                                    setIsHighlighting(false);
                                    setTimeout(() => {
                                        elementsToHighlight.forEach(el => el.classList.remove('section-focus'));
                                    }, 600); // Wait for fade out transition
                                }, 1200);
                            }
                        }
                    }, 300);
                    return () => clearTimeout(timer);
                }
            };

            // Run on initial load
            handleHash();

            // Listen for hash changes
            window.addEventListener('hashchange', handleHash);
            return () => window.removeEventListener('hashchange', handleHash);
        }
    }, [loading, post]);

    if (loading) return <div className="container fade-in"></div>;
    if (!post) return notFound();

    const Heading = ({ level, children, ...props }: any) => {
        const extractText = (node: any): string => {
            if (typeof node === 'string') return node;
            if (Array.isArray(node)) return node.map(extractText).join('');
            if (node?.props?.children) return extractText(node.props.children);
            return '';
        };

        const text = extractText(children);
        const id = slugify(text);
        const Tag = `h${level}` as any;
        const style = level === 1 ? { display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' } : {};

        if (level === 1) {
            return (
                <Tag id={id} {...props} style={style}>
                    {children}
                </Tag>
            );
        }

        return (
            <Tag id={id} {...props} className="post-header-anchor" style={style}>
                {children}
                <a href={`#${id}`} className="header-anchor-link">
                    <Link2 size={18} strokeWidth={3} />
                </a>
            </Tag>
        );
    };

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

            <div className={`container fade-in post-container ${isHighlighting ? 'highlight-active' : ''}`}>
                <CountdownWidget countdowns={post?.countdowns} />
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

                <div className="post-body-layout">
                    <article className={`post-content ${isHighlighting ? 'highlight-active' : ''}`}>
                        <div className="mobile-only-countdown">
                            <CountdownWidget countdowns={post?.countdowns} isInline />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                            <span className="post-date" style={{ margin: 0 }}>
                                {new Date(post.date).toLocaleDateString(lang, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    timeZone: 'UTC'
                                })}
                                {post.updatedAt && (
                                    <span className="last-updated" style={{ fontSize: '0.85rem', opacity: 0.7, fontWeight: 500, marginLeft: '0.5rem' }}>
                                        ({lang === 'es' ? 'Última actualización' : lang === 'pt' ? 'Última atualização' : 'Last update'}: {timeAgo(post.updatedAt, lang)})
                                    </span>
                                )}
                            </span>
                            {session?.user?.role === 'admin' && post.id && (
                                <Link
                                    href={`/admin/posts/${post.id}`}
                                    target="_blank"
                                    rel="noreferrer"
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

                        <Heading level={1}>{post.title}</Heading>

                        {toc.length > 2 && (
                            <nav className="post-toc mobile-toc">
                                <h3>{t.post.index}</h3>
                                <ul>
                                    {toc.map((header, i) => (
                                        <li key={i} className={`toc-level-${header.level}`}>
                                            <a href={`#${header.id}`}>{header.text}</a>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        )}

                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                                h1: (props) => <Heading level={1} {...props} />,
                                h2: (props) => <Heading level={2} {...props} />,
                                h3: (props) => <Heading level={3} {...props} />,
                                h4: (props) => <Heading level={4} {...props} />,
                                h5: (props) => <Heading level={5} {...props} />,
                                h6: (props) => <Heading level={6} {...props} />,
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
                            {(() => {
                                const trimmed = post.content.trim();
                                if (trimmed.startsWith('# ')) {
                                    // Remove the first H1 if it matches the title or is just the first line
                                    return trimmed.replace(/^# .*\n?/, '');
                                }
                                return post.content;
                            })()}
                        </ReactMarkdown>
                    </article>

                    {toc.length > 2 && (
                        <aside className="post-sidebar">
                            <nav className="post-toc desktop-toc">
                                <h3>{t.post.index}</h3>
                                <ul>
                                    {toc.map((header, i) => (
                                        <li key={i} className={`toc-level-${header.level}`}>
                                            <a href={`#${header.id}`}>{header.text}</a>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </aside>
                    )}
                </div>

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

            {subjectSlugs.includes(slug as string) && (
                <div className="subject-navigator">
                    {[
                        { id: '05', slug: 'sistemas-operativos-1' },
                        { id: '04', slug: 'ingles-1' },
                        { id: '03', slug: 'gsi' },
                        { id: '02', slug: 'algebra-1' },
                        { id: '01', slug: 'analisis-1' }
                    ].map((s) => (
                        <Link 
                            key={s.id} 
                            href={`/${s.slug}`} 
                            className={`subject-nav-item ${slug === s.slug ? 'active' : ''}`}
                            title={s.slug.replace(/-/g, ' ').toUpperCase()}
                        >
                            {s.id}
                        </Link>
                    ))}
                </div>
            )}
            <style jsx>{`
                /* Dim everything else when highlighting */
                .post-container.highlight-active :global(.nav-header-row),
                .post-container.highlight-active :global(.footer-main),
                .post-container.highlight-active :global(.post-sidebar),
                .post-container.highlight-active :global(.post-date),
                .post-container.highlight-active :global(.admin-edit-badge),
                .post-container.highlight-active :global(.copy-container),
                .post-container.highlight-active :global(.comments-container),
                .post-container.highlight-active :global(.countdown-widget-container) {
                    opacity: 0.1 !important;
                    filter: blur(2px) grayscale(1);
                    transition: all 0.6s ease;
                    pointer-events: none;
                }

                .post-content.highlight-active > :global(*:not(.section-focus)) {
                    opacity: 0.1 !important;
                    filter: blur(1.5px) grayscale(0.8);
                    transition: all 0.6s ease;
                    pointer-events: none;
                }

                :global(.section-focus) {
                    position: relative;
                    z-index: 100;
                    opacity: 1 !important;
                    filter: none !important;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    transform: scale(1.01) translateX(10px);
                    background: white;
                    padding: 0.5rem 1rem;
                    margin-left: -1rem;
                    border-radius: 12px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.05);
                }

                .post-content {
                    transition: all 0.6s ease;
                }

                .subject-navigator {
                    position: fixed;
                    right: 2rem;
                    top: 50%;
                    transform: translateY(-50%);
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    z-index: 100;
                }

                .subject-nav-item {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(8px);
                    border: 1px solid var(--border);
                    color: var(--muted);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    font-size: 0.8rem;
                    font-weight: 800;
                    text-decoration: none !important;
                }

                .subject-nav-item:hover {
                    background: white;
                    color: var(--accent);
                    border-color: var(--accent);
                    transform: scale(1.1);
                }

                .subject-nav-item.active {
                    background: var(--accent);
                    color: white;
                    border-color: var(--accent);
                    box-shadow: 0 8px 20px rgba(0, 112, 243, 0.3);
                }

                @media (max-width: 1024px) {
                    .subject-navigator {
                        display: none;
                    }
                }
            `}</style>
        </>
    );
}
