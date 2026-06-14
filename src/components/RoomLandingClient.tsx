'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, LogIn, Github, Youtube , Coffee } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import RoomNavbar from './RoomNavbar';

import { signIn } from 'next-auth/react';

export default function RoomLandingClient({ session }: any) {
    const { lang } = useLanguage();
    const router = useRouter();
    const t = translations[lang as keyof typeof translations] || translations.es;
    const roomsT = t.rooms;

    const handleGoogleLogin = () => {
        signIn('google', { callbackUrl: '/salas/lista' });
    };

    const handleGuestEntry = () => {
        router.push('/salas/lista');
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', width: '100%' }}>
            <div className="container fade-in home-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                <RoomNavbar href="/" backTextKey="back" />

                <header style={{ marginBottom: '4rem', marginTop: '2rem' }}>
                    <h1 style={{ margin: 0, fontSize: '3.5rem', fontWeight: '900', color: '#000', letterSpacing: '-0.04em' }}>{roomsT.title}</h1>
                    <p style={{ color: 'var(--muted)', fontSize: '1.25rem', fontWeight: '500', lineHeight: '1.6', marginTop: '0.8rem' }}>
                        {roomsT.description}
                    </p>
                </header>

                <div style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(20px)',
                    padding: '4.5rem 3rem',
                    borderRadius: '40px',
                    textAlign: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2.5rem',
                    flex: 1,
                    marginBottom: '2rem'
                }}>
                    <div style={{
                        background: '#fff',
                        width: '80px',
                        height: '80px',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 12px 25px rgba(0, 112, 243, 0.1)',
                        border: '1px solid #f1f5f9'
                    }}>
                        <LogIn size={40} color="var(--accent)" strokeWidth={2.5} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <p style={{
                            color: '#1e293b',
                            fontSize: '1.4rem',
                            fontWeight: '800',
                            maxWidth: '450px',
                            margin: 0,
                            lineHeight: '1.4',
                            letterSpacing: '-0.02em',
                            whiteSpace: 'pre-wrap'
                        }}>
                            {roomsT.signInPrompt}
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', width: '100%', maxWidth: '450px' }}>
                        <button
                            onClick={handleGoogleLogin}
                            style={{
                                background: '#fff',
                                border: '1px solid #e2e8f0',
                                color: '#1e293b',
                                fontWeight: '700',
                                padding: '1.1rem 1.5rem',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '1.05rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '1rem',
                                width: '100%',
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f8fafc';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#fff';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                            }}
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
                            </svg>
                            <span>{roomsT.googleSignIn}</span>
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '1rem', margin: '0.5rem 0' }}>
                            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                            <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '700' }}>{roomsT.or}</span>
                            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                        </div>

                        <button
                            onClick={handleGuestEntry}
                            style={{
                                background: '#fff',
                                border: '2px solid var(--accent)',
                                color: 'var(--accent)',
                                fontWeight: '800',
                                padding: '1.2rem 2rem',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '1.1rem',
                                boxShadow: '0 4px 12px rgba(0, 112, 243, 0.05)',
                                transition: 'all 0.2s',
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.8rem'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(0, 112, 243, 0.03)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#fff';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            {roomsT.guestMode}
                        </button>
                    </div>
                </div>

                <footer className="footer-main" style={{ marginTop: '6rem' }}>
                    <a href="https://cafecito.app/gonzagramaglia" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}><Coffee size={18} /></a>
                    <span>{t.footer}</span>
                    <a href="https://youtu.be/Sdz38CpLrUs" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}><Youtube size={22} /></a>
                </footer>

                <style jsx>{`
                .home-container { max-width: 900px; margin: 0 auto; }
                .fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
            </div>
        </div>
    );
}
