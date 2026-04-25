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
            <Link href={href} className="back-link">
                <ChevronLeft size={18} />
                {label}
            </Link>
            <LanguageSwitcher />
        </div>
    );
}
