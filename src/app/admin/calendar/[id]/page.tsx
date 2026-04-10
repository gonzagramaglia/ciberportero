import { db } from "@/lib/db";
import CalendarEditor from "@/components/admin/CalendarEditor";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCalendarEventPage({ params }: Props) {
  const { id } = await params;
  const event = await db.calendarEvent.findUnique({
    where: { id }
  });

  if (!event) notFound();

  return <CalendarEditor event={event} />;
}
