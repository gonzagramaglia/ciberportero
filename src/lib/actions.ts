'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/* --- LINKS ACTIONS --- */
export async function deleteLink(id: string) {
  await db.link.delete({ where: { id } });
  revalidatePath('/admin/links');
  revalidatePath('/links'); // Revalidar la web pública
}

export async function upsertLink(data: any) {
  if (data.id) {
    await db.link.update({
      where: { id: data.id },
      data: {
        name: data.name,
        url: data.url,
        iconType: data.iconType,
        order: parseInt(data.order) || 0,
      }
    });
  } else {
    await db.link.create({
      data: {
        name: data.name,
        url: data.url,
        iconType: data.iconType,
        order: parseInt(data.order) || 0,
      }
    });
  }
  revalidatePath('/admin/links');
  revalidatePath('/links');
}

/* --- NOTIFICATIONS ACTIONS --- */
export async function toggleNotification(id: string, active: boolean) {
  await db.notification.update({
    where: { id },
    data: { active }
  });
  revalidatePath('/admin/notifications');
  revalidatePath('/');
}

export async function deleteNotification(id: string) {
  await db.notification.delete({ where: { id } });
  revalidatePath('/admin/notifications');
  revalidatePath('/');
}

/* -- POSTS -- */
// Aquí irían las de posts cuando las necesitemos
