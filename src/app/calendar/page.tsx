import CalendarClient from "@/components/CalendarClient";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { translations } from "@/lib/translations";

export const dynamic = 'force-dynamic';

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const session = await auth();
  const resolvedParams = await searchParams;
  const lang = resolvedParams.lang || 'es';
  
  // Fetch real events from database (admin events + user private events)
  const events = await db.calendarEvent.findMany({
    where: {
      OR: [
        { userId: null },
        { userId: session?.user?.id || 'no-session' }
      ]
    },
    orderBy: { date: 'asc' }
  });

  const mappedEvents = events.map(event => ({
    id: event.id,
    date: event.date.toISOString().split('T')[0],
    title: event.title as Record<string, string>,
    desc: (event.description || { es: '', en: '', pt: '' }) as Record<string, string>,
    type: event.type,
    subjectId: event.subjectId || undefined,
    userId: event.userId
  }));

  return <CalendarClient initialEvents={mappedEvents} lang={lang} />;
}
