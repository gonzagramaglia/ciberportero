'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { logAction } from "./audit";

export async function deleteCalendarEvent(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const event = await db.calendarEvent.findUnique({ where: { id } });
  if (!event) return { error: "Not found" };

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if ((user as any)?.role !== 'admin' && event.userId !== session.user.id) {
    return { error: "Unauthorized" };
  }

  const title = (event?.title as any)?.es || 'Sin título';
  await db.calendarEvent.delete({ where: { id } });
  await logAction('DELETE', 'event', `Eliminó el evento: ${title}`);
  
  revalidatePath('/calendar');
  revalidatePath('/admin/calendar');
  return { success: true };
}

export async function upsertCalendarEvent(data: any) {
  const isUpdate = !!data.id;
  const titleEs = data.title.es || 'Sin título';

  const eventData = {
    title: data.title,
    description: data.description,
    startDate: new Date(data.startDate),
    endDate: data.endDate ? new Date(data.endDate) : null,
    period: data.period,
    type: data.type,
    subjectId: data.subject === 'all' ? null : data.subject,
    url: data.url || null,
  };

  if (isUpdate) {
    await db.calendarEvent.update({
      where: { id: data.id },
      data: eventData
    });
    await logAction('UPDATE', 'event', `Actualizó el evento: ${titleEs}`);
  } else {
    await db.calendarEvent.create({
      data: eventData as any
    });
    await logAction('CREATE', 'event', `Creó un nuevo evento: ${titleEs}`);
  }
  
  revalidatePath('/admin/calendar');
  revalidatePath('/calendar');
}

export async function createPersonalEvent(data: { title: string, startDate: string, endDate?: string, type: string, subjectId?: string, period?: string, url?: string }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  await db.calendarEvent.create({
    data: {
      title: { es: data.title, en: data.title, pt: data.title },
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      type: data.type,
      subjectId: data.subjectId === 'all' ? null : data.subjectId,
      url: data.url || null,
      period: data.period || 'all',
      userId: session.user.id
    } as any
  });

  revalidatePath('/calendar');
  return { success: true };
}
