'use client';

import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../lib/translations';
import { ChevronLeft, ExternalLink, Mail, Copy, Check, Github, Youtube } from 'lucide-react';
import LanguageSwitcher from '../../components/LanguageSwitcher';

import { useState } from 'react';

export default function LinksPage() {
    const { lang } = useLanguage();
    const t = translations[lang];
    const [copied, setCopied] = useState(false);

    const handleCopyEmail = () => {
        if (!t.contact?.email) return;
        navigator.clipboard.writeText(t.contact.email);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const links = t.links || [];

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
                <h1 style={{ color: 'var(--foreground)' }}>{t.featured?.title}</h1>
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

                <div style={{ marginTop: '4rem', marginBottom: '1rem', padding: '2rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px', borderLeft: '4px solid var(--success)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Mail size={20} color="var(--success)" />
                        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{t.contact?.title}</h2>
                    </div>
                    <p style={{ color: 'var(--muted)', marginBottom: '1rem', fontSize: '0.95rem' }}>{t.contact?.description}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={handleCopyEmail}
                            className="post-title"
                            style={{
                                fontSize: '1rem',
                                background: 'none',
                                border: 'none',
                                color: 'var(--success)',
                                cursor: 'pointer',
                                padding: 0,
                                font: 'inherit',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {t.contact?.email}
                            {copied ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Check size={16} color="var(--success)" />
                                    <span className="mobile-hide" style={{ fontSize: '0.8rem', fontWeight: 500 }}>{t.contact?.copied}</span>
                                </div>
                            ) : (
                                <Copy size={16} />
                            )}
                        </button>
                    </div>
                </div>
            </main>

            <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a href="https://youtu.be/Sdz38CpLrUs" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
                    <Youtube size={20} />
                </a>
                <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>{t.footer}</Link>
                <a href="https://github.com/gonzalogramagia/ciberportero" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
                    <Github size={18} />
                </a>
            </footer>
        </div>
    );
}
