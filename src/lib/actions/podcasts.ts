'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { logAction } from "./audit";

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
