'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import { translations } from '@/lib/translations';

interface RoomNavbarProps {
    href: string;
    backTextKey: 'back' | 'backToRooms' | 'backToLobby';
}

export default function RoomNavbar({ href, backTextKey }: RoomNavbarProps) {
    const { lang } = useLanguage();
    const t = translations[lang as keyof typeof translations] || translations.es;
    
    // Explicit localized strings if keys are not enough
    const label = t.rooms[backTextKey === 'back' ? 'back' : backTextKey];

    return (
        <div className="nav-header-row">
            <Link href={href} className="back-link premium-breadcrumb">
                <ChevronLeft size={18} />
                <span>{label}</span>
            </Link>
            <LanguageSwitcher />
            <style jsx global>{`
                .premium-breadcrumb {
                    background: rgba(255, 255, 255, 0.5);
                    backdrop-filter: blur(8px);
                    padding: 0.6rem 1rem 0.6rem 0.6rem;
                    border-radius: 12px;
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    font-weight: 700 !important;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                }
                .premium-breadcrumb:hover {
                    background: #fff;
                    transform: translateX(-4px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                @media (max-width: 768px) {
                    .premium-breadcrumb {
                        padding: 0.5rem 0.8rem 0.5rem 0.4rem;
                        font-size: 0.85rem;
                    }
                }
            `}</style>
        </div>
    );
}
