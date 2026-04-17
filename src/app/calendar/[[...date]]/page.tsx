import CalendarClient from "@/components/CalendarClient";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { translations } from "@/lib/translations";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ date?: string[] }>, 
  searchParams: Promise<{ lang?: string }> 
}) {
  const resolvedSearchParams = await searchParams;
  const { date } = await params;
  const cookieStore = await cookies();
  const lang = resolvedSearchParams.lang || cookieStore.get('lang')?.value || 'es';
  const t = translations[lang as keyof typeof translations];

  let title = `Ciberportero | ${t.calendar.shortTitle}`;
  if (date && date.length === 3) {
    title = `Ciberportero | ${date[0]}/${date[1]}/${date[2]} - ${t.calendar.shortTitle}`;
  }

  return { title };
}

export default async function CalendarPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ date?: string[] }>, 
  searchParams: Promise<{ lang?: string }> 
}) {
  const session = await auth();
  const resolvedSearchParams = await searchParams;
  const { date } = await params;
  const cookieStore = await cookies();
  const lang = resolvedSearchParams.lang || cookieStore.get('lang')?.value || 'es';

  let initialDate = null;
  if (date && date.length === 3) {
    const [day, month, year] = date;
    // Format: YYYY-MM-DD
    initialDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const events = (await db.calendarEvent.findMany({
    where: {
      OR: [
        { userId: null },
        { userId: session?.user?.id || 'no-session' }
      ]
    },
    orderBy: { startDate: 'asc' }
  })) as any[];

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

  return <CalendarClient initialEvents={mappedEvents} lang={lang} initialDate={initialDate} />;
}
