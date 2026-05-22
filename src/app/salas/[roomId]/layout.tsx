import { auth } from "@/auth";
import { ChevronLeft } from "lucide-react";
import { getRoomDetails } from "@/lib/salasActions";
import RoomSidebar from "@/components/RoomSidebar";
import { cookies } from "next/headers";
import { Locale, translations } from "@/lib/translations";
import { redirect } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import RoomHeader from "@/components/RoomHeader";
import { Github, Youtube } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import RoomNavbar from "@/components/RoomNavbar";
import RoomTitleUpdater from "@/components/RoomTitleUpdater";

export async function generateMetadata({ params }: any): Promise<Metadata> {
  try {
    const p = await params;
    const roomId = p?.roomId;
    if (!roomId) return { title: 'Ciberportero' };

    const isGuestRoom = roomId.startsWith('guest-room-') || roomId === 'test-room';

    if (isGuestRoom) {
      const cookieStore = await cookies();
      const lang = (cookieStore.get('lang')?.value as Locale) || 'es';
      const t = translations[lang].metadata;
      return {
        title: roomId === 'test-room' ? t.testRoom : t.guestRoom,
        description: 'Explora y colabora en esta sala de estudio en Ciberportero.'
      };
    }

    const room = await getRoomDetails(roomId);
    if (room) {
      return {
        title: room.name,
        description: `Únete a la sala ${room.name} para estudiar en grupo y compartir recursos.`
      };
    }
  } catch (e) {
    console.error("Metadata error:", e);
  }

  return {
    title: 'Sala de Estudio',
    description: 'Colabora con tu grupo de estudio en tiempo real.'
  };
}

export default async function RoomDetailLayout({ children, params }: any) {
  let roomId = "";
  try {
    const p = await params;
    roomId = p?.roomId || "";
  } catch (e) {
    redirect('/salas/lista');
  }

  if (!roomId) redirect('/salas/lista');

  const session = await auth();

  let room = null;
  if (session && roomId) {
    room = await getRoomDetails(roomId);
  }

  const isGuestRoom = !room;

  if (isGuestRoom) {
    const cookieStore = await cookies();
    const lang = (cookieStore.get('lang')?.value as Locale) || 'es';
    const isTest = roomId === 'test-room';
    room = {
      id: roomId,
      name: isTest ? 'Grupo de Estudio Ciberdefensa 🛡️' : (lang === 'es' ? 'Cargando Room...' : 'Loading Room...'),
      secretCode: isTest ? 'CIBERDEFENSA-2026' : '...',
      creatorId: isTest ? 'admin' : 'guest',
      description: isTest ? 'Espacio colaborativo para estudiantes de Ciberdefensa. Compartimos material, resolvemos dudas de laboratorios y nos preparamos para los parciales juntos.' : '',
      categories: [],
      members: []
    };
  }

  if (!room) redirect('/salas/lista');

  const cookieStore = await cookies();
  const lang = (cookieStore.get('lang')?.value as Locale) || 'es';
  const t = translations[lang];

  return (
    <div className="container fade-in post-container" style={{ paddingTop: '2rem', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <RoomTitleUpdater roomId={roomId} fallbackTitle={`Ciberportero | ${room.name}`} />
      <RoomNavbar href="/salas/lista" backTextKey="backToLobby" />

      <RoomHeader
        roomId={roomId}
        initialRoom={{
          name: room.name,
          secretCode: room.secretCode,
          creatorId: room.creatorId,
          creatorRole: (room as any).creator?.role,
          creatorEmail: (room as any).creator?.email,
          description: (room as any).description || '',
          members: (room as any).members || []
        } as any}
        session={session}
      />

      <div className="room-content-layout" style={{ display: 'flex', gap: '2rem', flex: 1 }}>
        <RoomSidebar room={room} session={session} />
        <main style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>

      <footer className="footer-main" style={{ marginTop: '2rem' }}>
        <a href="https://github.com/gonzagramaglia/ciberportero" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}><Github size={18} /></a>
        <span>{t.footer}</span>
        <a href="https://youtu.be/Sdz38CpLrUs" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}><Youtube size={22} /></a>
      </footer>

    </div>
  );
}
