'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logAction } from "./audit";

export async function toggleNotification(id: string, active: boolean) {
  const n = await db.notification.update({
    where: { id },
    data: { active }
  });
  const message = (n.message as any)?.es || 'Sin mensaje';
  await logAction('TOGGLE', 'notification', `${active ? 'Activó' : 'Desactivó'} la alerta: ${message}`);
  
  revalidatePath('/admin/notifications');
  revalidatePath('/');
}

export async function deleteNotification(id: string) {
  const n = await db.notification.findUnique({ where: { id } });
  const message = (n?.message as any)?.es || 'Sin mensaje';
  
  await db.notification.delete({ where: { id } });
  await logAction('DELETE', 'notification', `Eliminó la alerta: ${message}`);
  
  revalidatePath('/admin/notifications');
  revalidatePath('/');
}

export async function upsertNotification(data: any) {
  const isUpdate = !!data.id;
  const messageEs = data.message.es || 'Sin mensaje';

  const notificationData = {
    message: data.message,
    description: data.description,
    type: data.type,
    active: data.active,
    url: data.url || null,
  };

  if (isUpdate) {
    await db.notification.update({
      where: { id: data.id },
      data: notificationData
    });
    await logAction('UPDATE', 'notification', `Actualizó la alerta: ${messageEs}`);
  } else {
    await db.notification.create({
      data: notificationData
    });
    await logAction('CREATE', 'notification', `Creó una nueva alerta: ${messageEs}`);
  }
  
  revalidatePath('/admin/notifications');
  revalidatePath('/');
}
