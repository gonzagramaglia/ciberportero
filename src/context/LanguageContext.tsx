'use client';

import { createContext, useContext, useEffect, useState, Suspense } from 'react';
import { Locale, translations } from '@/lib/translations';
import { usePathname, useSearchParams } from 'next/navigation';

type LanguageContextType = {
    lang: Locale;
    setLang: (lang: Locale) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function LanguageContent({ children, initialLang }: { children: React.ReactNode, initialLang?: Locale }) {
    // Initialize with server-provided lang to avoid flicker
    const [lang, setLangState] = useState<Locale>(initialLang || 'es');
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const locales: Locale[] = ['en', 'pt', 'es'] as Locale[];
        
        // Detection strategy: URL > Cookie > LocalStorage
        const pathSegments = pathname.split('/');
        const pathLang = pathSegments[1] as Locale;
        
        const cookieLang = typeof document !== 'undefined' 
            ? document.cookie.split('; ').find(row => row.startsWith('lang='))?.split('=')[1] as Locale
            : null;

        let detectedLang: Locale | null = null;

        if (locales.includes(pathLang)) {
            detectedLang = pathLang;
        } else if (cookieLang && locales.includes(cookieLang)) {
            detectedLang = cookieLang;
        }

        if (detectedLang && translations[detectedLang]) {
            setLangState(detectedLang);
            localStorage.setItem('lang', detectedLang);
        } else {
            const savedLang = localStorage.getItem('lang') as Locale;
            if (savedLang && translations[savedLang]) {
                setLangState(savedLang);
            }
        }
        setMounted(true);
    }, [pathname]);

    const setLang = (newLang: Locale) => {
        setLangState(newLang);
        localStorage.setItem('lang', newLang);
        if (typeof document !== 'undefined') {
            document.cookie = `lang=${newLang}; path=/; max-age=31536000`;
        }
    };

    // We don't return null here to allow for initial server-side render
    return (
        <LanguageContext.Provider value={{ lang, setLang }}>
            <div style={{ visibility: mounted ? 'visible' : 'hidden' }}>
                {children}
            </div>
        </LanguageContext.Provider>
    );
}

export function LanguageProvider({ children, initialLang }: { children: React.ReactNode, initialLang?: Locale }) {
    return (
        <Suspense fallback={null}>
            <LanguageContent initialLang={initialLang}>
                {children}
            </LanguageContent>
        </Suspense>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
