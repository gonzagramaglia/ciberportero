import { db } from "@/lib/db";
import { translations } from "@/lib/translations";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Speaker, Github, Youtube } from "lucide-react";
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
            <div className="nav-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', paddingTop: '1rem' }}>
                <Link href="/" className="back-link" style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.6rem', 
                    color: '#64748b', 
                    textDecoration: 'none', 
                    fontWeight: 600,
                    fontSize: '1rem'
                }}>
                    <ArrowLeft size={18} />
                    {lang === 'es' ? 'Volver al inicio' : lang === 'pt' ? 'Voltar ao início' : 'Back to home'}
                </Link>
                <LanguageSwitcher />
            </div>

            <header style={{ marginBottom: '4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '0.5rem' }}>
                    <div style={{ 
                        width: '64px', height: '64px', background: 'var(--accent)', 
                        borderRadius: '16px', display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', color: 'white',
                        boxShadow: '0 10px 25px rgba(0, 112, 243, 0.2)'
                    }}>
                        <Speaker size={32} />
                    </div>
                    <h1 style={{ margin: 0, fontSize: '3.5rem', fontWeight: '950', color: '#000', letterSpacing: '-0.04em', lineHeight: 0.9 }}>
                        {t.podcast.title}
                    </h1>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: '1.4rem', marginTop: '1.5rem', fontWeight: '500', maxWidth: '800px', lineHeight: 1.4 }}>
                    {t.podcast.description}
                </p>
            </header>

            <main>
                <div className="podcast-list-grid">
                    {podcasts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--muted)', background: '#f8fafc', borderRadius: '32px', border: '1px dashed #e2e8f0' }}>
                            <Speaker size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                            <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>{t.podcast.empty}</p>
                        </div>
                    ) : (
                        podcasts.map((podcast: any) => (
                            <PodcastCard key={podcast.id} podcast={podcast} />
                        ))
                    )}
                </div>
            </main>

            <footer className="footer-main" style={{ marginTop: '8rem', borderTop: '1px solid #f1f5f9', paddingTop: '3rem', marginBottom: '2rem' }}>
                <a href="https://github.com/gonzalogramagia/ciberportero" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
                    <Github size={18} />
                </a>
                <span>{t.footer}</span>
                <a href="https://youtu.be/Sdz38CpLrUs" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
                    <Youtube size={22} />
                </a>
            </footer>

            <style dangerouslySetInnerHTML={{ __html: `
                .podcast-list-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
                    gap: 2.5rem;
                }
                @media (max-width: 1100px) {
                    .podcast-list-grid {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }
                }
                @media (max-width: 768px) {
                    h1 {
                        font-size: 2.5rem !important;
                    }
                    header p {
                        font-size: 1.1rem !important;
                    }
                }
            `}} />
        </div>
    );
}
