'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logAction } from "./audit";

export async function toggleCountdown(id: string, isActive: boolean) {
  const c = await db.countdown.update({
    where: { id },
    data: { isActive }
  });
  const title = (c.title as any)?.es || 'Sin título';
  await logAction('TOGGLE', 'countdown', `${isActive ? 'Activó' : 'Desactivó'} el contador: ${title}`);
  revalidatePath('/admin/countdowns');
  revalidatePath('/');
}

export async function upsertCountdown(data: any) {
  const isUpdate = !!data.id;
  const titleEs = data.title.es || 'Sin título';

  const cData = {
    title: data.title,
    description: data.description,
    expiredMessage: data.expiredMessage,
    targetDate: new Date(data.targetDate),
    url: data.url || null,
    slot: data.slot || 'left',
    isActive: data.isActive,
  };

  if (isUpdate) {
    await db.countdown.update({
      where: { id: data.id },
      data: cData
    });
    await logAction('UPDATE', 'countdown', `Actualizó el contador: ${titleEs}`);
  } else {
    await db.countdown.create({
      data: cData
    });
    await logAction('CREATE', 'countdown', `Creó un nuevo contador: ${titleEs}`);
  }
  
  revalidatePath('/admin/countdowns');
  revalidatePath('/');
}

export async function swapCountdowns() {
  const countdowns = await db.countdown.findMany({ where: { postId: null } });
  
  for (const c of countdowns) {
    await db.countdown.update({ where: { id: c.id }, data: { slot: `temp-${c.id}` } });
  }
  
  for (const c of countdowns) {
    if (c.slot === 'left') {
      await db.countdown.update({ where: { id: c.id }, data: { slot: 'right' } });
    } else if (c.slot === 'right') {
      await db.countdown.update({ where: { id: c.id }, data: { slot: 'left' } });
    }
  }

  await logAction('UPDATE', 'countdown', 'Intercambió posiciones de los contadores');
  revalidatePath('/admin/countdowns');
  revalidatePath('/');
  return { success: true };
}
