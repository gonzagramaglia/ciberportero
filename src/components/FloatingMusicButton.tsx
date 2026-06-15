'use client';

import { Music } from 'lucide-react';

interface FloatingMusicButtonProps {
    hideOnMobile?: boolean;
}

export default function FloatingMusicButton({ hideOnMobile }: FloatingMusicButtonProps = {}) {
    return (
        <a
            href="https://youtu.be/3jqTLDHQRMo"
            target="_blank"
            rel="noopener noreferrer"
            className={`floating-music-btn ${hideOnMobile ? 'hide-on-mobile' : ''}`}
            aria-label="Escuchar música"
        >
            <Music size={28} className="music-icon" />
            <style jsx>{`
                .floating-music-btn {
                    position: fixed;
                    bottom: 3.5rem;
                    right: 4.5rem;
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

                :global(.music-icon) {
                    transition: all 0.3s ease;
                }

                .floating-music-btn:hover {
                    transform: scale(1.1) translateX(-5px);
                    box-shadow: 0 15px 30px rgba(250, 204, 21, 0.4) !important;
                    background: #facc15 !important;
                    border-color: #facc15 !important;
                    color: #000 !important;
                    opacity: 1 !important;
                }

                .floating-music-btn:active {
                    transform: scale(0.95);
                }

                @media (max-width: 1200px) {
                    .floating-music-btn {
                        bottom: 2rem;
                        right: 2rem;
                        width: 54px;
                        height: 54px;
                    }
                    :global(.music-icon) {
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
