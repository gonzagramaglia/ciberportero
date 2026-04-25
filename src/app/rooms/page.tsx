import { auth } from "@/auth";
import { getMyRooms } from "@/lib/roomsActions";
import RoomLandingClient from "@/components/RoomLandingClient";
import { cookies } from "next/headers";
import { Locale, translations } from "@/lib/translations";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('lang')?.value as Locale) || 'es';
  const t = translations[lang].metadata;

  return {
    title: t.roomsTitle,
    description: t.roomsDesc
  };
}

export default async function RoomPage() {
  const session = await auth();
  const cookieStore = await cookies();
  const lang = (cookieStore.get('lang')?.value as Locale) || 'es';
  const t = translations[lang];

  const myRooms = await getMyRooms();

  return (
    <RoomLandingClient 
      session={null} 
    />
  );
}
