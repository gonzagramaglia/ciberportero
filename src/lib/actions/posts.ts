'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { logAction } from "./audit";

export async function deletePost(id: string) {
  const post = await db.post.findUnique({ where: { id } });
  if (!post) return;

  const title = (post.title as any)?.es || 'Sin título';
  
  await db.post.delete({ where: { id } });
  
  const target = post.unlisted && post.slug !== 'links' ? 'blog_post' : 'post';
  await logAction('DELETE', target, `Eliminó el post: ${title}`);
  
  revalidatePath('/admin/posts');
  revalidatePath('/');
  revalidatePath(`/${post.slug}`);
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
    tags: data.tags || [],
    keywords: data.keywords || null,
    date: data.date ? new Date(data.date) : new Date(),
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
    
    const target = postData.unlisted && postData.slug !== 'links' ? 'blog_post' : 'post';
    await logAction('UPDATE', target, `Actualizó el post: ${title}`);
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
    
    const target = postData.unlisted && postData.slug !== 'links' ? 'blog_post' : 'post';
    await logAction('CREATE', target, `Creó un nuevo post: ${title}`);
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

  if (!targetPostId && slug) {
    let post = await db.post.findUnique({ where: { slug } });
    if (!post) {
      post = await db.post.create({
        data: {
          slug,
          title: { es: slug, en: slug },
          content: { es: "Draft from sync", en: "Draft from sync" },
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
    await db.postVote.delete({ where: { id: existingVote.id } });
  } else {
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
