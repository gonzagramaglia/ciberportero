'use client';

import { FaFutbol } from 'react-icons/fa6';
import { useLanguage } from '@/context/LanguageContext';

interface FloatingFootballButtonProps {
    hideOnMobile?: boolean;
}

export default function FloatingFootballButton({ hideOnMobile }: FloatingFootballButtonProps = {}) {
    const { lang } = useLanguage();
    const url = "https://youtu.be/LhnH0juUaGw";
    const label = lang === 'es' ? "Ver video de fútbol" : lang === 'pt' ? "Assistir vídeo de futebol" : "Watch football video";
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`floating-football-btn ${hideOnMobile ? 'hide-on-mobile' : ''}`}
            aria-label={label}
        >
            <FaFutbol size={28} className="football-icon" />
            <style jsx>{`
                .floating-football-btn {
                    position: fixed;
                    bottom: 3.5rem;
                    left: 2.5rem;
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
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    z-index: 1000;
                    cursor: pointer;
                    text-decoration: none;
                    opacity: 0.8;
                }

                :global(.football-icon) {
                    transition: all 0.3s ease;
                }

                .floating-football-btn:hover {
                    transform: scale(1.1) translateX(5px);
                    box-shadow: 0 15px 30px rgba(16, 185, 129, 0.4) !important;
                    background: #10b981 !important;
                    border-color: #10b981 !important;
                    color: #fff !important;
                    opacity: 1 !important;
                }

                .floating-football-btn:active {
                    transform: scale(0.95);
                }

                @media (max-width: 1200px) {
                    .floating-football-btn {
                        bottom: 2rem;
                        left: 2rem;
                        width: 54px;
                        height: 54px;
                    }
                    :global(.football-icon) {
                        width: 22px !important;
                        height: 22px !important;
                    }
                }

                @media (max-width: 768px) {
                    .hide-on-mobile {
                        display: none !important;
                    }
                }
            `}</style>
        </a>
    );
}
