import { db } from "@/lib/db";
import { translations } from "@/lib/translations";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Edit } from "lucide-react";
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
            <div className="home-lang-container">
                <LanguageSwitcher />
            </div>

            <header style={{ marginBottom: '2.5rem' }}>
                <Link href="/podcast" className="back-link" style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.4rem', 
                    color: 'var(--muted)', 
                    textDecoration: 'none', 
                    fontWeight: 700,
                    marginBottom: '1rem'
                }}>
                    <ArrowLeft size={16} />
                    {t.podcast.title}
                </Link>
                
                <div style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                            <Calendar size={14} />
                            <span>
                                {new Date(podcast.date || podcast.createdAt).toLocaleDateString(lang, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
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
                </div>
            </header>

            <main>
                <div className="podcast-content" style={{ maxWidth: '900px' }}>
                    <p className="podcast-description-full" style={{ fontSize: '1.2rem', lineHeight: 1.7, color: '#334155', whiteSpace: 'pre-wrap', marginBottom: '3rem' }}>
                        {description}
                    </p>
                    
                    <PodcastPlayer 
                        podcast={podcast} 
                        initialLikes={likes} 
                        initialDislikes={dislikes}
                        userVote={userVote as any}
                    />

                    <div style={{ marginTop: '5rem', borderTop: '1px solid #f1f5f9', paddingTop: '4rem' }}>
                        <CommentSection podcastSlug={slug} lang={lang} />
                    </div>
                </div>
            </main>

            <style dangerouslySetInnerHTML={{ __html: `
                .podcast-detail-title {
                    font-size: 3.5rem;
                }
                @media (max-width: 768px) {
                    .podcast-detail-title {
                        font-size: 2.25rem !important;
                    }
                    .podcast-content {
                        max-width: 100% !important;
                    }
                }
            `}} />
        </div>
    );
}
