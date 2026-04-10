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
    // For new links, put them at the end if no order specified
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
  const currentLink = await db.link.findUnique({ where: { id } });
  if (!currentLink) return;

  const allLinks = await db.link.findMany({ orderBy: { order: 'asc' } });
  const currentIndex = allLinks.findIndex(l => l.id === id);
  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

  if (targetIndex >= 0 && targetIndex < allLinks.length) {
    const targetLink = allLinks[targetIndex];
    
    // Swap orders
    const currentOrder = currentLink.order;
    const targetOrder = targetLink.order;

    await db.link.update({ where: { id: currentLink.id }, data: { order: targetOrder } });
    await db.link.update({ where: { id: targetLink.id }, data: { order: currentOrder } });
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

export async function upsertNotification(data: any) {
  const isUpdate = !!data.id;
  const messageEs = data.message.es || 'Sin mensaje';

  const notificationData = {
    message: data.message,
    description: data.description,
    type: data.type,
    active: data.active,
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

/* --- POSTS ACTIONS --- */
export async function deletePost(id: string) {
  const post = await db.post.findUnique({ where: { id } });
  const title = post?.title || 'Sin título';
  
  await db.post.delete({ where: { id } });
  await logAction('DELETE', 'post', `Eliminó el post: ${title}`);
  
  revalidatePath('/admin/posts');
  revalidatePath('/');
  revalidatePath(`/${post?.slug}`);
}

export async function upsertPost(data: any) {
  const isUpdate = !!data.id;
  const title = data.title || 'Sin título';

  const postData = {
    title: data.title,
    content: data.content,
    slug: data.slug,
    lang: data.lang,
    description: data.description,
    published: data.published,
    tags: Array.isArray(data.tags) ? data.tags : data.tags ? data.tags.split(',').map((t: string) => t.trim()) : [],
  };

  if (isUpdate) {
    await db.post.update({
      where: { id: data.id },
      data: postData
    });
    await logAction('UPDATE', 'post', `Actualizó el post: ${title}`);
  } else {
    await db.post.create({
      data: postData
    });
    await logAction('CREATE', 'post', `Creó un nuevo post: ${title}`);
  }
  
  revalidatePath('/admin/posts');
  revalidatePath('/');
  revalidatePath(`/${data.slug}`);
}

/* --- COUNTDOWN ACTIONS --- */
export async function toggleCountdown(id: string, isActive: boolean) {
  const c = await db.countdown.update({
    where: { id },
    data: { isActive }
  });
  const title = (c.title as any)?.es || 'Sin título';
  await logAction('TOGGLE', 'countdown', `${isActive ? 'Activó' : 'Desactivó'} el contador: ${title}`);
  revalidatePath('/admin/notifications');
  revalidatePath('/');
}

export async function upsertCountdown(data: any) {
  const isUpdate = !!data.id;
  const titleEs = data.title.es || 'Sin título';

  if (isUpdate) {
    await db.countdown.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        targetDate: new Date(data.targetDate),
        isActive: data.isActive,
      }
    });
    await logAction('UPDATE', 'countdown', `Actualizó el contador: ${titleEs}`);
  } else {
    await db.countdown.create({
      data: {
        title: data.title,
        description: data.description,
        targetDate: new Date(data.targetDate),
        isActive: data.isActive,
      }
    });
    await logAction('CREATE', 'countdown', `Creó un nuevo contador: ${titleEs}`);
  }
  
  revalidatePath('/admin/notifications');
  revalidatePath('/');
}
