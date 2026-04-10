import CalendarClient from "@/components/CalendarClient";
import db from "@/lib/db";
import { translations } from "@/lib/translations";

export const dynamic = 'force-dynamic';

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const resolvedParams = await searchParams;
  const lang = resolvedParams.lang || 'es';
  
  // Fetch real events from database
  const events = await db.calendarEvent.findMany({
    orderBy: { date: 'asc' }
  });

  // Map Prisma events to the interface expected by the client
  const mappedEvents = events.map(event => ({
    date: event.date.toISOString().split('T')[0],
    title: event.title as Record<string, string>,
    desc: (event.description || { es: '', en: '', pt: '' }) as Record<string, string>,
    type: event.type,
    subjectId: event.subjectId || undefined
  }));

  return <CalendarClient initialEvents={mappedEvents} lang={lang} />;
}
