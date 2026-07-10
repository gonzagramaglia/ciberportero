'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { logAction } from "./audit";

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
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if ((user as any)?.role !== 'admin') return { error: "Unauthorized" };

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
  
const VALID_ROLES = ['admin', 'editor', 'user'] as const;

export async function updateUserRole(userId: string, role: string) {
    const session = await auth();
    const currentUser = await db.user.findUnique({ where: { id: session?.user?.id } });
    if ((currentUser as any)?.role !== 'admin') return { error: "Unauthorized" };

    if (!VALID_ROLES.includes(role as any)) return { error: "Invalid role" };
    if (userId === session?.user?.id && role !== 'admin') return { error: "Cannot demote yourself" };
  
    await db.user.update({
      where: { id: userId },
      data: { role }
    });
  
    await logAction('UPDATE', 'user', `Cambió el rol del usuario ${userId} a ${role}`);
    
    revalidatePath('/admin/users');
    return { success: true };
}
