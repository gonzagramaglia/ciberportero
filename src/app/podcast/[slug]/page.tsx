import { db } from "@/lib/db";
import { translations } from "@/lib/translations";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { notFound } from "next/navigation";
import PodcastPlayer from "@/components/PodcastPlayer";
import CommentSection from "@/components/CommentSection";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

            <header style={{ marginBottom: '2rem' }}>
                <Link href="/podcast" className="back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', textDecoration: 'none', fontWeight: 600, marginBottom: '0.5rem' }}>
                    <ArrowLeft size={18} />
                    {t.podcast.title}
                </Link>
                
                <div style={{ marginTop: '1.5rem' }}>
                    <div className="podcast-meta" style={{ display: 'flex', gap: '1rem', color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                        <span className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Calendar size={14} />
                            {new Date(podcast.date || podcast.createdAt).toLocaleDateString(lang, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>
                    <h1 className="podcast-detail-title" style={{ margin: '0.5rem 0', fontWeight: '900', color: '#000', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                        {title}
                    </h1>
                </div>
            </header>

            <main>
                <div className="podcast-content" style={{ maxWidth: '800px' }}>
                    <p className="podcast-description-full" style={{ fontSize: '1.15rem', lineHeight: 1.7, color: '#334155', whiteSpace: 'pre-wrap' }}>
                        {description}
                    </p>
                    
                    <PodcastPlayer 
                        podcast={podcast} 
                        initialLikes={likes} 
                        initialDislikes={dislikes}
                        userVote={userVote as any}
                    />

                    <div className="comment-area" style={{ marginTop: '4rem' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <User size={24} />
                            {t.comments.title}
                        </h2>
                        <CommentSection podcastSlug={slug} lang={lang} />
                    </div>
                </div>
            </main>

            <style dangerouslySetInnerHTML={{ __html: `
                .podcast-detail-title {
                    font-size: 3rem;
                }
                @media (max-width: 640px) {
                    .podcast-detail-title {
                        font-size: 2.2rem !important;
                    }
                }
            `}} />
        </div>
    );
}
