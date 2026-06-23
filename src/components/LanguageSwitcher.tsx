'use client';

import { useLanguage } from '@/context/LanguageContext';
import { usePathname, useRouter } from 'next/navigation';
import { Locale } from '@/lib/translations';

interface LanguageSwitcherProps {
    availableLangs?: string[];
}

export default function LanguageSwitcher({ availableLangs }: LanguageSwitcherProps) {
    const { lang, setLang } = useLanguage();
    const pathname = usePathname();
    const router = useRouter();

    const changeLanguage = (newLang: Locale) => {
        // If lang is not available for this specific post, do nothing
        if (availableLangs && !availableLangs.includes(newLang)) return;

        // 1. Update the context and cookie immediately
        setLang(newLang);

        // 2. Identify current segments and search params
        const segments = pathname.split('/');
        const currentLang = segments[1];
        const isLocalized = ['en', 'pt', 'es'].includes(currentLang);
        
        // Handle search params
        const params = new URLSearchParams(window.location.search);
        if (params.has('lang')) {
            if (newLang === 'es') {
                params.delete('lang');
            } else {
                params.set('lang', newLang);
            }
        }

        // 3. Build the base path (without locale)
        const basePath = isLocalized 
            ? '/' + segments.slice(2).join('/') 
            : pathname;

        // 4. Construct the new URL
        let targetPath = newLang === 'es' 
            ? basePath 
            : `/${newLang}${basePath === '/' ? '' : basePath}`;

        if (targetPath.length > 1 && targetPath.endsWith('/')) {
            targetPath = targetPath.slice(0, -1);
        }

        // 5. Append params if any
        const queryString = params.toString();
        const finalPath = queryString ? `${targetPath}?${queryString}` : targetPath;

        // 6. Navigate
        router.push(finalPath || '/');
    };

    const renderButton = (l: Locale, label: string) => {
        const isAvailable = !availableLangs || availableLangs.includes(l);
        const isActive = lang === l;

        return (
            <button
                key={l}
                disabled={!isAvailable}
                onClick={() => changeLanguage(l)}
                className={`${isActive ? 'active' : ''} ${!isAvailable ? 'disabled' : ''}`}
                style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: isAvailable ? 'pointer' : 'not-allowed', 
                    font: 'inherit', 
                    padding: '0.2rem 0.5rem',
                    opacity: isActive ? 1 : (isAvailable ? 0.5 : 0.2),
                    fontWeight: isActive ? '900' : '600',
                    color: !isAvailable ? '#94a3b8' : '#000',
                    transition: 'all 0.2s',
                    fontSize: '0.8rem',
                    letterSpacing: '0.02em'
                }}
            >
                {label}
            </button>
        );
    }

    return (
        <nav className="lang-switcher" style={{ display: 'flex', gap: '0.25rem' }}>
            {renderButton('es', 'ES')}
            {renderButton('en', 'EN')}
        </nav>
    );
}
