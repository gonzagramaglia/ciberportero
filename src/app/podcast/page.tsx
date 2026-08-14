import { db } from "@/lib/db";
import { translations } from "@/lib/translations";
import { cookies } from "next/headers";
import Link from "next/link";
import { ChevronLeft, Speaker, Github, Youtube, Disc3, Coffee , Twitch} from "lucide-react";
import PodcastCard from "@/components/PodcastCard";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { FaXTwitter } from 'react-icons/fa6';
import { TbBrandGithub } from 'react-icons/tb';

export default async function PodcastListPage() {
    const cookieStore = await cookies();
    const lang = "es";
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
                    <ChevronLeft size={20} />
                    {lang === 'es' ? 'Volver al inicio' : 'Back to home'}
                </Link>
                <div style={{ width: '1px' }} />
            </div>

            <header style={{ marginBottom: '3.5rem' }}>
                <h1 style={{ margin: 0, fontSize: '3rem', fontWeight: '900', color: '#000', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {t.podcast.title}
                </h1>
                <p style={{ color: 'var(--muted)', fontSize: '1.2rem', marginTop: '0.5rem', fontWeight: '500', maxWidth: '700px', lineHeight: 1.5 }}>
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
                            <PodcastCard key={podcast.id} podcast={podcast} forcedLang="es" />
                        ))
                    )}
                </div>
            </main>

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

            <footer className="footer-main" style={{ marginTop: '8rem', borderTop: '1px solid #f1f5f9', paddingTop: '3rem', marginBottom: '2rem' }}>
                <div className="footer-social-left" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <a href="https://x.com/ciberportero" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }} aria-label="X (Twitter) de Ciberportero"><FaXTwitter size={16} aria-hidden="true" /></a>
                    <a href="https://github.com/gonzagramaglia/ciberportero" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }} aria-label={lang === 'es' ? "GitHub de Ciberportero" : "Ciberportero GitHub"}><TbBrandGithub size={21} aria-hidden="true" /></a>
                </div>
                <a href="https://whatsapp.com/channel/0029VbDixno96H4NZuwELU3Z" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>{t.footer}</a>
                <div className="footer-social-right" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <a href="https://twitch.tv/ciberportero" target="_blank" rel="noopener noreferrer" style={{ display: 'flex'  }} aria-label="Twitch de Ciberportero"><Twitch size={18} aria-hidden="true" /></a>
                    <a href="https://youtube.com/@ciberportero" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }} aria-label="YouTube de Ciberportero"><Youtube size={22} aria-hidden="true" /></a>
                </div>
            </footer>

            <style dangerouslySetInnerHTML={{
                __html: `
                .podcast-list-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 2.5rem;
                }
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
                @media (max-width: 900px) {
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
