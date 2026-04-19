'use client';

import Link from 'next/link';
import { Play, Speaker } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';

export default function PodcastCard({ podcast }: { podcast: any }) {
    const { lang } = useLanguage();
    const t = translations[lang].podcast;
    const title = (podcast.title as any)[lang] || (podcast.title as any)['es'] || podcast.slug;
    const description = (podcast.description as any)[lang] || (podcast.description as any)['es'] || "";

    return (
        <Link href={`/podcast/${podcast.slug}`} className="podcast-card-link">
            <div className="podcast-card">
                <div className="podcast-card-icon">
                    <Speaker size={32} strokeWidth={2.5} />
                </div>
                <div className="podcast-card-content">
                    <div className="podcast-card-meta">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="podcast-card-date">
                                {lang === 'es' ? 'Audio del ' : lang === 'pt' ? 'Áudio de ' : 'Audio from '}
                                {new Date(podcast.date || podcast.createdAt).toLocaleDateString(lang, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                            {podcast.subjectId && (
                                <span style={{ 
                                    fontSize: '0.7rem', 
                                    fontWeight: 900, 
                                    background: '#f1f5f9', 
                                    padding: '0.25rem 0.6rem', 
                                    borderRadius: '6px', 
                                    color: '#64748b' 
                                }}>
                                    {(translations[lang] as any).plan.subjectNames[podcast.subjectId]}
                                </span>
                            )}
                        </div>
                    </div>
                    <h3 className="podcast-card-title">{title}</h3>
                    <p className="podcast-card-desc">{description}</p>
                    <div className="podcast-card-action">
                        <span className="podcast-card-btn">
                            <Play size={14} fill="currentColor" />
                            {t.listen}
                        </span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .podcast-card-link {
                    text-decoration: none;
                    color: inherit;
                    display: block;
                }
                .podcast-card {
                    background: white;
                    border: 1px solid #f1f5f9;
                    border-radius: 24px;
                    padding: 2rem;
                    display: flex;
                    gap: 1.5rem;
                    height: 100%;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .podcast-card-link:hover .podcast-card {
                    transform: translateY(-8px) scale(1.02);
                    border-color: var(--accent);
                    box-shadow: 0 20px 40px rgba(0, 112, 243, 0.1);
                }
                .podcast-card-icon {
                    width: 72px;
                    height: 72px;
                    background: #f8fafc;
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #94a3b8;
                    flex-shrink: 0;
                    transition: all 0.4s ease;
                }
                .podcast-card-link:hover .podcast-card-icon {
                    background: var(--accent);
                    color: white;
                    transform: rotate(-5deg);
                }
                .podcast-card-content {
                    display: flex;
                    flex-direction: column;
                    flex-grow: 1;
                }
                .podcast-card-meta {
                    margin-bottom: 0.75rem;
                }
                .podcast-card-date {
                    font-size: 0.85rem;
                    color: var(--muted);
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .podcast-card-title {
                    margin: 0 0 0.75rem 0;
                    font-size: 1.5rem;
                    font-weight: 900;
                    color: #0f172a;
                    line-height: 1.1;
                    letter-spacing: -0.02em;
                }
                .podcast-card-desc {
                    margin: 0 0 1.5rem 0;
                    font-size: 1.05rem;
                    color: #475569;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    line-height: 1.5;
                }
                .podcast-card-action {
                    margin-top: auto;
                }
                .podcast-card-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.6rem;
                    background: #f1f5f9;
                    color: #475569;
                    padding: 0.6rem 1.2rem;
                    border-radius: 12px;
                    font-size: 0.9rem;
                    font-weight: 800;
                    transition: all 0.3s ease;
                }
                .podcast-card-link:hover .podcast-card-btn {
                    background: #000;
                    color: white;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                }

                @media (max-width: 640px) {
                    .podcast-card {
                        flex-direction: column;
                        gap: 1.25rem;
                        padding: 1.5rem;
                    }
                    .podcast-card-icon {
                        width: 56px;
                        height: 56px;
                    }
                }
            `}</style>
        </Link>
    );
}
