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
        <div className="podcast-detail-page fade-in" style={{ minHeight: '100vh', background: '#fff' }}>
            <div className="home-lang-container" style={{ position: 'absolute', top: '2rem', right: '2rem' }}>
                <LanguageSwitcher />
            </div>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '4rem 2rem' }}>
                <header style={{ marginBottom: '4rem' }}>
                    <Link href="/podcast" className="back-link" style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        color: '#64748b', 
                        textDecoration: 'none', 
                        fontWeight: 700, 
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        <ArrowLeft size={16} />
                        {t.podcast.title}
                    </Link>
                    
                    <div style={{ marginTop: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent)', fontWeight: 800, fontSize: '0.9rem', marginBottom: '1rem' }}>
                            <Calendar size={16} />
                            <span>
                                {new Date(podcast.date || podcast.createdAt).toLocaleDateString(lang, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                        <h1 className="podcast-detail-title">
                            {title}
                        </h1>
                    </div>
                </header>

                <main style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4rem' }}>
                    <div className="podcast-content-wrapper">
                        <p className="podcast-description-full">
                            {description}
                        </p>
                        
                        <div style={{ marginTop: '3rem' }}>
                            <PodcastPlayer 
                                podcast={podcast} 
                                initialLikes={likes} 
                                initialDislikes={dislikes}
                                userVote={userVote as any}
                            />
                        </div>
                    </div>
                </main>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .podcast-detail-title {
                    font-size: clamp(2.5rem, 8vw, 5rem);
                    font-weight: 950;
                    color: #0f172a;
                    letter-spacing: -0.04em;
                    line-height: 0.95;
                    margin: 0;
                    max-width: 1000px;
                }
                .podcast-description-full {
                    font-size: clamp(1.1rem, 2vw, 1.4rem);
                    line-height: 1.6;
                    color: #475569;
                    white-space: pre-wrap;
                    margin: 0;
                    max-width: 1200px;
                }
                @media (max-width: 768px) {
                    .podcast-detail-page {
                        padding: 1rem !important;
                    }
                    .home-lang-container {
                        position: relative !important;
                        top: 0 !important;
                        right: 0 !important;
                        margin-bottom: 2rem;
                    }
                }
            `}} />
        </div>
    );
}
