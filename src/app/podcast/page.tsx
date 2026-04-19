import { db } from "@/lib/db";
import { translations } from "@/lib/translations";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Speaker } from "lucide-react";
import PodcastCard from "@/components/PodcastCard";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default async function PodcastListPage() {
    const cookieStore = await cookies();
    const lang = (cookieStore.get("lang")?.value as "es" | "en" | "pt") || "es";
    const t = translations[lang];

    let podcasts = [];
    try {
        if (db && (db as any).podcast) {
            podcasts = await (db as any).podcast.findMany({
                where: { published: true },
                orderBy: { createdAt: 'desc' }
            });
        } else {
            console.warn("Prisma: podcast model not found in DB client.");
        }
    } catch (e) {
        console.error("Database connection failed:", e);
    }

    return (
        <div className="container fade-in">
            <div className="home-lang-container">
                <LanguageSwitcher />
            </div>

            <header style={{ marginBottom: '3rem' }}>
                <Link href="/" className="back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', textDecoration: 'none', fontWeight: 600, marginBottom: '0.5rem' }}>
                    <ArrowLeft size={18} />
                    {t.back}
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                    <div style={{ 
                        width: '48px', height: '48px', background: 'var(--accent)', 
                        borderRadius: '12px', display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', color: 'white' 
                    }}>
                        <Speaker size={28} />
                    </div>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900', color: '#000' }}>
                        {t.podcast.title}
                    </h1>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: '1.1rem', marginTop: '0.5rem', fontWeight: '500' }}>
                    {t.podcast.description}
                </p>
            </header>

            <main>
                <div className="podcast-list-grid">
                    {podcasts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--muted)' }}>
                            <Speaker size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p>{t.podcast.empty}</p>
                        </div>
                    ) : (
                        podcasts.map((podcast: any) => (
                            <PodcastCard key={podcast.id} podcast={podcast} />
                        ))
                    )}
                </div>
            </main>

            <style dangerouslySetInnerHTML={{ __html: `
                .podcast-list-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
                    gap: 1.5rem;
                }
                @media (max-width: 640px) {
                    .podcast-list-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}} />
        </div>
    );
}
