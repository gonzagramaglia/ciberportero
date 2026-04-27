'use server';

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createRoom(name: string, secretCode: string, slug: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };

  // Only admins or the specific owner email can create rooms in the DB
  const isAdmin = session.user.role === 'admin' || session.user.email === 'ciberportero@gmail.com';
  if (!isAdmin) {
    return { error: "Solo los administradores pueden crear salas oficiales." };
  }

  try {
    // Check if slug already exists
    const existing = await db.room.findUnique({ where: { id: slug } });
    if (existing) {
      return { error: "Ya existe una sala con ese identificador (slug)." };
    }

    const room = await db.room.create({
      data: {
        id: slug,
        name,
        secretCode,
        creatorId: session.user.id,
        members: {
          create: {
            userId: session.user.id
          }
        },
        categories: {
          create: {
            name: "General",
            subcategories: {
              create: {
                name: "Chat General"
              }
            }
          }
        }
      }
    });

    revalidatePath('/salas/lista');
    revalidatePath(`/salas/${room.id}`);
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

    revalidatePath('/salas');
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

    revalidatePath(`/salas/${roomId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Error al crear categoría" };
  }
}

function slugify(text: string) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
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

    const slug = slugify(name);
    // Note: If multiple subcategories have same slug in global scope it might fail if ID is slug.
    // Assuming ID is CUID or similar, and we add a slug field or just use slug as ID if unique.
    await db.roomSubcategory.create({
      data: { categoryId, name, id: `${categoryId}-${slug}` }
    });

    revalidatePath(`/salas/${category.roomId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Error al crear subcategoría" };
  }
}

export async function updateCategory(categoryId: string, name: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };
  try {
    const category = await db.roomCategory.findUnique({ where: { id: categoryId } });
    const room = await db.room.findUnique({ where: { id: category?.roomId } });
    if (room?.creatorId !== session.user.id) return { error: "No autorizado" };
    await db.roomCategory.update({ where: { id: categoryId }, data: { name } });
    revalidatePath(`/salas/${room?.id}`);
    return { success: true };
  } catch (error) { return { error: "Error al actualizar" }; }
}

export async function deleteCategory(categoryId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };
  try {
    const category = await db.roomCategory.findUnique({ where: { id: categoryId }, include: { room: true } });
    if (category?.room.creatorId !== session.user.id) return { error: "No autorizado" };
    await db.roomCategory.delete({ where: { id: categoryId } });
    revalidatePath(`/salas/${category?.roomId}`);
    return { success: true };
  } catch (error) { return { error: "Error al eliminar" }; }
}

export async function updateSubcategory(subId: string, name: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };
  try {
    const sub = await db.roomSubcategory.findUnique({ where: { id: subId }, include: { category: { include: { room: true } } } });
    if (sub?.category.room.creatorId !== session.user.id) return { error: "No autorizado" };
    
    await db.roomSubcategory.update({ 
        where: { id: subId }, 
        data: { name } 
    });
    revalidatePath(`/salas/${sub?.category.roomId}`);
    return { success: true };
  } catch (error) { return { error: "Error al actualizar" }; }
}

export async function deleteSubcategory(subId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };
  try {
    const sub = await db.roomSubcategory.findUnique({ where: { id: subId }, include: { category: { include: { room: true } } } });
    if (sub?.category.room.creatorId !== session.user.id) return { error: "No autorizado" };
    await db.roomSubcategory.delete({ where: { id: subId } });
    revalidatePath(`/salas/${sub?.category.roomId}`);
    return { success: true };
  } catch (error) { return { error: "Error al eliminar" }; }
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

    revalidatePath(`/salas/${subcategory.category.roomId}`);
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
      include: {
        _count: {
          select: { members: true }
        },
        members: {
          take: 6,
          include: {
            user: {
              select: { name: true, image: true, role: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        creator: {
          select: { role: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("getMyRooms Error:", error);
    return [];
  }
}

export async function getRoomInfo(roomId: string) {
  try {
    return await db.room.findUnique({
      where: { id: roomId },
      select: { id: true, name: true, description: true }
    });
  } catch (error) {
    console.error("getRoomInfo Error:", error);
    return null;
  }
}

export async function getRoomData(rawRoomId: string) {
  try {
    const roomId = decodeURIComponent(rawRoomId).trim();
    const session = await auth();
    
    if (!session?.user?.id) {
      return null;
    }

    const room = await db.room.findUnique({
      where: { id: roomId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, image: true }
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
        },
        creator: {
          select: { role: true, email: true }
        }
      }
    });

    if (!room) return null;

    // Check permissions
    const isMember = room.members.some(m => m.userId === session.user.id);
    const isCreator = room.creatorId === session.user.id;
    const isAdmin = session.user.role === 'admin' || session.user.email === 'ciberportero@gmail.com';

    if (!isMember && !isCreator && !isAdmin) return null;

    return room;
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
    let general = await db.roomSubcategory.findFirst({
      where: { 
        OR: [
          { name: 'Chat General', category: { roomId } },
          { name: 'General', category: { roomId } },
          { category: { name: 'General', roomId } }
        ]
      }
    });

    if (!general) {
      // Auto-create if not found
      let category = await db.roomCategory.findFirst({
        where: { roomId, name: 'General' }
      });

      if (!category) {
        category = await db.roomCategory.create({
          data: { roomId, name: 'General' }
        });
      }

      general = await db.roomSubcategory.create({
        data: { categoryId: category.id, name: 'Chat General' }
      });
    }

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
        },
        members: {
          include: {
            user: {
              select: { name: true, image: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function updateRoom(roomId: string, name: string, newSlug: string, secretCode: string, description?: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };

  try {
    const room = await db.room.findUnique({ where: { id: roomId } });
    if (!room) return { error: "Sala no encontrada" };

    const isAdmin = session.user.role === 'admin' || session.user.email === 'ciberportero@gmail.com';
    const isCreator = room.creatorId === session.user.id;

    if (!isAdmin && !isCreator) return { error: "No autorizado" };

    // If slug is changing, check if new slug exists
    if (newSlug !== roomId) {
      const existing = await db.room.findUnique({ where: { id: newSlug } });
      if (existing) return { error: "Ese identificador (slug) ya está en uso." };
    }

    const updated = await db.room.update({
      where: { id: roomId },
      data: {
        id: newSlug,
        name,
        secretCode,
        description
      }
    });

    revalidatePath('/salas/lista');
    revalidatePath(`/salas/${updated.id}`);
    revalidatePath('/admin/rooms');
    
    return { success: true, roomId: updated.id };
  } catch (error) {
    console.error(error);
    return { error: "Error al actualizar la sala" };
  }
}

export async function deleteRoom(roomId: string) {
  const session = await auth();
  if (session?.user?.role !== 'admin' && session?.user?.email !== 'ciberportero@gmail.com') return { error: "No autorizado" };

  try {
    await db.room.delete({ where: { id: roomId } });
    revalidatePath('/admin/rooms');
    revalidatePath('/salas/lista');
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
            id: true,
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
export async function deleteMessage(messageId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };

  try {
    const message = await db.roomMessage.findUnique({
      where: { id: messageId },
      include: { subcategory: { include: { category: true } } }
    });

    if (!message) return { error: "Mensaje no encontrado" };

    // Authorized if owner or admin
    const isAdmin = session.user.role === 'admin' || session.user.email === 'ciberportero@gmail.com';
    if (message.userId !== session.user.id && !isAdmin) {
      return { error: "No autorizado" };
    }

    await db.roomMessage.delete({
      where: { id: messageId }
    });

    if (message.subcategory) {
      revalidatePath(`/salas/${message.subcategory.category.roomId}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Error al eliminar mensaje" };
  }
}

export async function leaveRoom(roomId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };

  try {
    await db.roomMember.delete({
      where: {
        roomId_userId: {
          roomId,
          userId: session.user.id
        }
      }
    });
    revalidatePath('/salas/lista');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Error al salir de la sala" };
  }
}
