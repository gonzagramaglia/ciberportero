'use client';

import { createContext, useContext, useEffect, useState, Suspense } from 'react';
import { Locale, translations } from '@/lib/translations';
import { usePathname, useSearchParams } from 'next/navigation';

type LanguageContextType = {
    lang: Locale;
    setLang: (lang: Locale) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function LanguageContent({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<Locale>('es');
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const locales: Locale[] = ['en', 'pt', 'es'] as Locale[];
        
        // Detection strategy: URL > SearchParams > Cookie > LocalStorage
        const pathSegments = pathname.split('/');
        const pathLang = pathSegments[1] as Locale;
        const queryLang = searchParams.get('lang') as Locale;
        const cookieLang = typeof document !== 'undefined' 
            ? document.cookie.split('; ').find(row => row.startsWith('lang='))?.split('=')[1] as Locale
            : null;

        let detectedLang: Locale | null = null;

        if (locales.includes(pathLang)) {
            detectedLang = pathLang;
        } else if (locales.includes(queryLang)) {
            detectedLang = queryLang;
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
    }, [pathname, searchParams]);

    const setLang = (newLang: Locale) => {
        setLangState(newLang);
        localStorage.setItem('lang', newLang);
        if (typeof document !== 'undefined') {
            document.cookie = `lang=${newLang}; path=/; max-age=31536000`;
        }
    };

    if (!mounted) return null;

    return (
        <LanguageContext.Provider value={{ lang, setLang }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={null}>
            <LanguageContent>
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
