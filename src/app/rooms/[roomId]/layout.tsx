import { auth } from "@/auth";
import { ChevronLeft } from "lucide-react";
import { getRoomData } from "@/lib/roomsActions";
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
            return {
                title: roomId === 'test-room' ? 'Ciberportero | Sala de Prueba' : 'Ciberportero | Sala Invitado',
                description: 'Explora y colabora en esta sala de estudio en Ciberportero.'
            };
        }

        const room = await getRoomData(roomId);
        if (room) {
            return {
                title: `Ciberportero | ${room.name}`,
                description: `Únete a la sala ${room.name} para estudiar en grupo y compartir recursos.`
            };
        }
    } catch (e) {
        console.error("Metadata error:", e);
    }

    return {
        title: 'Ciberportero | Sala de Estudio',
        description: 'Colabora con tu grupo de estudio en tiempo real.'
    };
}

export default async function RoomDetailLayout({ children, params }: any) {
  let roomId = "";
  try {
    const p = await params;
    roomId = p?.roomId || "";
  } catch (e) {
    redirect('/rooms/lobby');
  }

  if (!roomId) redirect('/rooms/lobby');

  const session = await auth();
  
  let room = null;
  if (session && roomId) {
    room = await getRoomData(roomId);
  }

  const isGuestRoom = !room;
  
  if (isGuestRoom) {
    const cookieStore = await cookies();
    const lang = (cookieStore.get('lang')?.value as Locale) || 'es';
    const isTest = roomId === 'test-room';
    room = {
      id: roomId,
      name: isTest ? 'Sala de Prueba 🛡️' : (lang === 'es' ? 'Cargando Room...' : 'Loading Room...'),
      secretCode: isTest ? 'PRUEBA123' : '...',
      creatorId: isTest ? 'admin' : 'guest',
      categories: [],
      members: []
    };
  }

  if (!room) redirect('/rooms/lobby');

  const cookieStore = await cookies();
  const lang = (cookieStore.get('lang')?.value as Locale) || 'es';
  const t = translations[lang];

  return (
    <div className="container fade-in post-container" style={{ paddingTop: '2rem', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <RoomTitleUpdater roomId={roomId} fallbackTitle={`Ciberportero | ${room.name}`} />
      <RoomNavbar href="/rooms/lobby" backTextKey="backToLobby" />

      <RoomHeader roomId={roomId} initialRoom={{ name: room.name, secretCode: room.secretCode, creatorId: room.creatorId }} session={session} />

      <div className="room-content-layout" style={{ display: 'flex', gap: '2rem', flex: 1 }}>
        <RoomSidebar room={room} session={session} />
        <main style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>

      <footer className="footer-main" style={{ marginTop: '4rem' }}>
        <a href="https://github.com/gonzalogramagia/ciberportero" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}><Github size={18} /></a>
        <span>{t.footer}</span>
        <a href="https://youtu.be/Sdz38CpLrUs" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}><Youtube size={22} /></a>
      </footer>

    </div>
  );
}
