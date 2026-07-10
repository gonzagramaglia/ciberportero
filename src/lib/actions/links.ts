'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { logAction } from "./audit";

export async function deleteLink(id: string) {
  const link = await db.link.findUnique({ where: { id } });
  const name = (link?.name as any)?.es || 'Unknown';
  
  await db.link.delete({ where: { id } });
  await logAction('DELETE', 'link', `Eliminó el link: ${name}`);
  
  revalidatePath('/admin/links');
  revalidatePath('/links');
}

export async function createPersonalLink(data: { name: string, url: string, description?: string }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  await db.link.create({
    data: {
      name: { es: data.name, en: data.name, pt: data.name },
      url: data.url,
      description: data.description ? { es: data.description, en: data.description, pt: data.description } : undefined,
      userId: session.user.id
    }
  });

  revalidatePath('/links');
  return { success: true };
}

export async function deletePersonalLink(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const link = await db.link.findUnique({ where: { id } });
  if (!link || link.userId !== session.user.id) return { error: "Unauthorized" };

  await db.link.delete({ where: { id } });
  revalidatePath('/links');
  return { success: true };
}

export async function upsertLink(data: any) {
  const isUpdate = !!data.id;
  const name = data.name.es || 'Sin nombre';

  const linkData = {
    name: data.name,
    url: data.url,
    iconType: data.iconType,
    order: data.order !== undefined ? parseInt(data.order) : undefined,
  };

  if (isUpdate) {
    await db.link.update({
      where: { id: data.id },
      data: linkData
    });
    await logAction('UPDATE', 'link', `Actualizó el link: ${name}`);
  } else {
    if (linkData.order === undefined) {
      const lastLink = await db.link.findFirst({ orderBy: { order: 'desc' } });
      linkData.order = (lastLink?.order || 0) + 1;
    }
    await db.link.create({
      data: linkData as any
    });
    await logAction('CREATE', 'link', `Creó un nuevo link: ${name}`);
  }
  revalidatePath('/admin/links');
  revalidatePath('/links');
}

export async function reorderLink(id: string, direction: 'up' | 'down') {
  try {
    const currentLink = await db.link.findUnique({ where: { id } });
    if (!currentLink) return;

    const allLinks = await db.link.findMany({ orderBy: { order: 'asc' } });
    const currentIndex = allLinks.findIndex(l => l.id === id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex >= 0 && targetIndex < allLinks.length) {
      const targetLink = allLinks[targetIndex];
      
      const currentOrder = currentLink.order;
      const targetOrder = targetLink.order;

      await db.link.update({ where: { id: currentLink.id }, data: { order: targetOrder } });
      await db.link.update({ where: { id: targetLink.id }, data: { order: currentOrder } });
    }

    revalidatePath('/admin/links');
    revalidatePath('/links');
  } catch (error) {
    console.error("Reorder failed, likely missing column:", error);
    revalidatePath('/admin/links');
  }
}
