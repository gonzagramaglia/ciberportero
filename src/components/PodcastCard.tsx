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
                    <Speaker size={32} />
                </div>
                <div className="podcast-card-content">
                    <div className="podcast-card-header">
                        <span className="podcast-card-date">
                            {new Date(podcast.date || podcast.createdAt).toLocaleDateString(lang, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </span>
                    </div>
                    <h3 className="podcast-card-title">{title}</h3>
                    <p className="podcast-card-desc">{description}</p>
                    <div className="podcast-card-footer">
                        <span className="podcast-card-btn">
                            <Play size={16} fill="currentColor" />
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
                    transition: transform 0.2s ease;
                }
                .podcast-card-link:hover {
                    transform: translateY(-4px);
                }
                .podcast-card {
                    background: white;
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    padding: 1.5rem;
                    display: flex;
                    gap: 1.5rem;
                    height: 100%;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    transition: all 0.2s ease;
                }
                .podcast-card-link:hover .podcast-card {
                    border-color: var(--accent);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                }
                .podcast-card-icon {
                    width: 64px;
                    height: 64px;
                    background: #f1f5f9;
                    border-radius: 12px;
                    display: flex;
                    alignItems: center;
                    justify-content: center;
                    color: var(--accent);
                    flex-shrink: 0;
                }
                .podcast-card-content {
                    display: flex;
                    flex-direction: column;
                    flex-grow: 1;
                }
                .podcast-card-header {
                    margin-bottom: 0.5rem;
                }
                .podcast-card-date {
                    font-size: 0.8rem;
                    color: var(--muted);
                    font-weight: 500;
                }
                .podcast-card-title {
                    margin: 0 0 0.5rem 0;
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #0f172a;
                    line-height: 1.2;
                }
                .podcast-card-desc {
                    margin: 0 0 1rem 0;
                    font-size: 0.95rem;
                    color: #64748b;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    line-height: 1.5;
                }
                .podcast-card-footer {
                    margin-top: auto;
                }
                .podcast-card-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: #f8fafc;
                    color: var(--accent);
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    transition: all 0.2s ease;
                }
                .podcast-card-link:hover .podcast-card-btn {
                    background: var(--accent);
                    color: white;
                }

                @media (max-width: 640px) {
                    .podcast-card {
                        flex-direction: column;
                        gap: 1rem;
                    }
                    .podcast-card-icon {
                        width: 48px;
                        height: 48px;
                    }
                }
            `}</style>
        </Link>
    );
}
