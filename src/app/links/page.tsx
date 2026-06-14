'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../lib/translations';
import { ChevronLeft, ExternalLink, Mail, Copy, Check, Github, Youtube, Calendar, Zap } from 'lucide-react';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useState, useEffect, useMemo } from 'react';
import NotificationBanners from '../../components/NotificationBanners';
import CountdownWidget from '../../components/CountdownWidget';
import { useSession } from "next-auth/react";
import { SignInButton, SignOutButton } from "@/components/AuthButtons";
import SyncedBadge from "@/components/SyncedBadge";
import { createPersonalLink, deletePersonalLink } from "@/lib/actions";
import CommentSection from "@/components/CommentSection";
import { Trash2, Plus, X as CloseIcon } from "lucide-react";

export default function LinksPage() {
    const { data: session, status } = useSession();
    const { lang } = useLanguage();
    const t = translations[lang];
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        document.title = 'Ciberportero | Links';
    }, []);


    const handleCopyEmail = () => {
        if (!t.contact?.email) return;
        navigator.clipboard.writeText(t.contact.email);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const linksOld = t.links || [];
    const [dbLinks, setDbLinks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/links')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setDbLinks(data);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newLink, setNewLink] = useState({ name: '', url: '', description: '' });
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveLink = async () => {
        if (!newLink.name || !newLink.url) return;
        setIsSaving(true);
        const res = await createPersonalLink(newLink);
        if (res.success) {
            setIsAddModalOpen(false);
            setNewLink({ name: '', url: '', description: '' });
            // Refresh links
            const response = await fetch('/api/links');
            const data = await response.json();
            if (Array.isArray(data)) setDbLinks(data);
        }
        setIsSaving(false);
    };

    const handleDeleteLink = async (id: string) => {
        if (!confirm(lang === 'es' ? '¿Eliminar este enlace?' : 'Delete this link?')) return;
        const res = await deletePersonalLink(id);
        if (res.success) {
            setDbLinks(prev => prev.filter(l => l.id !== id));
        }
    };

    // Separate admin links and user links
    const { adminLinks, userLinks } = useMemo(() => {
        const admin = dbLinks.filter(l => !l.userId);
        const user = dbLinks.filter(l => l.userId === session?.user?.id);
        return { adminLinks: admin, userLinks: user };
    }, [dbLinks, session?.user?.id]);

    const linksToRender = dbLinks.length > 0 ? [...userLinks, ...adminLinks] : (isLoading ? [] : linksOld);

    return (
        <div className="container fade-in page-container">
            <CountdownWidget />

            <NotificationBanners limitTo="none" />


            <div className="nav-header-row">
                <Link href="/" className="back-link">
                    <ChevronLeft size={18} />
                    {t.back}
                </Link>
                <div className="mobile-only">
                    <LanguageSwitcher />
                </div>
            </div>

            <header style={{ marginTop: '0.25rem', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1.5rem' }}>
                    <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.2rem' }}>
                            <h1 style={{ margin: 0, fontSize: '3rem', fontWeight: '900', color: '#000', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                {t.featured?.title}
                                <div style={{
                                    opacity: status === 'loading' ? 0 : 1,
                                    transition: 'opacity 0.2s',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    {status !== 'loading' && (session ? <SignOutButton /> : <SignInButton />)}
                                </div>
                            </h1>
                            <div className="mobile-hide">
                                <LanguageSwitcher />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
                            <p style={{ color: 'var(--muted)', fontSize: '1.2rem', margin: 0, fontWeight: '500' }} dangerouslySetInnerHTML={{ __html: t.featured?.description || '' }} />
                            {status === 'authenticated' && (
                            (session?.user?.role === 'admin' || session?.user?.email === 'ciberportero@gmail.com') ? (
                                <Link
                                    href="/admin/links"
                                    className="add-link-btn"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        background: '#000',
                                        color: '#fff',
                                        padding: '0.8rem 1.5rem',
                                        borderRadius: '14px',
                                        border: 'none',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        textDecoration: 'none'
                                    }}
                                >
                                    <Plus size={20} />
                                    {lang === 'es' ? 'Agregar link' : lang === 'pt' ? 'Adicionar link' : 'Add link'}
                                </Link>
                            ) : (
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="add-link-btn"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        background: '#000',
                                        color: '#fff',
                                        padding: '0.8rem 1.5rem',
                                        borderRadius: '14px',
                                        border: 'none',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <Plus size={20} />
                                    {(translations[lang] as any).addPersonalized}
                                </button>
                            )
                        )}
                        </div>
                    </div>
                </div>
            </header>

            <main>
                {/* Helper to render a single link card */}
                {(() => {
                    const renderLink = (link: any) => {
                        const name = typeof link.name === 'object' ? (link.name[lang] || link.name.es) : link.name;
                        const isPersonal = !!link.userId;
                        const iconData = link.iconType || '';
                        const isExternal = !iconData || iconData === 'external';

                        let iconSrc = iconData;
                        if (iconData === 'whatsapp') iconSrc = '/wsp.png';
                        if (iconData === 'discord') iconSrc = '/discord.png';
                        if (iconData === 'drive') iconSrc = '/drive.webp';
                        if (iconData === 'moodle') iconSrc = '/moodle.png';
                        if (iconData === 'youtube') iconSrc = '/youtube.png';
                        if (iconData === 'siu') iconSrc = '/siu-guarani.png';

                        const iconW = iconData === 'discord' ? 34 : iconData === 'drive' ? 46 : iconData === 'youtube' ? 44 : 40;
                        const iconH = iconData === 'drive' ? 38 : iconData === 'youtube' ? 44 : 40;

                        return (
                            <li key={link.id || link.url} className={`post-item ${isPersonal ? 'is-personal' : ''}`} style={{ marginBottom: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                                    <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
                                        <div style={{ width: 46, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                                            {!isExternal ? (
                                                <Image src={iconSrc} alt="link icon" width={iconW} height={iconH} style={{ flexShrink: 0, borderRadius: '8px', objectFit: 'contain' }} />
                                            ) : (
                                                <ExternalLink size={28} color={isPersonal ? "#8b5cf6" : "var(--accent)"} />
                                            )}
                                        </div>
                                        <span className="post-title" style={{ marginBottom: 0, fontSize: '1.2rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {isPersonal && <span style={{ color: '#8b5cf6', marginRight: '0.5rem' }}>★</span>}
                                            {name}
                                        </span>
                                    </a>
                                    {isPersonal && (
                                        <button
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteLink(link.id); }}
                                            style={{ flexShrink: 0, border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', opacity: 0.5, padding: '4px', transition: 'opacity 0.2s' }}
                                            className="delete-link-btn"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    )}
                                </div>
                            </li>
                        );
                    };

                    return (
                        <>
                            {/* Personal links section */}
                            {userLinks.length > 0 && (
                                <>
                                    <ul className="post-list links-grid" style={{ marginBottom: '1.5rem' }}>
                                        {userLinks.map(renderLink)}
                                    </ul>
                                    {adminLinks.length > 0 && (
                                        <div style={{ height: '1px', background: 'var(--border)', margin: '1.5rem 0', opacity: 0.4 }} />
                                    )}
                                </>
                            )}

                            {/* Admin links section */}
                            <ul className="post-list links-grid">
                                {(userLinks.length > 0 ? adminLinks : linksToRender).map(renderLink)}
                                {isLoading && (
                                    <>
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} style={{
                                                height: '100px', background: 'white', borderRadius: '24px',
                                                border: '1px solid #f1f5f9', padding: '1.5rem',
                                                display: 'flex', alignItems: 'center', gap: '1.5rem',
                                                animation: 'pulse 2.5s infinite',
                                                animationDelay: `${i * 0.15}s`,
                                                gridColumn: 'span 1'
                                            }}>
                                                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#f1f5f9', flexShrink: 0 }} />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ height: '1.2rem', width: '70%', background: '#f1f5f9', borderRadius: '4px', marginBottom: '0.5rem' }} />
                                                    <div style={{ height: '0.8rem', width: '40%', background: '#f8fafc', borderRadius: '4px' }} />
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </ul>
                        </>
                    );
                })()}

                <div className="contact-container" style={{ marginTop: '4rem', marginBottom: '1.25rem', padding: '2.5rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '24px', border: '1px solid rgba(16, 185, 129, 0.1)', borderLeft: '4px solid var(--success)' }}>
                    <div className="contact-container-inner">
                        <Mail size={22} color="var(--success)" />
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>{t.contact?.title}</h2>
                    </div>
                    <p style={{ color: 'var(--muted)', marginBottom: '1.5rem', fontSize: '1rem', fontWeight: '500' }}>{t.contact?.description}</p>
                    <div className="contact-container-inner">
                        <button
                            onClick={handleCopyEmail}
                            className="post-title email-button"
                            style={{
                                fontSize: '1.1rem',
                                background: 'none',
                                border: 'none',
                                color: 'var(--success)',
                                cursor: 'pointer',
                                padding: 0,
                                font: 'inherit',
                                textAlign: 'inherit',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem'
                            }}
                        >
                            {t.contact?.email}
                            {copied ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Check size={18} color="var(--success)" />
                                    <span className="mobile-hide" style={{ fontSize: '0.9rem', fontWeight: 700 }}>{t.contact?.copied}</span>
                                </div>
                            ) : (
                                <Copy size={18} />
                            )}
                        </button>
                    </div>
                </div>
            </main>

            <CommentSection postSlug="links" lang={lang} />

            <footer className="footer-main">
                <a href="https://github.com/gonzagramaglia/ciberportero" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
                    <Github size={18} />
                </a>
                <span>{t.footer}</span>
                <a href="https://youtu.be/Sdz38CpLrUs" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
                    <Youtube size={22} />
                </a>
            </footer>
            {isAddModalOpen && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div className="modal-content" style={{
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '400px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontWeight: '900' }}>{lang === 'es' ? 'Nuevo link personal' : 'New personal link'}</h3>
                            <button onClick={() => setIsAddModalOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                                <CloseIcon size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--muted)' }}>{lang === 'es' ? 'Nombre' : 'Name'}</label>
                                <input
                                    type="text"
                                    value={newLink.name}
                                    onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                                    placeholder="Ej: Mi Portfolio"
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border)' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--muted)' }}>URL</label>
                                <input
                                    type="url"
                                    value={newLink.url}
                                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                                    placeholder="https://..."
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border)' }}
                                />
                            </div>


                            <button
                                onClick={handleSaveLink}
                                disabled={isSaving}
                                style={{
                                    background: '#000',
                                    color: '#fff',
                                    padding: '1rem',
                                    borderRadius: '14px',
                                    border: 'none',
                                    fontWeight: '800',
                                    marginTop: '0.5rem',
                                    cursor: 'pointer',
                                    opacity: isSaving ? 0.7 : 1
                                }}
                            >
                                {isSaving ? (lang === 'es' ? 'Guardando...' : lang === 'pt' ? 'Salvando...' : 'Saving...') : (lang === 'es' ? 'Guardar' : lang === 'pt' ? 'Salvar' : 'Save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                :global(.post-item.is-personal) {
                    border-color: rgba(139, 92, 246, 0.4);
                    background: rgba(139, 92, 246, 0.02);
                }
                :global(.post-item.is-personal:hover) {
                    border-color: #8b5cf6;
                    box-shadow: 0 8px 30px rgba(139, 92, 246, 0.1);
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: .6; }
                }
            `}</style>
        </div>
    );
}
