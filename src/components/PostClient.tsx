'use client';

import React, { useState, useEffect, useLayoutEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { ChevronLeft, Github, Youtube, ArrowUp, ArrowDown, X, Link2, Check, Edit, ThumbsUp, Coffee } from 'lucide-react';
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
import FloatingMusicButton from './FloatingMusicButton';

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
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [isHighlighting, setIsHighlighting] = useState(false);
    const [activeHash, setActiveHash] = useState<string | null>(null);
    const [currentHash, setCurrentHash] = useState<string>('');
    const [focusedHashes, setFocusedHashes] = useState<string[]>([]);
    const [voted, setVoted] = useState<'LIKE' | 'DISLIKE' | null>(null);
    const t = translations[lang];
    const subjectSlugs = [
        'sistemas-operativos-1', 'ingles-1', 'gsi', 'algebra-1', 'analisis-1',
        'aprobar-sistemas-operativos-1', 'aprobar-ingles-1', 'aprobar-gsi', 'aprobar-algebra-1', 'aprobar-analisis-1'
    ];
    const owaspSlugs = ['owasp-top-10', ...Array.from({ length: 10 }, (_, i) => `owasp-${i + 1}`)];



    // Sync state with props when server revalidates
    useEffect(() => {
        setPost(initialPost);
    }, [initialPost]);

    useEffect(() => {
        if (session?.user?.id && post?.votes && Array.isArray(post.votes)) {
            const userVote = post.votes.find((v: any) => v.userId === session.user.id);
            setVoted(userVote?.type || null);
        }
    }, [session, post?.votes]);

    const [isPending, startTransition] = React.useTransition();

    const handleVote = async (type: 'LIKE') => {
        if (!session) {
            toast.error(lang === 'es' ? 'Iniciá sesión para votar' : 'Log in to vote');
            return;
        }

        // Safe access to votes array
        const currentVotes = Array.isArray(post.votes) ? post.votes : [];
        const isRemoving = voted === type;
        setVoted(isRemoving ? null : type);

        // Build optimistic votes array safely
        const newVotes = isRemoving
            ? currentVotes.filter((v: any) => v.userId !== session.user.id)
            : [...currentVotes.filter((v: any) => v.userId !== session.user.id), { userId: session.user.id, type }];

        setPost({ ...post, votes: newVotes });

        startTransition(async () => {
            try {
                const result = await votePost(type, post.id, slug);
                if (result?.error) {
                    toast.error(result.error);
                    setPost(initialPost);
                    const safeInitialVotes = Array.isArray(initialPost.votes) ? initialPost.votes : [];
                    setVoted(safeInitialVotes.find((v: any) => v.userId === session.user.id)?.type || null);
                }
            } catch (err) {
                toast.error('Error al votar');
                setPost(initialPost);
            }
        });
    };

    const likes = (Array.isArray(post.votes) ? post.votes : []).filter((v: any) => v.type === 'LIKE').length;

    const getLocalizedField = (field: any) => {
        if (!field) return '';
        if (typeof field === 'string') return field;
        const val = field[lang] || field['es'] || field['en'] || '';
        return String(val);
    };

    const postTitle = getLocalizedField(post.title);
    const postContent = getLocalizedField(post.content);
    const postDescription = getLocalizedField(post.description);

    // FIX: Robustly wrap plain text URLs containing underscores in < > to prevent Markdown italics
    const processedContent = String(postContent)
        .replace(/(^|\s)(https?:\/\/[^\s<*>]*_[^\s<*>]*)/g, '$1<$2>')
        .replace(/([.:;])\s+-\s/g, '$1\n- ');

    const slugify = (text: any) => {
        const str = String(text || '');
        return str
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
        const content = String(postContent || '');
        const trimmed = content.trim();
        if (trimmed.startsWith('# ')) return content;
        return `# ${postTitle}\n\n${content}`;
    };

    const fullContent = getFullContent();

    const getToc = (content: any) => {
        const str = String(content || '');
        const lines = str.split('\n');
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
    const hasVisibleTocItems = toc.some(t => t.level > 1);

    const handleCopy = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };


    useEffect(() => {
        const handleHash = () => {
            const hash = window.location.hash;
            setCurrentHash(hash);
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
                const hashes: string[] = [activeHash];
                const currentLevel = parseInt(element.tagName.replace('H', '')) || 6;
                let next = element.nextElementSibling;
                
                const isStopHeading = (tagName: string) => {
                    if (!tagName.startsWith('H')) return false;
                    const level = parseInt(tagName.replace('H', ''));
                    return level <= currentLevel;
                };

                while (next && !isStopHeading(next.tagName) && next.tagName !== 'FOOTER' && !next.classList.contains('footer-main') && !next.classList.contains('copy-container')) {
                    elements.push(next as HTMLElement);
                    if (next.tagName.startsWith('H') && next.id) {
                        hashes.push(next.id);
                    }
                    next = next.nextElementSibling;
                }

                // Also highlight parent headings (e.g. if H3 is focused, highlight its H2 parent)
                let prev = element.previousElementSibling;
                let currentSearchLevel = currentLevel;
                while (prev) {
                    if (prev.tagName.startsWith('H')) {
                        const level = parseInt(prev.tagName.replace('H', ''));
                        if (level < currentSearchLevel) {
                            elements.push(prev as HTMLElement);
                            if (prev.id) hashes.push(prev.id);
                            currentSearchLevel = level;
                            if (level === 1) break; // Reached the top heading
                        }
                    }
                    prev = prev.previousElementSibling;
                }

                elements.forEach(el => el.classList.add('section-focus'));
                setFocusedHashes(hashes);
            } else {
                setFocusedHashes([]);
            }
        } else {
            setFocusedHashes([]);
        }
    }, [activeHash]);

    useEffect(() => {
        if (currentHash) {
            setTimeout(() => {
                const activeTocItem = document.querySelector('.desktop-toc a.active-toc-item');
                if (activeTocItem) {
                    activeTocItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 100);
        }
    }, [currentHash]);

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

    const markdownComponents = React.useMemo(() => ({
        a: ({ node, ...props }: any) => {
            // Manually fix trailing underscores in URLs caught by the parser
            let href = props.href || '';
            const childrenText = String(props.children || '');
            if (childrenText.startsWith('http') && childrenText.endsWith('_') && !href.endsWith('_')) {
                href = childrenText;
            }
            return <a {...props} href={href} target="_blank" rel="noopener noreferrer" />;
        },
        h1: (props: any) => <Heading level={1} {...props} />,
        h2: (props: any) => <Heading level={2} {...props} />,
        h3: (props: any) => <Heading level={3} {...props} />,
        h4: (props: any) => <Heading level={4} {...props} />,
        h5: (props: any) => <Heading level={5} {...props} />,
        h6: (props: any) => <Heading level={6} {...props} />,
        ul: ({ node, ...props }: any) => <ul style={{ paddingLeft: '2rem', marginBottom: '2rem', listStyleType: 'disc', display: 'block' }} {...props} />,
        ol: ({ node, ...props }: any) => <ol style={{ paddingLeft: '2rem', marginBottom: '2rem', listStyleType: 'decimal', display: 'block' }} {...props} />,
        li: ({ node, ...props }: any) => <li style={{ lineHeight: '1.8', color: '#1e293b', marginBottom: '1rem', paddingLeft: '0.5rem' }} {...props} />,
        img: ({ node, ...props }: any) => {
            if (props.alt === 'youtube' && props.src) {
                let videoId = '';
                const src = props.src as string;
                if (src.includes('youtube.com/watch?v=')) {
                    videoId = src.split('v=')[1].split('&')[0];
                } else if (src.includes('youtu.be/')) {
                    videoId = src.split('youtu.be/')[1].split('?')[0];
                } else if (src.includes('youtube.com/shorts/')) {
                    videoId = src.split('youtube.com/shorts/')[1].split('?')[0];
                }
                if (videoId) {
                    return (
                        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '16px', margin: '2rem 0', border: '1px solid rgba(0,0,0,0.1)' }}>
                            <iframe 
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />
                        </div>
                    );
                }
            }
            return <img {...props} style={{ cursor: 'zoom-in' }} onClick={() => setSelectedImage((props.src as string) || null)} />;
        },
        del: ({ node, ...props }: any) => <span style={{ color: '#ca8a04', fontWeight: '800' }} {...props} />
    }), [activeHash, setSelectedImage]);

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

            <div className={`container fade-in post-container ${isHighlighting ? 'highlight-active' : ''} ${post.unlisted ? 'is-blog-post' : ''}`}>
                <CountdownWidget countdowns={post?.countdowns} />
                <NotificationBanners limitTo={
                    slug.includes('mate') ? 'mate' : slug.includes('ivu') ? 'ivu' : slug.includes('codeforces') ? 'none' : 'all'
                } />
                <div className="nav-header-row">
                    {post.unlisted ? (
                        <Link href={lang === 'en' ? "/en/blog" : lang === 'pt' ? "/pt/blog" : "/blog"} className="back-link"><ChevronLeft size={16} />{t.backToBlog}</Link>
                    ) : (
                        <Link href={lang === 'en' ? "/en" : lang === 'pt' ? "/pt" : "/"} className="back-link"><ChevronLeft size={16} />{t.back}</Link>
                    )}
                    <div className="mobile-only">
                        <LanguageSwitcher availableLangs={Object.keys(post.title as any).filter(l => (post.title as any)[l] && (post.content as any)[l])} />
                    </div>
                </div>

                <div className="post-body-layout">
                    <article className={`post-content ${isHighlighting ? 'highlight-active' : ''}`}>
                        <div className="post-date-container" style={{ justifyContent: 'space-between', width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                <span className="post-date" style={{ margin: 0 }} suppressHydrationWarning>
                                    <span className="last-updated" style={{ fontSize: '0.85rem', opacity: 0.7, fontWeight: 500 }} suppressHydrationWarning>
                                        {post.unlisted ? (
                                            <>{new Date(post.date).toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</>
                                        ) : (
                                            <>{lang === 'es' ? 'Última actualización' : lang === 'pt' ? 'Última atualização' : 'Last update'}: {timeAgo(post.updatedAt || post.date, lang)}</>
                                        )}
                                    </span>
                                </span>
                                {session?.user?.role === 'admin' && post.id && (
                                    <Link href={post.unlisted ? `/editor/posts/${post.id}` : `/admin/posts/${post.id}`} target="_blank" rel="noreferrer" className="admin-edit-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', background: '#f8fafc', color: '#64748b', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0', textDecoration: 'none' }}>
                                        <Edit size={12} /><span>Editar</span>
                                    </Link>
                                )}
                            </div>
                            <div className="mobile-hide">
                                <LanguageSwitcher availableLangs={Object.keys(post.title as any).filter(l => (post.title as any)[l] && (post.content as any)[l])} />
                            </div>
                        </div>

                        <Heading level={1}>{postTitle}</Heading>
                        {postDescription && (
                            <p style={{ fontSize: '1.25rem', color: '#64748b', marginTop: '-1rem', marginBottom: '2rem', lineHeight: '1.6', fontWeight: 500 }}>
                                {postDescription}
                            </p>
                        )}

                        <div className="mobile-only-countdown"><CountdownWidget countdowns={post?.countdowns} isInline /></div>

                        {hasVisibleTocItems && (
                            <nav className="post-toc mobile-toc">
                                <h3>{t.post.index}</h3>
                                <ul>
                                    {toc.map((header, i) => <li key={i} className={`toc-level-${header.level}`}><a href={`#${header.id}`} className={(currentHash === `#${header.id}` || focusedHashes.includes(header.id)) ? 'active-toc-item' : ''}>{header.text}</a></li>)}
                                    <li className="toc-level-2"><a href="#comments" className={currentHash === '#comments' ? 'active-toc-item' : ''}>💬 {lang === 'es' ? 'Comentarios' : lang === 'pt' ? 'Comentários' : 'Comments'}</a></li>
                                </ul>
                            </nav>
                        )}

                        <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkBreaks]}
                            components={markdownComponents}
                        >
                            {(() => {
                                const trimmed = processedContent.trim();
                                if (trimmed.startsWith('# ')) return trimmed.replace(/^# .*\n?/, '');
                                return processedContent;
                            })()}
                        </ReactMarkdown>
                    </article>

                    {hasVisibleTocItems && (
                        <aside className="post-sidebar">
                            <nav className="post-toc desktop-toc">
                                <h3>{t.post.index}</h3>
                                <ul>
                                    {toc.map((header, i) => <li key={i} className={`toc-level-${header.level}`}><a href={`#${header.id}`} className={(currentHash === `#${header.id}` || focusedHashes.includes(header.id)) ? 'active-toc-item' : ''}>{header.text}</a></li>)}
                                    {!post.unlisted && (
                                        <li className="toc-level-2" style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '0.5rem' }}>
                                            <a href="#comments" className={currentHash === '#comments' ? 'active-toc-item' : ''} style={{ fontWeight: '700', color: '#64748b' }}>💬 {lang === 'es' ? 'Comentarios' : lang === 'pt' ? 'Comentários' : 'Comments'}</a>
                                        </li>
                                    )}
                                </ul>
                            </nav>
                        </aside>
                    )}
                </div>

                <div className="copy-container" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    {!post.unlisted && (
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
                    )}
                    <button onClick={handleCopy} className={`copy-button ${copied ? 'success' : ''}`}>
                        {copied ? <Check size={16} /> : <Link2 size={16} />}
                        <span>{copied ? t.share.copied : t.share.copy}</span>
                    </button>
                </div>

                {!post.unlisted && <CommentSection postSlug={slug} lang={lang} />}

                <footer className="footer-main">
                    <a href="https://cafecito.app/gonzagramaglia" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}><Coffee size={18} /></a>
                    <span>{t.footer}</span>
                    <a href="https://youtu.be/Sdz38CpLrUs" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}><Youtube size={22} /></a>
                </footer>
            </div>


            {subjectSlugs.includes(slug) && (
                <div className="subject-navigator">
                    {[
                        { id: '01', slugs: ['analisis-1', 'aprobar-analisis-1'] },
                        { id: '02', slugs: ['algebra-1', 'aprobar-algebra-1'] },
                        { id: '03', slugs: ['gsi', 'aprobar-gsi'] },
                        { id: '04', slugs: ['ingles-1', 'aprobar-ingles-1'] },
                        { id: '05', slugs: ['sistemas-operativos-1', 'aprobar-sistemas-operativos-1'] }
                    ].map((s) => (
                        <Link
                            key={s.id}
                            href={`/${lang === 'es' ? s.slugs[0] : s.slugs[1]}${currentHash}`}
                            className={`subject-nav-item ${s.slugs.includes(slug) ? 'active' : ''}`}
                        >
                            {s.id}
                        </Link>
                    ))}
                </div>
            )}

            {owaspSlugs.includes(slug) && (
                <div className="subject-navigator">
                    {Array.from({ length: 10 }, (_, i) => {
                        const num = i + 1;
                        const id = num.toString().padStart(2, '0');
                        const sSlug = `owasp-${num}`;
                        
                        return (
                            <Link
                                key={id}
                                href={`/blog/${sSlug}${currentHash}`}
                                className={`subject-nav-item ${slug === sSlug ? 'active' : ''}`}
                            >
                                {id}
                            </Link>
                        );
                    }).reverse()}
                    <Link
                        key="00"
                        href={`/blog/owasp-top-10${currentHash}`}
                        className={`subject-nav-item ${slug === 'owasp-top-10' ? 'active' : ''}`}
                    >
                        00
                    </Link>
                </div>
            )}

            {(!post.unlisted || owaspSlugs.includes(slug)) && <FloatingMusicButton hideOnMobile isOwasp={owaspSlugs.includes(slug)} />}
            <style jsx global>{`
                .post-container.highlight-active :global(.nav-header-row),
                .post-container.highlight-active :global(.footer-main),
                .post-container.highlight-active :global(.post-sidebar h3),
                .post-container.highlight-active :global(.post-sidebar a:not(.active-toc-item)),
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
                :global(.is-blog-post h1.section-focus),
                :global(.is-blog-post h2.section-focus),
                :global(.is-blog-post h3.section-focus),
                :global(.is-blog-post h4.section-focus),
                :global(.is-blog-post h5.section-focus),
                :global(.is-blog-post h6.section-focus) {
                    color: #eab308 !important;
                }
                :global(.section-focus a) {
                    color: #eab308 !important;
                }
                .post-content { transition: all 0.6s ease; }
                .subject-navigator { position: fixed; left: 2.5rem; bottom: 3.5rem; display: flex; flex-direction: column-reverse; gap: 1rem; z-index: 1000; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
                .subject-nav-item { width: 62px; height: 62px; border-radius: 50%; background: #ffffff; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); color: #1e293b; font-weight: 900; font-size: 1.3rem; text-decoration: none; opacity: 0.8; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .subject-nav-item.active { background: #fff; border: 2px solid var(--accent); color: var(--accent); box-shadow: 0 0 20px rgba(0, 112, 243, 0.15); pointer-events: none; opacity: 1; }
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

                @media (max-width: 1700px) {
                    .subject-navigator { 
                        left: 50%; 
                        bottom: 2.5rem; 
                        transform: translateX(-50%); 
                        flex-direction: row-reverse; 
                        gap: 0.6rem; 
                        flex-wrap: wrap-reverse;
                        justify-content: center;
                        width: max-content;
                        max-width: 95vw;
                    }
                    .subject-nav-item {
                        width: 52px;
                        height: 52px;
                        font-size: 1.1rem;
                    }
                }
                @media (max-width: 640px) {
                    .subject-navigator {
                        bottom: 1.5rem;
                        gap: 0.4rem;
                    }
                    .subject-nav-item {
                        width: 42px;
                        height: 42px;
                        font-size: 0.9rem;
                    }
                }
                @media (max-width: 1700px) { .fab-container { display: none !important; } }
            `}</style>
        </>
    );
}
