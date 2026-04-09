'use client';

import { useLanguage } from '@/context/LanguageContext';
import { usePathname, useRouter } from 'next/navigation';
import { Locale } from '@/lib/translations';

export default function LanguageSwitcher() {
    const { lang, setLang } = useLanguage();
    const pathname = usePathname();
    const router = useRouter();

    const changeLanguage = (newLang: Locale) => {
        // 1. Update the context and cookie immediately
        setLang(newLang);

        // 2. Identify current segments
        const segments = pathname.split('/');
        const currentLang = segments[1];
        const isLocalized = ['en', 'pt', 'es'].includes(currentLang);

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

        // 5. Navigate
        router.push(targetPath || '/');
    };

    return (
        <nav className="lang-switcher">
            <button
                onClick={() => changeLanguage('es')}
                className={lang === 'es' ? 'active' : ''}
                style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    font: 'inherit', 
                    padding: '0.2rem 0.5rem',
                    opacity: lang === 'es' ? 1 : 0.6,
                    fontWeight: lang === 'es' ? 'bold' : 'normal'
                }}
            >
                ES
            </button>
            <button
                onClick={() => changeLanguage('en')}
                className={lang === 'en' ? 'active' : ''}
                style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    font: 'inherit', 
                    padding: '0.2rem 0.5rem',
                    opacity: lang === 'en' ? 1 : 0.6,
                    fontWeight: lang === 'en' ? 'bold' : 'normal'
                }}
            >
                EN
            </button>
            <button
                onClick={() => changeLanguage('pt')}
                className={lang === 'pt' ? 'active' : ''}
                style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    font: 'inherit', 
                    padding: '0.2rem 0.5rem',
                    opacity: lang === 'pt' ? 1 : 0.6,
                    fontWeight: lang === 'pt' ? 'bold' : 'normal'
                }}
            >
                PT
            </button>
        </nav>
    );
}
