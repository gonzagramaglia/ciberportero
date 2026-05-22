import { Metadata } from 'next';
import { db } from "@/lib/db";
import { translations, Locale } from "@/lib/translations";
import { cookies } from "next/headers";
import Link from "next/link";
import { ChevronLeft, Calendar, User, Edit, Github, Youtube, ExternalLink, Disc3 } from "lucide-react";
import { notFound } from "next/navigation";
import PodcastPlayer from "@/components/PodcastPlayer";
import CommentSection from "@/components/CommentSection";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const cookieStore = await cookies();
    const lang = (cookieStore.get('lang')?.value as Locale) || 'es';

    const podcast = await db.podcast.findUnique({
        where: { slug }
    });

    if (!podcast) return { title: 'Podcast no encontrado' };

    const titleObj = podcast.title as any;
    const descObj = podcast.description as any;
    const title = titleObj[lang] || titleObj['es'] || titleObj['en'] || slug;
    const description = descObj?.[lang] || descObj?.['es'] || descObj?.['en'] || "";

    return {
        title: title,
        description: description.slice(0, 160),
        openGraph: {
            title,
            description,
            type: 'music.song',
            url: `https://ciberportero.com/podcast/${slug}`,
        }
    };
}

export default async function PodcastDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const session = await auth();
    const { slug } = await params;

    const cookieStore = await cookies();
    const lang = (cookieStore.get('lang')?.value as Locale) || 'es';
    const t = translations[lang];

    let podcast = null;
    try {
        podcast = await db.podcast.findUnique({
            where: { slug },
            include: {
                votes: true
            }
        });
    } catch (e) {
        console.error("Database connection failed:", e);
    }

    if (!podcast || !podcast.published) return notFound();

    const title = (podcast.title as any)[lang] || (podcast.title as any)['es'] || podcast.slug;
    const description = (podcast.description as any)[lang] || (podcast.description as any)['es'] || "";

    const likes = podcast.votes.filter((v: any) => v.type === 'LIKE').length;
    const dislikes = podcast.votes.filter((v: any) => v.type === 'DISLIKE').length;
    const userVote = session?.user?.id
        ? podcast.votes.find((v: any) => v.userId === session.user.id)?.type
        : null;

    return (
        <div className="container fade-in">
            <div className="nav-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', paddingTop: '1rem' }}>
                <Link href="/podcast" className="back-link" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    color: '#64748b',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '1rem'
                }}>
                    <ChevronLeft size={20} />
                    {lang === 'es' ? 'Volver a Podcast' : lang === 'pt' ? 'Voltar ao Podcast' : 'Back to Podcast'}
                </Link>
                <div style={{ width: '1px' }} />
            </div>

            <div className="podcast-main-layout">
                <div className="info-side">
                    <header style={{ marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <Calendar size={14} />
                                <span>
                                    {lang === 'es' ? 'Audio del ' : lang === 'pt' ? 'Áudio de ' : 'Audio from '}
                                    {new Date(podcast.date || podcast.createdAt).toLocaleDateString(lang, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                {podcast.subjectId && (
                                    <div style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 900,
                                        background: 'rgba(0, 112, 243, 0.08)',
                                        padding: '0.3rem 0.75rem',
                                        borderRadius: '8px',
                                        color: 'var(--accent)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        {(translations[lang] as any).plan.subjectNames[podcast.subjectId]}
                                    </div>
                                )}
                                {session?.user?.role === 'admin' && (
                                    <Link
                                        href={`/admin/podcast/${podcast.id}`}
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
                        </div>
                        <h1 className="podcast-detail-title" style={{ margin: 0, fontWeight: 900, color: '#000', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                            {title}
                        </h1>
                    </header>

                    <p className="podcast-description-full" style={{ fontSize: '1.2rem', lineHeight: 1.7, color: '#334155', whiteSpace: 'pre-wrap', marginBottom: '2rem' }}>
                        {description}
                    </p>

                    {podcast.links && (podcast.links as any[]).length > 0 && (
                        <div className="podcast-links-section" style={{ marginTop: '2.5rem', padding: '2rem', background: '#f8fafc', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                            <h4 style={{ margin: '0 0 1.25rem 0', fontSize: '0.9rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ExternalLink size={16} />
                                Recursos adicionales
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {(podcast.links as any[]).map((link, idx) => (
                                    <a
                                        key={idx}
                                        href={link.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '1.25rem 1.5rem',
                                            background: '#fff',
                                            borderRadius: '16px',
                                            border: '1px solid #e2e8f0',
                                            textDecoration: 'none',
                                            color: '#1e293b',
                                            fontWeight: 700,
                                            transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                        }}
                                        className="podcast-link-item"
                                    >
                                        <span>{link.title || 'Ver recurso'}</span>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0, 112, 243, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                                            <ExternalLink size={14} />
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <aside className="comments-side">
                    <CommentSection podcastSlug={slug} lang={lang} />
                </aside>

                <div className="player-section-full">
                    <PodcastPlayer
                        podcast={podcast}
                        initialLikes={likes}
                        initialDislikes={dislikes}
                        userVote={userVote as any}
                        forcedLang="es"
                    />
                </div>
            </div>

            {/* Floating button for playlist.hoy.today */}
            <a
                href="https://playlist.hoy.today/"
                target="_blank"
                rel="noopener noreferrer"
                className="playlist-floating-link"
                title="Ir a Playlist Hoy"
            >
                <Disc3 size={30} />
            </a>

            <footer className="footer-main" style={{ marginTop: '5rem', borderTop: '1px solid #f1f5f9', paddingTop: '2.5rem', marginBottom: '2rem' }}>
                <a href="https://github.com/gonzagramaglia/ciberportero" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
                    <Github size={18} />
                </a>
                <span>{t.footer}</span>
                <a href="https://youtu.be/Sdz38CpLrUs" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
                    <Youtube size={22} />
                </a>
            </footer>

            <style dangerouslySetInnerHTML={{
                __html: `
                .podcast-main-layout {
                    display: grid;
                    grid-template-columns: 5.5fr 4.5fr;
                    grid-template-areas: 
                        "info comments"
                        "player player";
                    gap: 3rem;
                    align-items: start;
                }
                .info-side { grid-area: info; }
                .comments-side { grid-area: comments; }
                .player-section-full { 
                    grid-area: player; 
                    margin-top: 1.5rem;
                }

                .podcast-detail-title {
                    font-size: 2.8rem;
                }
                .player-section-full :global(.podcast-player-container) {
                    max-width: 100% !important;
                    margin: 0 !important;
                }
                /* Align comments with date */
                .comments-side :global(.comments-container) {
                    margin-top: 0 !important;
                    padding: 2rem !important;
                    border-radius: 32px !important;
                }
                @media (max-width: 1100px) {
                    .podcast-main-layout {
                        grid-template-columns: 1fr;
                        grid-template-areas: 
                            "info"
                            "player"
                            "comments";
                        gap: 1.25rem !important;
                    }
                    .podcast-detail-title {
                        font-size: 2.25rem !important;
                    }
                    .player-section-full {
                        margin-top: 0.5rem !important;
                        margin-bottom: 0.5rem !important;
                    }
                }
                .podcast-link-item:hover {
                    transform: translateY(-2px) scale(1.01);
                    border-color: var(--accent) !important;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
                }

                /* Floating Button Styles */
                .playlist-floating-link {
                    position: fixed;
                    right: 4.5rem;
                    bottom: 3.5rem;
                    width: 62px;
                    height: 62px;
                    border-radius: 50%;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                    color: #1e293b;
                    z-index: 1000;
                    opacity: 0.8;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    text-decoration: none;
                }

                .playlist-floating-link:hover {
                    background: #facc15 !important;
                    color: #000 !important;
                    box-shadow: 0 15px 30px rgba(250, 204, 21, 0.3) !important;
                    border-color: #facc15 !important;
                    opacity: 1 !important;
                    transform: scale(1.1) rotate(15deg);
                }

                @media (max-width: 1024px) {
                    .playlist-floating-link {
                        display: none !important;
                    }
                }
            `}} />
        </div>
    );
}
