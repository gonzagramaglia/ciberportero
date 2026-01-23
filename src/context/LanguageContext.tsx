'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Locale, translations } from '@/lib/translations';

type LanguageContextType = {
    lang: Locale;
    setLang: (lang: Locale) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<Locale>('es');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedLang = localStorage.getItem('lang') as Locale;
        if (savedLang && translations[savedLang]) {
            setLangState(savedLang);
        }
        setMounted(true);
    }, []);

    const setLang = (newLang: Locale) => {
        console.log('Setting language to:', newLang);
        setLangState(newLang);
        localStorage.setItem('lang', newLang);
    };

    if (!mounted) return null;

    return (
        <LanguageContext.Provider value={{ lang, setLang }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
