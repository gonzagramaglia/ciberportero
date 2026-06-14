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
  try {
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
  } catch (error) {
    console.error("Reorder failed, likely missing column:", error);
    // Fallback refresh
    revalidatePath('/admin/links');
  }
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

/* --- POSTS ACTIONS --- */
export async function deletePost(id: string) {
  const post = await db.post.findUnique({ where: { id } });
  const title = (post?.title as any)?.es || 'Sin título';
  
  await db.post.delete({ where: { id } });
  await logAction('DELETE', 'post', `Eliminó el post: ${title}`);
  
  revalidatePath('/admin/posts');
  revalidatePath('/');
  revalidatePath(`/${post?.slug}`);
}

export async function upsertPost(data: any) {
  const isUpdate = !!data.id;
  const title = data.title.es || 'Sin título';

  const postData: any = {
    title: data.title,
    content: data.content,
    slug: data.slug,
    alternativeSlug: data.alternativeSlug || null,
    alternativeSlug2: data.alternativeSlug2 || null,
    description: data.description,
    published: data.published,
    unlisted: data.unlisted !== undefined ? data.unlisted : false,
  };

  if (isUpdate) {
    await db.post.update({
      where: { id: data.id },
      data: {
        ...postData,
        countdowns: {
          deleteMany: {},
          create: data.countdowns?.map((c: any) => ({
            slot: c.slot,
            title: c.title,
            targetDate: new Date(c.targetDate),
            description: c.description,
            expiredMessage: c.expiredMessage,
            url: c.url || null,
            isActive: c.isActive,
          }))
        }
      }
    });
    await logAction('UPDATE', 'post', `Actualizó el post: ${title}`);
  } else {
    await db.post.create({
      data: {
        ...postData,
        countdowns: {
          create: data.countdowns?.map((c: any) => ({
            slot: c.slot,
            title: c.title,
            targetDate: new Date(c.targetDate),
            description: c.description,
            expiredMessage: c.expiredMessage,
            url: c.url || null,
            isActive: c.isActive,
          }))
        }
      }
    });
    await logAction('CREATE', 'post', `Creó un nuevo post: ${title}`);
  }
  
  revalidatePath(`/admin/posts`);
  revalidatePath('/');
  revalidatePath(`/${data.slug}`);
}

export async function votePost(type: 'LIKE' | 'DISLIKE', postId?: string, slug?: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const userId = session.user.id;
  let targetPostId = postId;

  // If no postId, find or create the post by slug (for file-based posts)
  if (!targetPostId && slug) {
    let post = await db.post.findUnique({ where: { slug } });
    if (!post) {
      post = await db.post.create({
        data: {
          slug,
          title: { es: slug, en: slug, pt: slug },
          content: { es: "Draft from sync", en: "Draft from sync", pt: "Draft from sync" },
          published: true
        } as any
      });
    }
    targetPostId = post.id;
  }

  if (!targetPostId) return { error: "Post not found" };

  const existingVote = await db.postVote.findUnique({
    where: { userId_postId: { userId, postId: targetPostId } }
  });

  if (existingVote) {
    // Si ya existe, lo quitamos (toggle)
    await db.postVote.delete({ where: { id: existingVote.id } });
  } else {
    // En posts solo permitimos LIKE
    await db.postVote.create({
      data: { userId, postId: targetPostId, type: 'LIKE' }
    });
  }

  const post = await db.post.findUnique({ where: { id: targetPostId } });
  revalidatePath(`/${post?.slug}`);
  if (post?.alternativeSlug) revalidatePath(`/${post.alternativeSlug}`);
  if (post?.alternativeSlug2) revalidatePath(`/${post.alternativeSlug2}`);
  
  return { success: true };
}

/* --- PODCAST ACTIONS --- */
export async function deletePodcast(id: string) {
  const podcast = await db.podcast.findUnique({ where: { id } });
  const title = (podcast?.title as any)?.es || 'Sin título';
  
  await db.podcast.delete({ where: { id } });
  await logAction('DELETE', 'podcast', `Eliminó el podcast: ${title}`);
  
  revalidatePath('/admin/podcast');
  revalidatePath('/podcast');
  revalidatePath(`/podcast/${podcast?.slug}`);
}

export async function upsertPodcast(data: any) {
  const isUpdate = !!data.id;
  const title = data.title.es || 'Sin título';

  const podcastData: any = {
    title: data.title,
    description: data.description,
    slug: data.slug,
    audioUrl: data.audioUrl,
    subjectId: data.subjectId || null,
    links: data.links || [],
    published: data.published,
  };

  if (isUpdate) {
    await db.podcast.update({
      where: { id: data.id },
      data: podcastData
    });
    await logAction('UPDATE', 'podcast', `Actualizó el podcast: ${title}`);
  } else {
    await db.podcast.create({
      data: podcastData
    });
    await logAction('CREATE', 'podcast', `Creó un nuevo podcast: ${title}`);
  }
  
  revalidatePath('/admin/podcast');
  revalidatePath('/podcast');
  revalidatePath(`/podcast/${data.slug}`);
}

export async function votePodcast(podcastId: string, type: 'LIKE' | 'DISLIKE') {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const userId = session.user.id;

  const existingVote = await db.podcastVote.findUnique({
    where: { userId_podcastId: { userId, podcastId } }
  });

  if (existingVote) {
    if (existingVote.type === type) {
      await db.podcastVote.delete({ where: { id: existingVote.id } });
    } else {
      await db.podcastVote.update({
        where: { id: existingVote.id },
        data: { type }
      });
    }
  } else {
    await db.podcastVote.create({
      data: { userId, podcastId, type }
    });
  }

  const podcast = await db.podcast.findUnique({ where: { id: podcastId } });
  revalidatePath(`/podcast/${podcast?.slug}`);
  return { success: true };
}

/* --- COUNTDOWN ACTIONS --- */
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

/* --- CALENDAR ACTIONS --- */
export async function swapCountdowns() {
  const countdowns = await db.countdown.findMany({ where: { postId: null } });
  
  // Set to temp first to avoid unique constraints
  for (const c of countdowns) {
    await db.countdown.update({ where: { id: c.id }, data: { slot: `temp-${c.id}` } });
  }
  
  // Now set the actual swapped values
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
export async function deleteCalendarEvent(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const event = await db.calendarEvent.findUnique({ where: { id } });
  if (!event) return { error: "Not found" };

  // Only allow if user is admin OR the owner of the event
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

/* --- PROGRESS ACTIONS --- */
export async function getUserProgress() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const progress = await db.examProgress.findMany({
    where: { userId: session.user.id }
  });

  return {
    completed: progress.filter(p => p.completed).map(p => parseInt(p.examTitle)),
    inProgress: progress.filter(p => !p.completed).map(p => parseInt(p.examTitle))
  };
}

export async function updateUserProgress(completed: number[], inProgress: number[]) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  await db.examProgress.deleteMany({
    where: { userId: session.user.id }
  });

  const data = [
    ...completed.map(id => ({
      userId: session.user.id as string,
      examTitle: id.toString(),
      type: "subject",
      completed: true
    })),
    ...inProgress.map(id => ({
      userId: session.user.id as string,
      examTitle: id.toString(),
      type: "subject",
      completed: false
    }))
  ];

  if (data.length > 0) {
    await db.examProgress.createMany({ data });
  }

  return { success: true };
}

/* --- PERSONAL EVENTS --- */
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

/* --- COMMENTS ACTIONS --- */
export async function getComments(postSlug?: string, podcastSlug?: string) {
  if (postSlug) {
    const post = await db.post.findUnique({
      where: { slug: postSlug },
      include: {
        comments: {
          where: { parentId: null, podcastId: null }, // Only top-level post comments
          include: { 
              user: { select: { id: true, name: true, image: true } },
              replies: {
                  include: {
                      user: { select: { id: true, name: true, image: true } },
                      replies: {
                          include: {
                              user: { select: { id: true, name: true, image: true } }
                          },
                          orderBy: { createdAt: 'asc' } as any
                      }
                  },
                  orderBy: { createdAt: 'asc' } as any
              }
          },
          orderBy: { createdAt: 'desc' } as any
        }
      }
    });
    return post?.comments || [];
  }
  
  if (podcastSlug) {
    const podcast = await db.podcast.findUnique({
      where: { slug: podcastSlug },
      include: {
        comments: {
          where: { parentId: null }, // Only top-level podcast comments
          include: { 
              user: { select: { id: true, name: true, image: true } },
              replies: {
                  include: {
                      user: { select: { id: true, name: true, image: true } },
                      replies: {
                          include: {
                              user: { select: { id: true, name: true, image: true } }
                          },
                          orderBy: { createdAt: 'asc' } as any
                      }
                  },
                  orderBy: { createdAt: 'asc' } as any
              }
          },
          orderBy: { createdAt: 'desc' } as any
        }
      }
    });
    return podcast?.comments || [];
  }
  
  return [];
}

export async function addComment(slug: string, content: string, parentId?: string, images: string[] = [], isPodcast: boolean = false) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  if (isPodcast) {
    const podcast = await db.podcast.findUnique({ where: { slug } });
    if (!podcast) return { error: "Podcast not found" };

    await db.comment.create({
      data: {
        content,
        podcastId: podcast.id,
        userId: session.user.id,
        images,
        ...(parentId ? { parentId } : {})
      }
    });
    revalidatePath(`/podcast/${slug}`);
  } else {
    // Find or create post in DB to link comments
    let post = await db.post.findUnique({ where: { slug } });
    
    if (!post) {
      post = await db.post.create({
        data: {
          slug,
          title: { es: slug, en: slug, pt: slug },
          content: { es: "Draft from markdown sync", en: "Draft from markdown sync", pt: "Draft from markdown sync" },
          published: true
        } as any
      });
    }

    await db.comment.create({
      data: {
        content,
        postId: post.id,
        userId: session.user.id,
        images,
        ...(parentId ? { parentId } : {})
      }
    });
    revalidatePath(`/${slug}`);
  }

  return { success: true };
}

export async function deleteComment(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const comment = await db.comment.findUnique({ 
    where: { id: commentId },
    include: { post: true, podcast: true }
  });
  if (!comment) return { error: "Not found" };

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if ((user as any)?.role !== 'admin' && comment.userId !== session.user.id) {
    return { error: "Unauthorized" };
  }

  await db.comment.delete({ where: { id: commentId } });
  
  if (comment.post) revalidatePath(`/${comment.post.slug}`);
  if (comment.podcast) revalidatePath(`/podcast/${comment.podcast.slug}`);
  
  return { success: true };
}

/* --- IMAGE ACTIONS --- */
export async function uploadImage(formData: FormData) {
  const session = await auth();
  const user = await db.user.findUnique({ where: { id: session?.user?.id } });
  if ((user as any)?.role !== 'admin' && (user as any)?.role !== 'editor') return { error: "Unauthorized" };

  const file = formData.get('file') as File;
  const slug = formData.get('slug') as string;

  if (!file || !slug) return { error: "Faltan datos" };

  const { supabaseAdmin } = await import('@/lib/supabase');
  
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileExt = file.name.split('.').pop();
  const filePath = `${slug}-${Date.now()}.${fileExt}`;

  const { data: storageData, error: storageError } = await supabaseAdmin.storage
    .from('images')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true
    });

  if (storageError) {
    console.error('Storage Error:', storageError);
    return { error: `Error subiendo a Supabase: ${storageError.message}` };
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('images')
    .getPublicUrl(filePath);

  try {
    const image = await db.image.create({
      data: {
        slug,
        url: publicUrl,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        userId: user?.id || null,
      }
    });

    await logAction('CREATE', 'image', `Subió imagen: ${slug}`);
    return { success: true, image };
  } catch (error: any) {
    console.error('Prisma Error:', error);
    if (error.code === 'P2002') return { error: "El slug ya existe" };
    return { error: `Error en DB: ${error.message}` };
  }
}

export async function getImages(filterByUploader: boolean = false) {
  const session = await auth();
  const user = await db.user.findUnique({ where: { id: session?.user?.id } });
  
  if ((user as any)?.role === 'admin') {
    if (filterByUploader) {
      return db.image.findMany({
        where: { userId: user?.id },
        orderBy: { createdAt: 'desc' }
      });
    }
    return db.image.findMany({ orderBy: { createdAt: 'desc' } });
  }
  
  if ((user as any)?.role === 'editor') {
    return db.image.findMany({
      where: { userId: user?.id },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  return [];
}

export async function deleteImage(id: string) {
  const session = await auth();
  const user = await db.user.findUnique({ where: { id: session?.user?.id } });
  if ((user as any)?.role !== 'admin' && (user as any)?.role !== 'editor') return { error: "Unauthorized" };

  const image = await db.image.findUnique({ where: { id } });
  if (!image) return { error: "Not found" };

  if ((user as any)?.role === 'editor' && image.userId !== user?.id) {
    return { error: "Unauthorized: Solo puedes eliminar tus propias imágenes" };
  }

  const { supabaseAdmin } = await import('@/lib/supabase');
  const path = image.url.split('/').pop();
  if (path) {
    await supabaseAdmin.storage.from('images').remove([path]);
  }

  await db.image.delete({ where: { id } });
  await logAction('DELETE', 'image', `Eliminó imagen: ${image.slug}`);

  return { success: true };
}

/* --- ADMIN NOTES ACTIONS --- */
export async function getAdminNote(section: string) {
  try {
    let note = await db.adminNote.findUnique({ where: { section } });
    if (!note) {
      note = await db.adminNote.create({ data: { section, content: "" } });
    }
    return note;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function updateAdminSectionNote(section: string, content: string) {
  try {
    await db.adminNote.upsert({
      where: { section },
      update: { content },
      create: { section, content }
    });
    revalidatePath('/admin');
    revalidatePath('/admin/notifications');
    revalidatePath('/admin/posts');
    revalidatePath('/admin/calendar');
    revalidatePath('/admin/users');
    revalidatePath('/admin/countdowns');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Error al guardar la nota" };
  }
}

/* --- USERS ACTIONS --- */
export async function getUsers() {
    const session = await auth();
    const user = await db.user.findUnique({ where: { id: session?.user?.id } });
    if ((user as any)?.role !== 'admin') return [];
  
    return db.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            comments: true,
            links: true,
            calendarEvents: true,
            postVotes: { where: { type: 'LIKE' } },
            podcastVotes: { where: { type: 'LIKE' } }
          }
        },
        examProgress: {
          select: { id: true, completed: true }
        }
      }
    });
}
  
export async function updateUserRole(userId: string, role: string) {
    const session = await auth();
    const currentUser = await db.user.findUnique({ where: { id: session?.user?.id } });
    if ((currentUser as any)?.role !== 'admin') return { error: "Unauthorized" };
  
    await db.user.update({
      where: { id: userId },
      data: { role }
    });
  
    await logAction('UPDATE', 'user', `Cambió el rol del usuario ${userId} a ${role}`);
    
    revalidatePath('/admin/users');
    return { success: true };
}
