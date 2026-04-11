import CalendarClient from "@/components/CalendarClient";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { translations } from "@/lib/translations";

import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const session = await auth();
  const resolvedParams = await searchParams;
  const cookieStore = await cookies();
  const lang = resolvedParams.lang || cookieStore.get('lang')?.value || 'es';
  
  // Fetch real events from database (admin events + user private events)
  const events = await db.calendarEvent.findMany({
    where: {
      OR: [
        { userId: null },
        { userId: session?.user?.id || 'no-session' }
      ]
    },
    orderBy: { startDate: 'asc' }
  });

  const mappedEvents = events.map(event => ({
    id: event.id,
    startDate: event.startDate.toISOString().split('T')[0],
    endDate: event.endDate ? event.endDate.toISOString().split('T')[0] : null,
    title: event.title as Record<string, string>,
    desc: (event.description || { es: '', en: '', pt: '' }) as Record<string, string>,
    type: event.type,
    subjectId: event.subjectId || undefined,
    userId: event.userId
  }));

  return <CalendarClient initialEvents={mappedEvents} lang={lang} />;
}
