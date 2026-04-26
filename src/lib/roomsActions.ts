'use server';

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createRoom(name: string, secretCode: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };

  try {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove non-word chars
      .replace(/[\s_-]+/g, '-')  // Replace spaces/underscores with -
      .replace(/^-+|-+$/g, '');  // Remove leading/trailing -
    
    const uniqueId = `${slug}-${Math.random().toString(36).substring(2, 7)}`;

    const room = await db.room.create({
      data: {
        id: uniqueId,
        name,
        secretCode,
        creatorId: session.user.id,
        members: {
          create: {
            userId: session.user.id
          }
        }
      }
    });

    revalidatePath('/rooms');
    return { success: true, roomId: room.id };
  } catch (error) {
    console.error(error);
    return { error: "Error al crear la sala" };
  }
}

export async function joinRoom(secretCode: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };

  try {
    const room = await db.room.findFirst({
      where: { secretCode }
    });

    if (!room) return { error: "Código incorrecto" };

    await db.roomMember.upsert({
      where: {
        roomId_userId: {
          roomId: room.id,
          userId: session.user.id
        }
      },
      create: {
        roomId: room.id,
        userId: session.user.id
      },
      update: {}
    });

    revalidatePath('/rooms');
    return { success: true, roomId: room.id };
  } catch (error) {
    console.error(error);
    return { error: "Error al unirse a la sala" };
  }
}

export async function createCategory(roomId: string, name: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };

  try {
    const room = await db.room.findUnique({ where: { id: roomId } });
    if (room?.creatorId !== session.user.id) return { error: "No autorizado" };

    await db.roomCategory.create({
      data: { roomId, name }
    });

    revalidatePath(`/rooms/${roomId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Error al crear categoría" };
  }
}

export async function createSubcategory(categoryId: string, name: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };

  try {
    const category = await db.roomCategory.findUnique({ 
      where: { id: categoryId },
      include: { room: true }
    });
    
    if (category?.room.creatorId !== session.user.id) return { error: "No autorizado" };

    await db.roomSubcategory.create({
      data: { categoryId, name }
    });

    revalidatePath(`/rooms/${category.roomId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Error al crear subcategoría" };
  }
}

export async function addRoomMessage(subcategoryId: string, content: string, images: string[] = [], parentId?: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };

  try {
    const subcategory = await db.roomSubcategory.findUnique({
      where: { id: subcategoryId },
      include: { category: { include: { room: true } } }
    });

    if (!subcategory) return { error: "Subcategoría no encontrada" };

    // Check if user is member
    const isMember = await db.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId: subcategory.category.room.id,
          userId: session.user.id
        }
      }
    });

    if (!isMember) return { error: "No eres miembro de esta sala" };

    await db.roomMessage.create({
      data: {
        content,
        subcategoryId,
        userId: session.user.id,
        images,
        parentId
      }
    });

    revalidatePath(`/rooms/${subcategory.category.roomId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Error al enviar mensaje" };
  }
}

export async function getMyRooms() {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    return await db.room.findMany({
      where: {
        members: {
          some: { userId: session.user.id }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("getMyRooms Error:", error);
    return [];
  }
}

export async function getRoomData(roomId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    if (!db || !db.roomMember) return null;

    const isMember = await db.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId: session.user.id
        }
      }
    });

    if (!isMember) return null;

    return await db.room.findUnique({
      where: { id: roomId },
      include: {
        members: {
          include: {
            user: {
              select: { name: true, image: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        categories: {
          include: {
            subcategories: {
              include: {
                messages: true
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error("getRoomData Error:", error);
    return null;
  }
}

export async function getSubcategoryMessages(subcategoryId: string) {
  try {
    if (!db || !db.roomMessage) return [];
    return await db.roomMessage.findMany({
      where: { subcategoryId, parentId: null },
      include: {
        user: { select: { id: true, name: true, image: true } },
        replies: {
          include: {
            user: { select: { id: true, name: true, image: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("getSubcategoryMessages Error:", error);
    return [];
  }
}

export async function getGeneralMessages(roomId: string) {
  try {
    if (!db || !db.roomMessage) return [];
    return await db.roomMessage.findMany({
      where: { subcategory: { name: 'Chat General', category: { roomId } }, parentId: null },
      include: {
        user: { select: { id: true, name: true, image: true } },
        replies: {
          include: {
            user: { select: { id: true, name: true, image: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("getGeneralMessages Error:", error);
    return [];
  }
}

export async function addGeneralMessage(roomId: string, content: string, images: string[] = [], parentId?: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };

  try {
    const general = await db.roomSubcategory.findFirst({
      where: { name: 'Chat General', category: { roomId } }
    });
    if (!general) return { error: "Chat general no encontrado" };

    return await addRoomMessage(general.id, content, images, parentId);
  } catch (error) {
    console.error(error);
    return { error: "Error al enviar mensaje general" };
  }
}

// ADMIN ACTIONS
export async function getAllRooms() {
  const session = await auth();
  if (session?.user?.role !== 'admin' && session?.user?.email !== 'ciberportero@gmail.com') return [];

  try {
    return await db.room.findMany({
      include: {
        _count: {
          select: { members: true, categories: true }
        },
        creator: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function deleteRoom(roomId: string) {
  const session = await auth();
  if (session?.user?.role !== 'admin' && session?.user?.email !== 'ciberportero@gmail.com') return { error: "No autorizado" };

  try {
    await db.room.delete({ where: { id: roomId } });
    revalidatePath('/admin/rooms');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Error al eliminar sala" };
  }
}
export async function getAllRoomMessages(roomId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    const isMember = await db.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId: session.user.id } }
    });
    if (!isMember) return [];

    return await db.roomMessage.findMany({
      where: { 
        OR: [
          { subcategory: { category: { roomId } } },
          { subcategory: { name: 'Chat General', category: { roomId } } }
        ],
        parentId: null 
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        subcategory: { 
          select: { 
            name: true,
            category: { select: { name: true } }
          } 
        },
        replies: {
          include: {
            user: { select: { id: true, name: true, image: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("getAllRoomMessages Error:", error);
    return [];
  }
}
