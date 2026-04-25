'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, LogIn, Github, Youtube } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import RoomNavbar from './RoomNavbar';

export default function RoomLandingClient({ session }: any) {
    const { lang } = useLanguage();
    const router = useRouter();
    const t = translations[lang as keyof typeof translations] || translations.es;
    const roomsT = t.rooms;

    // If already logged in, redirect to lobby
    useEffect(() => {
        if (session) {
            router.push('/rooms/lobby');
        }
    }, [session, router]);

    const handleGuestEntry = () => {
        router.push('/rooms/lobby');
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', width: '100%' }}>
            <div className="container fade-in home-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
            <RoomNavbar href="/" backTextKey="back" />

            <header style={{ marginBottom: '4rem', marginTop: '2rem' }}>
                <h1 style={{ margin: 0, fontSize: '3.5rem', fontWeight: '900', color: '#000', letterSpacing: '-0.04em' }}>Rooms</h1>
                <p style={{ color: 'var(--muted)', fontSize: '1.25rem', fontWeight: '500', lineHeight: '1.6', marginTop: '0.8rem' }}>
                    {roomsT.description}
                </p>
            </header>

            <div style={{ 
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
                padding: '5rem 2rem', 
                borderRadius: '32px', 
                textAlign: 'center', 
                border: '1px solid var(--border)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem',
                flex: 1
            }}>
                <div style={{ background: '#fff', width: '64px', height: '64px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
                    <LogIn size={32} color="var(--accent)" />
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b', margin: 0 }}>
                    {roomsT.access}
                </h2>
                <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '400px', margin: '0 0 1rem 0' }}>
                    {roomsT.signInPrompt}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', alignItems: 'center', width: '100%' }}>
                    {/* <SignInButton /> */}
                    <button 
                        onClick={handleGuestEntry}
                        style={{ 
                            background: 'var(--accent)', 
                            border: 'none', 
                            color: '#fff', 
                            fontWeight: '800', 
                            padding: '1.2rem 2.5rem',
                            borderRadius: '18px',
                            cursor: 'pointer', 
                            fontSize: '1.1rem',
                            boxShadow: '0 10px 25px rgba(0, 112, 243, 0.2)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        {roomsT.guestMode}
                    </button>
                </div>
            </div>

            <footer className="footer-main" style={{ marginTop: '6rem' }}>
                <a href="https://github.com/gonzalogramagia/ciberportero" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}><Github size={18} /></a>
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
