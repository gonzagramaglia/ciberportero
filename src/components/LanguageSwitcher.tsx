'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function LanguageSwitcher() {
    const { lang, setLang } = useLanguage();

    return (
        <nav className="lang-switcher">
            <button
                onClick={() => setLang('es')}
                className={lang === 'es' ? 'active' : ''}
                style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', padding: 0 }}
            >
                ES
            </button>
            <button
                onClick={() => setLang('en')}
                className={lang === 'en' ? 'active' : ''}
                style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', padding: 0 }}
            >
                EN
            </button>
            <button
                onClick={() => setLang('pt')}
                className={lang === 'pt' ? 'active' : ''}
                style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', padding: 0 }}
            >
                PT
            </button>
        </nav>
    );
}
