'use client';

import React, { useState, useEffect, useLayoutEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronLeft, Github, Youtube, ArrowUp, ArrowDown, X, Link2, Check, Edit, ClipboardClock, ThumbsUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../lib/translations';
import { useSession } from 'next-auth/react';
import LanguageSwitcher from './LanguageSwitcher';
import { timeAgo } from '../lib/utils';
import NotificationBanners from './NotificationBanners';
import CommentSection from './CommentSection';
import CountdownWidget from './CountdownWidget';
import { votePost } from '../lib/actions';
import { toast } from 'react-hot-toast';

interface PostClientProps {
  post: any;
  slug: string;
  session: any;
}

export default function PostClient({ post: initialPost, slug, session: initialSession }: PostClientProps) {
    const { lang } = useLanguage();
    const [post, setPost] = useState(initialPost);
    const { data: sessionData } = useSession();
    const session = initialSession || sessionData;
    const [showTop, setShowTop] = useState(false);
    const [showBottom, setShowBottom] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [isHighlighting, setIsHighlighting] = useState(false);
    const [activeHash, setActiveHash] = useState<string | null>(null);
    const [voted, setVoted] = useState<'LIKE' | 'DISLIKE' | null>(null);
    const t = translations[lang];
    const subjectSlugs = ['sistemas-operativos-1', 'ingles-1', 'gsi', 'algebra-1', 'analisis-1'];

    useEffect(() => {
        if (session?.user?.id && post.votes) {
            const userVote = post.votes.find((v: any) => v.userId === session.user.id);
            setVoted(userVote?.type || null);
        }
    }, [session, post.votes]);

    const handleVote = async (type: 'LIKE') => {
        if (!session) {
            toast.error(lang === 'es' ? 'Iniciá sesión para votar' : 'Log in to vote');
            return;
        }

        try {
            await votePost(type, post.id, slug);
            setVoted(current => current === type ? null : type);
        } catch (err) {
            toast.error('Error al votar');
        }
    };

    const likes = post.votes?.filter((v: any) => v.type === 'LIKE').length || 0;

    const getLocalizedField = (field: any) => {
        if (!field) return '';
        if (typeof field === 'string') return field;
        return field[lang] || field['es'] || field['en'] || '';
    };

    const postTitle = getLocalizedField(post.title);
    const postContent = getLocalizedField(post.content);

    // FIX: Automatically wrap URLs ending with underscores in < > to prevent Markdown from cutting them
    const processedContent = postContent
        .replace(/(\*\*)(https?:\/\/[^\s*]+_)(\*\*)/g, '$1<$2>$3')
        .replace(/([^\(<]|^)(https?:\/\/[^\s<*]+_)([^\)>*]|$)/g, '$1<$2>$3');

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
        const trimmed = postContent.trim();
        if (trimmed.startsWith('# ')) return postContent;
        return `# ${postTitle}\n\n${postContent}`;
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
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleHash = () => {
            const hash = window.location.hash;
            if (hash) {
                const id = decodeURIComponent(hash.substring(1));
                setTimeout(() => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                        if (window.innerWidth >= 1024) {
                            setActiveHash(id);
                            setIsHighlighting(true);
                            setTimeout(() => setIsHighlighting(false), 800);
                        }
                    }
                }, 350);
            }
        };
        handleHash();
        window.addEventListener('hashchange', handleHash);
        return () => window.removeEventListener('hashchange', handleHash);
    }, []);

    useLayoutEffect(() => {
        document.querySelectorAll('.section-focus').forEach(el => {
            if (!el.tagName.startsWith('H')) el.classList.remove('section-focus');
        });
        if (activeHash) {
            const element = document.getElementById(activeHash);
            if (element) {
                const elements: HTMLElement[] = [];
                let next = element.nextElementSibling;
                while (next && !['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(next.tagName) && next.tagName !== 'FOOTER' && !next.classList.contains('footer-main') && !next.classList.contains('copy-container')) {
                    elements.push(next as HTMLElement);
                    next = next.nextElementSibling;
                }
                elements.forEach(el => el.classList.add('section-focus'));
            }
        }
    }, [activeHash]);

    useEffect(() => {
        if (selectedImage) document.body.classList.add('lightbox-open');
        else document.body.classList.remove('lightbox-open');
        return () => document.body.classList.remove('lightbox-open');
    }, [selectedImage]);

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
        const isActive = activeHash === id;
        const style = level === 1 ? { display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' } : {};
        if (level === 1) return <Tag id={id} {...props} style={style} className={isActive ? 'section-focus' : ''}>{children}</Tag>;
        return (
            <Tag id={id} {...props} className={`post-header-anchor ${isActive ? 'section-focus' : ''}`} style={style}>
                {children}
                <a href={`#${id}`} className="header-anchor-link"><Link2 size={18} strokeWidth={3} /></a>
            </Tag>
        );
    };

    return (
        <>
            {selectedImage && (
                <div className="lightbox-overlay" style={{ zIndex: 9999 }} onClick={() => setSelectedImage(null)}>
                    <div className="lightbox-content">
                        <button className="lightbox-close" onClick={() => setSelectedImage(null)}><X size={24} /></button>
                        <img src={selectedImage} alt="Enlarged view" style={{ cursor: 'zoom-out' }} />
                    </div>
                </div>
            )}

            <div className={`container fade-in post-container ${isHighlighting ? 'highlight-active' : ''}`}>
                <CountdownWidget countdowns={post?.countdowns} />
                <NotificationBanners limitTo={
                    slug.includes('mate') ? 'mate' : slug.includes('ivu') ? 'ivu' : slug.includes('codeforces') ? 'none' : 'all'
                } />
                <div className="nav-header-row">
                    <Link href="/" className="back-link"><ChevronLeft size={16} />{t.back}</Link>
                    <LanguageSwitcher availableLangs={Object.keys(post.title as any).filter(l => (post.title as any)[l] && (post.content as any)[l])} />
                </div>

                <div className="post-body-layout">
                    <article className={`post-content ${isHighlighting ? 'highlight-active' : ''}`}>
                        <div className="mobile-only-countdown"><CountdownWidget countdowns={post?.countdowns} isInline /></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                            <span className="post-date" style={{ margin: 0 }}>
                                {new Date(post.date).toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                                {post.updatedAt && (
                                    <span className="last-updated" style={{ fontSize: '0.85rem', opacity: 0.7, fontWeight: 500, marginLeft: '0.5rem' }}>
                                        ({lang === 'es' ? 'Última actualización' : lang === 'pt' ? 'Última actualización' : 'Last update'}: {timeAgo(post.updatedAt, lang)})
                                    </span>
                                )}
                            </span>
                            {session?.user?.role === 'admin' && post.id && (
                                <Link href={`/admin/posts/${post.id}`} target="_blank" rel="noreferrer" className="admin-edit-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', background: '#f8fafc', color: '#64748b', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0', textDecoration: 'none' }}>
                                    <Edit size={12} /><span>Editar</span>
                                </Link>
                            )}
                        </div>

                        <Heading level={1}>{postTitle}</Heading>

                        {toc.length > 2 && (
                            <nav className="post-toc mobile-toc">
                                <h3>{t.post.index}</h3>
                                <ul>
                                    {toc.map((header, i) => <li key={i} className={`toc-level-${header.level}`}><a href={`#${header.id}`}>{header.text}</a></li>)}
                                    <li className="toc-level-2"><a href="#comments">💬 {lang === 'es' ? 'Comentarios' : lang === 'pt' ? 'Comentários' : 'Comments'}</a></li>
                                </ul>
                            </nav>
                        )}

                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                a: ({ node, ...props }) => {
                                    // Manually fix trailing underscores in URLs caught by the parser
                                    const href = props.href || '';
                                    return <a {...props} href={href} target="_blank" rel="noopener noreferrer" />;
                                },
                                h1: (props) => <Heading level={1} {...props} />,
                                h2: (props) => <Heading level={2} {...props} />,
                                h3: (props) => <Heading level={3} {...props} />,
                                h4: (props) => <Heading level={4} {...props} />,
                                h5: (props) => <Heading level={5} {...props} />,
                                h6: (props) => <Heading level={6} {...props} />,
                                img: ({ node, ...props }) => <img {...props} style={{ cursor: 'zoom-in' }} onClick={() => setSelectedImage((props.src as string) || null)} />,
                                del: ({ node, ...props }) => <span style={{ color: '#ca8a04', fontWeight: '800' }} {...props} />
                            }}
                        >
                            {(() => {
                                const trimmed = processedContent.trim();
                                if (trimmed.startsWith('# ')) return trimmed.replace(/^# .*\n?/, '');
                                return processedContent;
                            })()}
                        </ReactMarkdown>
                    </article>

                    {toc.length > 2 && (
                        <aside className="post-sidebar">
                            <nav className="post-toc desktop-toc">
                                <h3>{t.post.index}</h3>
                                <ul>
                                    {toc.map((header, i) => <li key={i} className={`toc-level-${header.level}`}><a href={`#${header.id}`}>{header.text}</a></li>)}
                                    <li className="toc-level-2" style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '0.5rem' }}>
                                        <a href="#comments" style={{ fontWeight: '700', color: '#64748b' }}>💬 {lang === 'es' ? 'Comentarios' : lang === 'pt' ? 'Comentários' : 'Comments'}</a>
                                    </li>
                                </ul>
                            </nav>
                        </aside>
                    )}
                </div>

                <div className="copy-container" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    <div className="vote-buttons" style={{ display: 'flex', gap: '0.4rem' }}>
                        <button 
                            onClick={() => handleVote('LIKE')} 
                            className={`vote-button like ${voted === 'LIKE' ? 'active' : ''}`}
                            title={lang === 'es' ? 'Me gusta' : 'Like'}
                        >
                            <ThumbsUp size={18} fill={voted === 'LIKE' ? 'currentColor' : 'none'} />
                            <span>{likes}</span>
                        </button>
                    </div>
                    <button onClick={handleCopy} className={`copy-button ${copied ? 'success' : ''}`}>
                        {copied ? <Check size={16} /> : <Link2 size={16} />}
                        <span>{copied ? t.share.copied : t.share.copy}</span>
                    </button>
                </div>

                <CommentSection postSlug={slug} lang={lang} />

                <footer className="footer-main">
                    <a href="https://github.com/gonzalogramagia/ciberportero" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}><Github size={18} /></a>
                    <span>{t.footer}</span>
                    <a href="https://youtu.be/Sdz38CpLrUs" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}><Youtube size={22} /></a>
                </footer>
            </div>

            <div className="fab-container">
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={`fab-button ${showTop ? 'visible' : ''}`} aria-label="Scroll to top"><ArrowUp size={20} /></button>
                <button onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })} className={`fab-button ${showBottom ? 'visible' : ''}`} aria-label="Scroll to bottom"><ArrowDown size={20} /></button>
            </div>

            {subjectSlugs.includes(slug) && (
                <div className="subject-navigator">
                    {[{ id: '05', slug: 'sistemas-operativos-1' }, { id: '04', slug: 'ingles-1' }, { id: '03', slug: 'gsi' }, { id: '02', slug: 'algebra-1' }, { id: '01', slug: 'analisis-1' }].map((s) => (
                        <Link key={s.id} href={`/${s.slug}`} className={`subject-nav-item ${slug === s.slug ? 'active' : ''}`}>{s.id}</Link>
                    ))}
                </div>
            )}

            <a href={lang === 'en' ? 'https://hoy.today/en' : 'https://hoy.today'} target="_blank" rel="noopener noreferrer" className="hoy-today-link"><ClipboardClock size={28} /></a>
            <style jsx global>{`
                .post-container.highlight-active :global(.nav-header-row),
                .post-container.highlight-active :global(.footer-main),
                .post-container.highlight-active :global(.post-sidebar),
                .post-container.highlight-active :global(.post-date),
                .post-container.highlight-active :global(.admin-edit-badge),
                .post-container.highlight-active :global(.copy-container),
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
                    z-index: 100 !important;
                    opacity: 1 !important;
                    filter: none !important;
                    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                    transform: scale(1.01) translateX(10px);
                    background: white;
                    padding: 0.5rem 1rem;
                    margin-left: -1rem;
                    border-radius: 12px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.05);
                }
                .post-content { transition: all 0.6s ease; }
                .subject-navigator { position: fixed; left: 4.5rem; bottom: 3.5rem; display: flex; flex-direction: column; gap: 1rem; z-index: 1000; }
                .subject-navigator:hover .subject-nav-item { opacity: 0.3 !important; }
                .subject-navigator .subject-nav-item:hover { opacity: 1 !important; }
                .subject-nav-item { width: 62px; height: 62px; border-radius: 50%; background: #ffffff; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); color: #1e293b; font-weight: 900; font-size: 1.3rem; text-decoration: none; opacity: 0.8; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .subject-nav-item.active { background: #f1f5f9; box-shadow: none; color: #cbd5e1; pointer-events: none; }
                .subject-nav-item:not(.active):hover { background: #facc15 !important; color: #000 !important; box-shadow: 0 15px 30px rgba(250, 204, 21, 0.3) !important; border-color: #facc15 !important; opacity: 1 !important; }
                .hoy-today-link { position: fixed; right: 4.5rem; bottom: 3.5rem; width: 62px; height: 62px; border-radius: 50%; background: #ffffff; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); color: #1e293b; z-index: 1000; opacity: 0.8; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); text-decoration: none; }
                .copy-button:hover { background: #f8fafc; border-color: #cbd5e1; transform: translateY(-1px); }
                .copy-button.success { background: #f0fdf4; border-color: #4ade80; color: #166534; }
                
                .vote-button {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1.25rem;
                    border-radius: 14px;
                    border: 1px solid #e2e8f0;
                    background: #fff;
                    color: #64748b;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .vote-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                .vote-button.like:hover, .vote-button.like.active {
                    border-color: #22c55e;
                    color: #22c55e;
                    background: #f0fdf4;
                }
                .vote-button.dislike:hover, .vote-button.dislike.active {
                    border-color: #ef4444;
                    color: #ef4444;
                    background: #fef2f2;
                }
                .vote-button span { font-size: 0.9rem; }

                @media (max-width: 1024px) { .subject-navigator, .hoy-today-link { display: none !important; } }
                @media (min-width: 1025px) { .fab-container { display: none !important; } }
                .hoy-today-link:hover :global(svg) { opacity: 1 !important; }
            `}</style>
        </>
    );
}
