'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Hash, Key, ArrowRight, X, ChevronLeft, Github, Youtube, Loader2, Trash2 } from 'lucide-react';
import { createRoom, joinRoom, deleteRoom } from '@/lib/salasActions';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import RoomNavbar from './RoomNavbar';
import { guestStore } from '@/lib/guestStore';
import { slugify } from '@/lib/utils';

import { SignOutButton } from './AuthButtons';

export default function RoomLobbyClient({ initialRooms, session }: any) {
    const { lang } = useLanguage();
    const t = translations[lang as keyof typeof translations] || translations.es;
    const roomsT = t.rooms;
    const isGuest = !session;
    const isAdmin = session?.user?.role === 'admin' || session?.user?.email === 'ciberportero@gmail.com';
    const canCreate = isGuest || isAdmin;

    const [rooms, setRooms] = useState(initialRooms || []);
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomSlug, setNewRoomSlug] = useState('');
    const [newRoomCode, setNewRoomCode] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    React.useEffect(() => {
        document.body.style.background = '#f8fafc';
        return () => { document.body.style.background = ''; };
    }, []);

    React.useEffect(() => {
        if (isGuest) {
            const guestRooms = guestStore.getRooms();
            setRooms(guestRooms);
        } else {
            setRooms(initialRooms);
        }
    }, [isGuest, initialRooms]);

    const handleDeleteRoom = async (e: React.MouseEvent, room: any) => {
        e.stopPropagation();
        if (!confirm(lang === 'es' ? '¿Estás seguro de que quieres eliminar esta sala?' : 'Are you sure you want to delete this room?')) return;
        
        if (isGuest) {
            guestStore.deleteRoom(room.id);
            setRooms(guestStore.getRooms());
            toast.success(lang === 'es' ? 'Sala eliminada' : 'Room deleted');
        } else {
            const res = await deleteRoom(room.id);
            if (res.success) {
                toast.success(lang === 'es' ? 'Sala eliminada' : 'Room deleted');
                setRooms((prev: any) => prev.filter((r: any) => r.id !== room.id));
            } else {
                toast.error(res.error || 'Error');
            }
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canCreate) {
            toast.error(lang === 'es' ? 'Solo los administradores pueden crear salas oficiales.' : 'Only admins can create official rooms.');
            return;
        }
        if (!newRoomName || !newRoomCode || !newRoomSlug) return;
        setLoading(true);

        if (isGuest) {
            const res = guestStore.createRoom(newRoomName, newRoomCode, newRoomSlug);
            if ((res as any).error) {
                toast.error((res as any).error);
                setLoading(false);
                return;
            }
            setRooms(guestStore.getRooms());
            toast.success(lang === 'es' ? '¡Sala creada!' : 'Room created!');
            router.push(`/salas/${newRoomSlug}`);
            setIsCreating(false);
        } else {
            const res = await createRoom(newRoomName, newRoomCode, newRoomSlug);
            if (res.success) {
                toast.success(lang === 'es' ? 'Sala creada!' : 'Room created!');
                router.push(`/salas/${res.roomId}`);
            } else {
                toast.error(res.error || 'Error');
            }
        }
        setLoading(false);
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinCode) return;
        setLoading(true);

        if (isGuest) {
            const gRoom = guestStore.getData().rooms.find(r => r.secretCode === joinCode);
            if (gRoom) {
                toast.success(lang === 'es' ? '¡Te uniste!' : 'Joined!');
                router.push(`/salas/${gRoom.id}`);
            } else {
                toast.error(lang === 'es' ? 'Código incorrecto' : 'Incorrect code');
            }
        } else {
            const res = await joinRoom(joinCode);
            if (res.success) {
                toast.success(lang === 'es' ? 'Te uniste!' : 'Joined!');
                router.push(`/salas/${res.roomId}`);
            } else {
                toast.error(lang === 'es' ? 'Código incorrecto' : 'Incorrect code');
            }
        }
        setLoading(false);
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', width: '100%' }}>
            <div className="container fade-in home-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
            <RoomNavbar href={session ? "/" : "/salas"} backTextKey={session ? "back" : "backToRooms"} />

            <header className="lobby-header-premium">
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                    <h1 className="lobby-title">
                        {roomsT.lobbyTitle}
                    </h1>
                    {!isGuest && session?.user && (
                        <div className="user-actions">
                            <SignOutButton />
                        </div>
                    )}
                </div>
                <p className="lobby-desc">
                    {!isGuest && session?.user?.name && (
                        <span style={{ color: 'var(--accent)', fontWeight: '800' }}>
                            ¡Hola {session.user.name.split(' ')[0]}!{' '}
                        </span>
                    )}
                    {roomsT.description}
                </p>
            </header>

            <main style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                {isGuest && (
                    <div style={{ background: '#fff9db', padding: '1.2rem', borderRadius: '16px', border: '1px solid #fcc419', color: '#856404', fontSize: '0.95rem', fontWeight: '700', marginBottom: '-2rem', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        ⚠️ {roomsT.guestWarning}
                    </div>
                )}

                <div className="lobby-actions-grid">
                    <button onClick={() => setIsJoining(true)} className="action-card join">
                        <div className="card-icon"><Hash size={24} /></div>
                        <div className="card-body">
                            <h3>{roomsT.join.title}</h3>
                            <p>{roomsT.join.desc}</p>
                        </div>
                    </button>

                    <button 
                        onClick={() => canCreate ? setIsCreating(true) : toast.error(lang === 'es' ? 'Opción solo para administradores' : 'Option for admins only')} 
                        className={`action-card create ${!canCreate ? 'blocked' : ''}`}
                    >
                        <div className="card-icon"><Plus size={24} /></div>
                        <div className="card-body">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <h3>{roomsT.create.title}</h3>
                                {!canCreate && <span className="lock-badge">SOLO ADMINS</span>}
                            </div>
                            <p>{roomsT.create.desc}</p>
                        </div>
                    </button>
                </div>

                <div style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ height: '2px', flex: 1, background: 'linear-gradient(90deg, transparent, #e2e8f0)' }}></div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', margin: 0 }}>
                            {roomsT.myRooms}
                        </h2>
                        <div style={{ height: '2px', flex: 1, background: 'linear-gradient(90deg, #e2e8f0, transparent)' }}></div>
                    </div>
                    
                    {rooms.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#fff', borderRadius: '40px', border: '2px dashed #e2e8f0', color: '#94a3b8', boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.02)' }}>
                            {session?.user ? (
                                <div className="empty-state-content">
                                    <div className="empty-icon-wrapper">
                                        <Hash size={40} />
                                    </div>
                                    <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#1e293b', marginBottom: '0.8rem' }}>
                                        {lang === 'es' ? `¡Hola, ${session.user.name.split(' ')[0]}!` : `Hi, ${session.user.name.split(' ')[0]}!`}
                                    </h3>
                                    <p style={{ fontSize: '1.15rem', fontWeight: '500', color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>
                                        {lang === 'es' ? 'Parece que todavía no te has unido a ninguna sala. ¡Explora o crea una nueva para empezar!' : "It seems you haven't joined any rooms yet. Explore or create one to get started!"}
                                    </p>
                                </div>
                            ) : (
                                <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>{roomsT.noRooms}</p>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {rooms.map((room: any) => (
                                <div key={room.id} onClick={() => router.push(`/salas/${room.id}`)} className="room-card" style={{ cursor: 'pointer' }}>
                                    <div className="room-card-info" style={{ flex: 1 }}>
                                        <span className="room-name">
                                            {room.name}
                                            {isGuest && (
                                                <span className="demo-badge">{room.id === 'test-room' ? 'MODO DEMO' : 'SALA TEMPORAL (ADMIN)'}</span>
                                            )}
                                            {(room.creator?.role === 'admin' || room.creator?.email === 'ciberportero@gmail.com') && !isGuest && (
                                                <span className="admin-badge-lobby">SALA OFICIAL (ADMIN)</span>
                                            )}
                                        </span>
                                        <div className="room-code-tag">
                                            <Key size={12} />
                                            <span>{room.secretCode}</span>
                                        </div>
                                        {room.description && (
                                            <p className="room-desc-lobby">{room.description}</p>
                                        )}
                                    </div>
                                    <div className="room-card-actions">
                                        <div className="room-members-preview" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <div style={{ display: 'flex' }}>
                                                {room.members?.slice(0, 6).map((member: any, i: number) => (
                                                    <img 
                                                        key={member.id} 
                                                        src={member.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent((member.user.name || 'U').replace(/\s*\([^)]*\)/g, '').trim())}&background=random&color=fff`} 
                                                        alt={member.user.name} 
                                                        style={{ 
                                                            width: '32px', 
                                                            height: '32px', 
                                                            borderRadius: '50%', 
                                                            border: '3px solid #fff', 
                                                            marginLeft: i === 0 ? 0 : '-12px',
                                                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                                            zIndex: 6 - i
                                                        }} 
                                                    />
                                                ))}
                                                {room.members?.length > 6 && (
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', border: '3px solid #fff', marginLeft: '-12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', zIndex: 0 }}>
                                                        +{room.members.length - 6}
                                                    </div>
                                                )}
                                            </div>
                                            <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: '700' }}>
                                                {room._count?.members ?? (room.members?.length || 0)}{' '}
                                                {lang === 'es' 
                                                    ? ((room._count?.members ?? room.members?.length) === 1 ? 'miembro' : 'miembros') 
                                                    : 'members'}
                                            </span>
                                        </div>

                                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <div className="room-card-arrow"><ArrowRight size={24} /></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            </div>
            {(isCreating || isJoining) && (
                <div 
                    className="lightbox-overlay" 
                    onClick={() => { setIsCreating(false); setIsJoining(false); }}
                    style={{ zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(12px)', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', cursor: 'pointer' }}
                >
                    <div 
                        className="lightbox-content fade-in-up rooms-modal-content" 
                        onClick={(e) => e.stopPropagation()}
                        style={{ 
                            background: '#fff', 
                            padding: '0', 
                            borderRadius: '40px', 
                            maxWidth: '850px', 
                            width: '95%', 
                            boxShadow: '0 50px 100px rgba(0,0,0,0.3)',
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'flex',
                            minHeight: '400px',
                            cursor: 'default'
                        }}
                    >
                        <button 
                            className="lightbox-close modal-close-btn" 
                            onClick={() => { setIsCreating(false); setIsJoining(false); }} 
                        >
                            <X size={20} strokeWidth={3} />
                        </button>

                        {/* Left Side: Info */}
                        <div style={{ 
                            flex: '1', 
                            padding: '4rem 3rem', 
                            background: isCreating 
                                ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' 
                                : 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center',
                            gap: '2rem',
                            alignSelf: 'stretch',
                            color: '#fff'
                        }}>
                            <div style={{ 
                                background: 'rgba(255, 255, 255, 0.2)', 
                                backdropFilter: 'blur(10px)',
                                width: '110px', 
                                height: '110px', 
                                borderRadius: '32px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                color: '#fff',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                border: '1px solid rgba(255,255,255,0.3)'
                            }}>
                                {isCreating ? <Plus size={54} /> : <Hash size={54} />}
                            </div>
                            <div>
                                <h2 style={{ fontSize: '2.8rem', fontWeight: '900', marginBottom: '1rem', color: '#fff', letterSpacing: '-0.04em', lineHeight: '1.1' }}>
                                    {isCreating ? roomsT.modal.createTitle : roomsT.modal.joinTitle}
                                </h2>
                                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.15rem', lineHeight: '1.6', maxWidth: '300px', margin: '0 auto', fontWeight: '500' }}>
                                    {isCreating ? roomsT.create.desc : roomsT.join.desc}
                                </p>
                            </div>
                        </div>

                        {/* Right Side: Form */}
                        <div style={{ flex: '1.3', padding: '4rem 3.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#fff' }}>
                            <form onSubmit={isCreating ? handleCreate : handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                                {isCreating && (
                                    <>
                                        <div className="form-group">
                                            <label style={{ fontSize: '0.95rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{roomsT.modal.nameLabel}</label>
                                            <input 
                                                style={{ height: '64px', fontSize: '1.15rem' }} 
                                                value={newRoomName} 
                                                onChange={e => {
                                                    setNewRoomName(e.target.value);
                                                    setNewRoomSlug(slugify(e.target.value));
                                                }} 
                                                required 
                                                placeholder={roomsT.modal.namePlaceholder} 
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ fontSize: '0.95rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Identificador (URL Slug)</label>
                                            <div className="input-with-icon">
                                                <div style={{ position: 'absolute', left: '1.6rem', color: '#94a3b8', fontSize: '0.9rem', fontWeight: '800' }}>/salas/</div>
                                                <input 
                                                    style={{ paddingLeft: '5.5rem', height: '64px', fontSize: '1.15rem', background: '#f1f5f9' }} 
                                                    value={newRoomSlug} 
                                                    onChange={e => setNewRoomSlug(slugify(e.target.value))} 
                                                    required 
                                                    placeholder="ej-analisis-matematico-i" 
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                                <div className="form-group">
                                    <label style={{ fontSize: '0.95rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{roomsT.modal.codeLabel}</label>
                                    <div className="input-with-icon">
                                        <Key size={22} className="input-icon" style={{ position: 'absolute', left: '1.6rem', color: '#94a3b8' }} />
                                        <input 
                                            style={{ paddingLeft: '4rem', height: '64px', fontSize: '1.15rem' }} 
                                            value={isCreating ? newRoomCode : joinCode} 
                                            onChange={e => isCreating ? setNewRoomCode(e.target.value) : setJoinCode(e.target.value)} 
                                            required 
                                            placeholder={roomsT.modal.codePlaceholder} 
                                        />
                                    </div>
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={loading} 
                                    className="form-submit-button" 
                                    style={{ 
                                        width: '100%', 
                                        marginTop: '1.2rem', 
                                        height: '72px', 
                                        fontSize: '1.3rem', 
                                        fontWeight: '900', 
                                        borderRadius: '22px', 
                                        background: isCreating ? '#10b981' : 'var(--accent)',
                                        boxShadow: isCreating ? '0 15px 35px rgba(16, 185, 129, 0.3)' : '0 15px 35px rgba(0, 112, 243, 0.3)'
                                    }}
                                >
                                    {loading ? <Loader2 size={24} className="spin" /> : (isCreating ? roomsT.modal.createTitle : roomsT.modal.joinTitle)}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
                <footer className="footer-main" style={{ marginTop: '2.5rem' }}>
                    <a href="https://github.com/gonzalogramagia/ciberportero" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}><Github size={18} /></a>
                    <span>{t.footer}</span>
                    <a href="https://youtu.be/Sdz38CpLrUs" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}><Youtube size={22} /></a>
                </footer>
            </div>

            <style jsx>{`
                .lobby-header-premium { display: flex; flex-direction: column; margin-bottom: 4rem; margin-top: 2rem; gap: 0.8rem; }
                .lobby-title { margin: 0; fontSize: 3.5rem; fontWeight: 900; color: #000; letterSpacing: -0.04em; }
                .lobby-desc { color: var(--muted); fontSize: 1.25rem; fontWeight: 500; lineHeight: 1.6; margin: 0.8rem 0 0 0; }
                
                .user-actions { display: flex; align-items: center; gap: 0.8rem; }

                .empty-icon-wrapper { width: 80px; height: 80px; background: #f8fafc; color: #e2e8f0; border-radius: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem auto; }

                @media (max-width: 900px) {
                    .lobby-header-premium { flex-direction: column; align-items: flex-start; gap: 2rem; }
                    .lobby-title { font-size: 2.8rem; }
                    .user-profile-badge { width: 100%; justify-content: space-between; }
                }

                .form-group { display: flex; flex-direction: column; gap: 0.8rem; }
                .form-group label { font-size: 1rem; font-weight: 800; color: #1e293b; }
                .form-group input { padding: 0 1.5rem; border-radius: 20px; border: 2px solid #f1f5f9; background: #f8fafc; width: 100%; font-size: 1.1rem; transition: all 0.2s; }
                .form-group input:focus { border-color: var(--accent); background: #fff; outline: none; }
                .input-with-icon { position: relative; display: flex; align-items: center; }
                .action-card { display: flex; align-items: flex-start; gap: 1.5rem; padding: 2rem; border-radius: 24px; border: 1px solid var(--border); background: #fff; cursor: pointer; transition: all 0.3s; text-align: left; }
                .action-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
                .action-card.join:hover { border-color: var(--accent); }
                .action-card.create:hover { border-color: var(--success); }
                .action-card.create.blocked { opacity: 0.6; cursor: not-allowed; filter: grayscale(0.5); }
                .action-card.create.blocked:hover { transform: none; box-shadow: none; border-color: var(--border); }
                .lock-badge { font-size: 0.65rem; background: #fee2e2; color: #ef4444; padding: 0.2rem 0.5rem; border-radius: 6px; font-weight: 900; }
                .card-icon { width: 54px; height: 54px; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .join .card-icon { background: rgba(0, 112, 243, 0.08); color: var(--accent); }
                .create .card-icon { background: rgba(16, 185, 129, 0.08); color: var(--success); }
                .card-body h3 { margin: 0 0 0.4rem 0; font-size: 1.25rem; font-weight: 800; color: #1e293b; }
                .card-body p { margin: 0; color: #64748b; font-size: 0.95rem; }
                .form-submit-button { border: none; color: white; cursor: pointer; transition: all 0.3s; }
                .form-submit-button:hover:not(:disabled) { transform: translateY(-3px); filter: brightness(1.1); }
                .room-card { display: flex; align-items: center; justify-content: space-between; padding: 2.2rem 2.5rem; background: #fff; border-radius: 32px; border: 1px solid var(--border); transition: all 0.3s; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
                .room-card:hover { border-color: var(--accent); transform: translateY(-5px); box-shadow: 0 25px 50px rgba(0, 112, 243, 0.12); }
                .room-card-info { flex: 1; min-width: 0; }
                .room-name { font-size: 1.7rem; font-weight: 950; color: #1e293b; display: flex; align-items: center; letter-spacing: -0.02em; flex-wrap: wrap; gap: 0.8rem; margin-bottom: 0.8rem; }
                .room-desc-lobby { margin: 0.5rem 0 0 0; font-size: 1.05rem; color: #64748b; line-height: 1.5; max-width: 600px; font-weight: 500; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                
                .demo-badge, .admin-badge-lobby, .room-code-tag { 
                    font-size: 0.75rem; 
                    font-weight: 900; 
                    padding: 0.4rem 0.8rem; 
                    border-radius: 10px; 
                    text-transform: uppercase; 
                    letter-spacing: 0.05em; 
                    display: inline-flex; 
                    align-items: center; 
                    gap: 0.4rem;
                }
                
                .demo-badge { background: #fff1f2; color: #ef4444; border: 1px solid #fee2e2; }
                .admin-badge-lobby { background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; }
                .room-code-tag { margin-top: 0; color: var(--accent); background: rgba(0, 112, 243, 0.05); border: 1px solid rgba(0, 112, 243, 0.1); }
                
                .delete-room-btn { 
                    width: 56px; 
                    height: 56px; 
                    border-radius: 18px; 
                    border: none; 
                    background: #fff1f2; 
                    color: #ef4444; 
                    cursor: pointer; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    transition: all 0.2s;
                    flex-shrink: 0;
                }
                .delete-room-btn:hover { background: #ef4444; color: #fff; transform: scale(1.05); }
                .room-card-actions { display: flex; align-items: center; gap: 0.8rem; }

                .room-card-arrow { width: 56px; height: 56px; border-radius: 18px; background: #f8fafc; display: flex; align-items: center; justify-content: center; color: #cbd5e1; transition: all 0.3s; flex-shrink: 0; }
                .room-card:hover .room-card-arrow { background: var(--accent); color: #fff; }
                .room-members-preview img { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
                .room-members-preview img:hover { transform: translateY(-4px) scale(1.2); z-index: 20 !important; }
                .lobby-actions-grid { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: 2rem; 
                }
                @media (max-width: 1024px) {
                    .lobby-actions-grid { 
                        grid-template-columns: 1fr; 
                    }
                }

                .modal-close-btn {
                    position: absolute;
                    top: 1.5rem;
                    right: 1.5rem;
                    background: rgba(15, 23, 42, 0.1);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    width: 44px;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #64748b;
                    zIndex: 10;
                    transition: all 0.2s;
                }

                .modal-close-btn:hover {
                    background: rgba(15, 23, 42, 0.2);
                    transform: scale(1.1);
                }

                @media (max-width: 768px) {
                    .rooms-modal-content {
                        flex-direction: column !important;
                        max-width: 450px !important;
                        min-height: auto !important;
                    }
                    .rooms-modal-content > div {
                        padding: 2.5rem 1.5rem !important;
                    }
                    .rooms-modal-content h2 {
                        font-size: 2.2rem !important;
                    }
                    .modal-close-btn {
                        color: white;
                        background: rgba(255, 255, 255, 0.2);
                        top: 1rem;
                        right: 1rem;
                    }
                }

                @media (max-width: 640px) {
                    .room-card { padding: 1.5rem; border-radius: 24px; gap: 1.25rem; flex-direction: column; align-items: stretch; }
                    .room-card-info { width: 100%; }
                    .room-name { font-size: 1.4rem; gap: 0.5rem; margin-bottom: 0.5rem; }
                    .room-card-actions { width: 100%; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #f8fafc; padding-top: 1.25rem; }
                    .room-card-arrow { width: 48px; height: 48px; border-radius: 14px; }
                    .demo-badge, .admin-badge-lobby, .room-code-tag { font-size: 0.65rem; padding: 0.3rem 0.6rem; border-radius: 8px; }
                    .lobby-header-premium { margin-bottom: 2rem; }
                    .lobby-title { font-size: 2.2rem; }
                }
            `}</style>
        </div>
    );
}
