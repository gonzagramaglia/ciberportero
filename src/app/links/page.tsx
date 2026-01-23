'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import { ChevronLeft, ExternalLink } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function LinksPage() {
    const { lang } = useLanguage();
    const t = translations[lang];

    const links = [
        { name: 'Autogestión SIU Guaraní', url: 'https://autogestion.fadena.undef.edu.ar/3w/', desc: 'Aquí solo pueden ingresar alumnos ya inscriptos' },
    ];

    return (
        <div className="container fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', marginBottom: '1rem', paddingRight: '0.5rem' }}>
                <Link href="/" className="back-link" style={{ marginBottom: 0 }}>
                    <ChevronLeft size={16} />
                    {t.back}
                </Link>
                <LanguageSwitcher />
            </div>

            <header style={{ marginTop: '0.5rem', marginBottom: '3rem' }}>
                <h1>{t.featured?.title}</h1>
                <p>{t.featured?.description}</p>
            </header>

            <main>
                <ul className="post-list">
                    {links.map((link) => (
                        <li key={link.url} className="post-item">
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <ExternalLink size={20} color="var(--accent)" />
                                    <span className="post-title" style={{ marginBottom: 0 }}>{link.name}</span>
                                </div>
                                <p className="post-description">{link.desc}</p>
                            </a>
                        </li>
                    ))}
                </ul>
            </main>

            <footer>
                {t.footer}
            </footer>
        </div>
    );
}
