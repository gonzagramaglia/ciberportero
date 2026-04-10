'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

async function logAction(action: string, target: string, details: string) {
  const session = await auth();
  await db.auditLog.create({
    data: {
      userId: session?.user?.id,
      action,
      target,
      details,
    }
  });
}

/* --- LINKS ACTIONS --- */
export async function deleteLink(id: string) {
  const link = await db.link.findUnique({ where: { id } });
  const name = (link?.name as any)?.es || 'Unknown';
  
  await db.link.delete({ where: { id } });
  await logAction('DELETE', 'link', `Eliminó el link: ${name}`);
  
  revalidatePath('/admin/links');
  revalidatePath('/links');
}

export async function upsertLink(data: any) {
  const isUpdate = !!data.id;
  const name = data.name.es || 'Sin nombre';

  if (isUpdate) {
    await db.link.update({
      where: { id: data.id },
      data: {
        name: data.name,
        url: data.url,
        iconType: data.iconType,
        order: parseInt(data.order) || 0,
      }
    });
    await logAction('UPDATE', 'link', `Actualizó el link: ${name}`);
  } else {
    await db.link.create({
      data: {
        name: data.name,
        url: data.url,
        iconType: data.iconType,
        order: parseInt(data.order) || 0,
      }
    });
    await logAction('CREATE', 'link', `Creó un nuevo link: ${name}`);
  }
  revalidatePath('/admin/links');
  revalidatePath('/links');
}

/* --- NOTIFICATIONS ACTIONS --- */
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

/* -- POSTS -- */
// Aquí irían las de posts cuando las necesitemos
