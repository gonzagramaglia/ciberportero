'use client';

import { useState, useRef, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Share2, Play, Pause, Volume2, Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import { votePodcast } from '@/lib/actions';
import { useSession } from 'next-auth/react';

export default function PodcastPlayer({ podcast, initialLikes, initialDislikes, userVote, forcedLang }: { 
    podcast: any, 
    initialLikes: number, 
    initialDislikes: number,
    userVote?: 'LIKE' | 'DISLIKE' | null,
    forcedLang?: string
}) {
    const { lang: contextLang } = useLanguage();
    const lang = (forcedLang || contextLang) as 'es' | 'en' | 'pt';
    const { data: session } = useSession();
    const t = translations[lang].podcast;
    const [isPlaying, setIsPlaying] = useState(false);
    const [likes, setLikes] = useState(initialLikes);
    const [dislikes, setDislikes] = useState(initialDislikes);
    const [currentVote, setCurrentVote] = useState(userVote);
    const [isSharing, setIsSharing] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.play().catch(e => {
                console.log("Autoplay blocked by browser:", e);
            });
        }
    }, []);

    const handleVote = async (type: 'LIKE' | 'DISLIKE') => {
        if (!session) {
            alert('Debes iniciar sesión para votar');
            return;
        }

        const res = await votePodcast(podcast.id, type);
        if (res.success) {
            // Optimistic update
            if (currentVote === type) {
                // Untoggle
                setCurrentVote(null);
                if (type === 'LIKE') setLikes(l => l - 1);
                else setDislikes(d => d - 1);
            } else {
                // Switch or new vote
                if (currentVote) {
                    if (currentVote === 'LIKE') setLikes(l => l - 1);
                    else setDislikes(d => d - 1);
                }
                setCurrentVote(type);
                if (type === 'LIKE') setLikes(l => l + 1);
                else setDislikes(d => d + 1);
            }
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setIsSharing(true);
        setTimeout(() => setIsSharing(false), 2000);
    };


    return (
        <div className="podcast-player-container">
            <div className="player-card">
                <div className="player-main">
                    <div className="audio-wrapper">
                        <audio 
                            ref={audioRef}
                            src={podcast.audioUrl} 
                            controls 
                            autoPlay
                            className="native-audio"
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        />
                    </div>
                </div>

                <div className="player-actions">
                    <div className="vote-actions">
                        <button 
                            className={`action-btn like-btn ${currentVote === 'LIKE' ? 'active' : ''}`}
                            onClick={() => handleVote('LIKE')}
                        >
                            <ThumbsUp size={20} fill={currentVote === 'LIKE' ? 'currentColor' : 'none'} />
                            <span>{likes}</span>
                        </button>
                        <button 
                            className={`action-btn dislike-btn ${currentVote === 'DISLIKE' ? 'active' : ''}`}
                            onClick={() => handleVote('DISLIKE')}
                        >
                            <ThumbsDown size={20} fill={currentVote === 'DISLIKE' ? 'currentColor' : 'none'} />
                            <span>{dislikes}</span>
                        </button>
                    </div>

                    <button className="action-btn share-btn" onClick={handleShare}>
                        {isSharing ? <Check size={20} /> : <Share2 size={20} />}
                        <span>{isSharing ? translations[lang].podcast.copied : translations[lang].podcast.share}</span>
                    </button>
                </div>
            </div>

            <style jsx>{`
                .podcast-player-container {
                    margin: 2rem 0;
                }
                .player-card {
                    background: #f8fafc;
                    border: 1px solid var(--border);
                    border-radius: 20px;
                    padding: 2rem;
                    box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
                }
                .audio-wrapper {
                    margin-bottom: 2rem;
                }
                .native-audio {
                    width: 100%;
                    height: 54px;
                }
                .player-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 0.75rem;
                }
                .vote-actions {
                    display: flex;
                    gap: 0.4rem;
                }
                .action-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 0.9rem;
                    border-radius: 12px;
                    border: 1px solid var(--border);
                    background: white;
                    color: #475569;
                    font-weight: 700;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }
                .action-btn:hover {
                    background: #f1f5f9;
                    border-color: #cbd5e1;
                }
                .like-btn.active {
                    background: #dcfce7;
                    border-color: #4ade80;
                    color: #166534;
                }
                .dislike-btn.active {
                    background: #fee2e2;
                    border-color: #f87171;
                    color: #991b1b;
                }
                .share-btn {
                    background: var(--accent);
                    color: white;
                    border: none;
                    flex-shrink: 0;
                }
                .share-btn:hover {
                    background: #0060d1;
                }
                
                @media (max-width: 640px) {
                    .player-actions {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .vote-actions {
                        justify-content: space-between;
                    }
                    .vote-actions .action-btn {
                        flex: 1;
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
}
