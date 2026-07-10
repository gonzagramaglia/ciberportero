'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function getComments(postSlug?: string, podcastSlug?: string) {
  if (postSlug) {
    const post = await db.post.findUnique({
      where: { slug: postSlug },
      include: {
        comments: {
          where: { parentId: null, podcastId: null },
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
          where: { parentId: null },
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
