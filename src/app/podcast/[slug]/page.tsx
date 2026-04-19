import { db } from "@/lib/db";
import { translations } from "@/lib/translations";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Edit, Github, Youtube } from "lucide-react";
import { notFound } from "next/navigation";
import PodcastPlayer from "@/components/PodcastPlayer";
import CommentSection from "@/components/CommentSection";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const resolvedParams = await params;
    const podcast = await db.podcast.findUnique({
        where: { slug: resolvedParams.slug }
    });

    if (!podcast) return { title: 'Podcast no encontrado' };

    const lang = 'es'; // Default to ES for metadata if not specified
    const title = (podcast.title as any)[lang] || (podcast.title as any)['es'] || podcast.slug;
    const description = (podcast.description as any)[lang] || (podcast.description as any)['es'] || "";

    return {
        title: `${title} | Ciberportero`,
        description: description.slice(0, 160),
        openGraph: {
            title,
            description,
            type: 'music.song',
        }
    };
}

export default async function PodcastDetailPage({ params }: { params: { slug: string } }) {
    const session = await auth();
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    const cookieStore = await cookies();
    const lang = (cookieStore.get("lang")?.value as "es" | "en" | "pt") || "es";
    const t = translations[lang];

    let podcast = null;
    try {
        if (db && (db as any).podcast) {
            podcast = await (db as any).podcast.findUnique({
                where: { slug: slug },
                include: {
                    votes: true
                }
            });
        } else {
            console.warn("Prisma: podcast model not found in DB client.");
        }
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
                    <ArrowLeft size={18} />
                    {lang === 'es' ? 'Volver a Podcast' : lang === 'pt' ? 'Voltar ao Podcast' : 'Back to Podcast'}
                </Link>
                <LanguageSwitcher />
            </div>
                
            <div className="podcast-grid">
                <div className="content-side">
                    <header style={{ marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
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
                            </div>
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
                        <h1 className="podcast-detail-title" style={{ margin: 0, fontWeight: 900, color: '#000', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                            {title}
                        </h1>
                    </header>

                    <main>
                        <p className="podcast-description-full" style={{ fontSize: '1.2rem', lineHeight: 1.7, color: '#334155', whiteSpace: 'pre-wrap', marginBottom: '2.5rem' }}>
                            {description}
                        </p>
                        
                        <PodcastPlayer 
                            podcast={podcast} 
                            initialLikes={likes} 
                            initialDislikes={dislikes}
                            userVote={userVote as any}
                        />
                    </main>
                </div>

                <aside className="comments-side">
                    <CommentSection podcastSlug={slug} lang={lang} />
                </aside>
            </div>

            <footer className="footer-main" style={{ marginTop: '5rem', borderTop: '1px solid #f1f5f9', paddingTop: '2.5rem', marginBottom: '2rem' }}>
                <a href="https://github.com/gonzalogramagia/ciberportero" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
                    <Github size={18} />
                </a>
                <span>{t.footer}</span>
                <a href="https://youtu.be/Sdz38CpLrUs" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
                    <Youtube size={22} />
                </a>
            </footer>

            <style dangerouslySetInnerHTML={{ __html: `
                .podcast-grid {
                    display: grid;
                    grid-template-columns: 4fr 6fr;
                    gap: 3rem;
                    align-items: start;
                }
                .podcast-detail-title {
                    font-size: 3.5rem;
                }
                /* Align comments with date */
                .comments-side :global(.comments-container) {
                    margin-top: 0 !important;
                    padding: 2.5rem !important;
                }
                @media (max-width: 1100px) {
                    .podcast-grid {
                        grid-template-columns: 1fr;
                        gap: 0.5rem !important;
                    }
                    .podcast-detail-title {
                        font-size: 2.25rem !important;
                    }
                    .comments-side {
                        border-top: 1px solid #f1f5f9;
                        padding-top: 1.5rem;
                    }
                    /* Remove player's bottom margin in mobile */
                    .comments-side :global(.podcast-player-container) {
                        margin-bottom: 0 !important;
                    }
                }
            `}} />
        </div>
    );
}
