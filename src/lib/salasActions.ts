'use server';

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";

const getStoragePathFromUrl = (img: any) => {
  const url = typeof img === 'string' ? img : img?.url;
  if (!url || typeof url !== 'string' || !url.includes('/public/images/')) return null;
  return url.split('/public/images/').pop();
};

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
            userId: session.user.id,
            role: 'admin'
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
    const isAdmin = session.user.email === 'ciberportero@gmail.com' || session.user.email === 'gonzalogramagia@gmail.com' || session.user.role === 'admin';
    if (room?.creatorId !== session.user.id && !isAdmin) return { error: "No autorizado" };

    await db.roomCategory.create({
      data: { roomId, name }
    });

    revalidatePath(`/salas/${roomId}`);
    revalidatePath(`/salas/${roomId}`, 'layout');
    revalidatePath('/salas/lista');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Error al crear categoría" };
  }
}

function strictSlugify(text: string) {
  return text.toString().toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9-]/g, '-') // only allow a-z, 0-9 and -
    .replace(/-+/g, '-') // collapse multiple -
    .replace(/^-+|-+$/g, ''); // remove leading/trailing -
}

export async function createSubcategory(categoryId: string, name: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };

  try {
    const category = await db.roomCategory.findUnique({ 
      where: { id: categoryId },
      include: { room: true, subcategories: true }
    });
    
    if (!category) return { error: "Categoría no encontrada" };

    const isAdmin = session.user.email === 'ciberportero@gmail.com' || session.user.email === 'gonzalogramagia@gmail.com' || session.user.role === 'admin';
    if (category.room.creatorId !== session.user.id && !isAdmin) return { error: "No autorizado" };

    const decodedName = decodeURIComponent(name).trim();
    const baseSlug = strictSlugify(decodedName);
    const catPrefix = categoryId.slice(-4);
    const finalSlug = `${catPrefix}-${baseSlug}`;
    
    // Check for duplicate names within the same category
    const existing = category.subcategories.find(s => s.name.toLowerCase() === decodedName.toLowerCase());
    if (existing) return { error: "Ya existe una subcategoría con ese nombre en esta categoría." };

    const finalId = `${catPrefix}-${baseSlug}-${Date.now()}`;
    
    const sub = await db.roomSubcategory.create({
      data: { 
        categoryId, 
        name: decodedName, 
        slug: finalSlug,
        id: finalId 
      }
    });

    revalidatePath(`/salas/${category.roomId}`);
    revalidatePath(`/salas/${category.roomId}`, 'layout');
    revalidatePath('/salas/lista');
    return { success: true, sub };
  } catch (error: any) {
    console.error("Error creating subcategory:", error);
    return { success: false, error: error.message };
  }
}

export async function moveSubcategory(subId: string, newCategoryId: string, newOrder?: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };

  try {
    const sub = await db.roomSubcategory.findUnique({
      where: { id: subId },
      include: { category: { include: { room: true } } }
    });

    if (!sub) return { error: "Subcategoría no encontrada" };

    const isAdmin = session.user.email === 'ciberportero@gmail.com' || session.user.email === 'gonzalogramagia@gmail.com' || session.user.role === 'admin';
    if (sub.category.room.creatorId !== session.user.id && !isAdmin) return { error: "No autorizado" };

    // Calculate new slug based on new category
    const catPrefix = newCategoryId.slice(-4);
    const coreSlug = sub.slug.includes('-') ? sub.slug.split('-').slice(1).join('-') : sub.slug;
    const newSlug = `${catPrefix}-${coreSlug}`;

    // Check if this new slug is already taken in the room
    const existing = await db.roomSubcategory.findFirst({
        where: { 
            category: { roomId: sub.category.roomId },
            id: { not: subId },
            slug: { equals: newSlug, mode: 'insensitive' }
        }
    });

    if (existing) {
        return { error: "No se puede mover: ya existe una subcategoría con el mismo slug (#) en la categoría de destino." };
    }

    // Prepare update data
    const updateData: any = { 
        categoryId: newCategoryId,
        slug: newSlug
    };
    if (newOrder !== undefined) {
      // Reordenamiento complejo
      const siblings = await db.roomSubcategory.findMany({
        where: { categoryId: newCategoryId },
        orderBy: { order: 'asc' }
      });

      const otherSiblings = siblings.filter(s => s.id !== subId);
      otherSiblings.splice(newOrder, 0, sub);

      // Actualizar todos en una transacción
      await db.$transaction(
        otherSiblings.map((s, idx) => {
          const data: any = { order: idx };
          if (s.id === subId) {
            data.categoryId = newCategoryId;
            data.slug = newSlug;
          } else {
            data.categoryId = newCategoryId;
          }
          return db.roomSubcategory.update({
            where: { id: s.id },
            data
          });
        })
      );
    } else {
      // Solo cambio de categoría al final
      await db.roomSubcategory.update({
        where: { id: subId },
        data: updateData
      });
    }

    revalidatePath(`/salas/${sub.category.roomId}`);
    revalidatePath(`/salas/${sub.category.roomId}`, 'layout');
    return { success: true };
  } catch (error: any) {
    console.error("Error moving subcategory:", error);
    return { error: error.message || "Error al mover subcategoría" };
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

export async function updateSubcategory(subId: string, name: string, slug?: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };
  try {
    const sub = await db.roomSubcategory.findUnique({ 
      where: { id: subId }, 
      include: { category: { include: { subcategories: true, room: true } } } 
    });
    if (!sub || sub.category.room.creatorId !== session.user.id) return { error: "No autorizado" };
    
    // Check for duplicate names within the same category only if name changed
    if (sub.name !== name) {
        const existing = sub.category.subcategories.find(s => s.name.toLowerCase() === name.toLowerCase() && s.id !== subId);
        if (existing) return { error: "Ya existe una subcategoría con ese nombre en esta categoría." };
    }
    
    const updateData: any = { name };
    if (slug) {
        const catPrefix = sub.category.id.slice(-4) || 'sub';
        updateData.slug = `${catPrefix}-${strictSlugify(slug)}`;
    }
    
    await db.roomSubcategory.update({ 
        where: { id: subId }, 
        data: updateData 
    });
    
    revalidatePath(`/salas/${sub.category.roomId}`);
    return { success: true };
  } catch (error) { 
    console.error(error);
    return { error: "Error al actualizar" }; 
  }
}

export async function deleteSubcategory(subId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };
  try {
    const sub = await db.roomSubcategory.findUnique({ 
      where: { id: subId }, 
      include: { 
        category: { include: { room: true } },
        messages: { select: { images: true } }
      } 
    });
    if (sub?.category.room.creatorId !== session.user.id) return { error: "No autorizado" };
    
    // Collect all images from all messages in this subcategory
    const allImages = sub.messages.flatMap(m => (m.images || []) as any[]);
    const pathsToDelete = allImages.map(url => getStoragePathFromUrl(url)).filter(Boolean) as string[];
    
    if (pathsToDelete.length > 0) {
      await supabaseAdmin.storage.from('images').remove(pathsToDelete);
    }

    await db.roomSubcategory.delete({ where: { id: subId } });
    revalidatePath(`/salas/${sub?.category.roomId}`);
    return { success: true };
  } catch (error) { 
    console.error(error);
    return { error: "Error al eliminar subcategoría" }; 
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
    return await getRoomDetails(roomId);
  } catch (error) {
    console.error("getRoomInfo Error:", error);
    return null;
  }
}

export async function getRoomDetails(rawRoomId: string) {
  import('next/cache').then(({ unstable_noStore }) => unstable_noStore());
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
              orderBy: { order: 'asc' },
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
    console.error("getRoomDetails Error:", error);
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
            user: { select: { id: true, name: true, image: true } },
            replies: {
              include: {
                user: { select: { id: true, name: true, image: true } }
              },
              orderBy: { createdAt: 'asc' }
            }
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
      where: { 
        subcategory: { 
          OR: [
            { name: 'Chat General', category: { roomId } },
            { name: 'General', category: { roomId } },
            { category: { name: 'General', roomId } }
          ]
        }, 
        parentId: null 
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        replies: {
          include: {
            user: { select: { id: true, name: true, image: true } },
            replies: {
              include: {
                user: { select: { id: true, name: true, image: true } }
              },
              orderBy: { createdAt: 'asc' }
            }
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
        ]
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        subcategory: { 
          select: { 
            id: true,
            name: true,
            category: { select: { name: true } }
          } 
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
      include: { 
        subcategory: { include: { category: true } },
        replies: {
          include: {
            replies: true
          }
        }
      }
    });

    if (!message) return { error: "Mensaje no encontrado" };

    const isAdmin = session.user.role === 'admin' || session.user.email === 'ciberportero@gmail.com';
    if (message.userId !== session.user.id && !isAdmin) {
      return { error: "No autorizado" };
    }

    // Collect all images from parent and all replies
    const allImages: any[] = [...(message.images || []) as any[]];
    const collectReplyImages = (reps: any[]) => {
      reps.forEach(r => {
        if (r.images) allImages.push(...(r.images as any[]));
        if (r.replies) collectReplyImages(r.replies);
      });
    };
    if (message.replies) collectReplyImages(message.replies);

    // Delete images from Supabase Storage
    if (allImages.length > 0) {
      const paths = allImages.map(url => getStoragePathFromUrl(url)).filter(Boolean) as string[];
      if (paths.length > 0) {
        await supabaseAdmin.storage.from('images').remove(paths);
      }
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
export async function togglePinMessage(messageId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };

  try {
    const message = await db.roomMessage.findUnique({
      where: { id: messageId },
      include: { subcategory: { include: { category: { include: { room: true } } } } }
    });

    if (!message) return { error: "Mensaje no encontrado" };

    const isAdmin = session.user.role === 'admin' || session.user.email === 'ciberportero@gmail.com' || message.subcategory.category.room.creatorId === session.user.id;
    if (!isAdmin) return { error: "No autorizado" };

    const newPinned = !(message as any).isPinned;
    let pinOrder = (message as any).pinOrder || 0;

    if (newPinned) {
      const maxPin = await db.roomMessage.aggregate({
        where: { subcategoryId: message.subcategoryId, isPinned: true } as any,
        _max: { pinOrder: true } as any
      });
      pinOrder = ((maxPin as any)._max.pinOrder || 0) + 1;
    }

    await db.roomMessage.update({
      where: { id: messageId },
      data: { 
        isPinned: newPinned,
        pinOrder: pinOrder
      } as any
    });

    revalidatePath(`/salas/${message.subcategory.category.roomId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Error al pinear mensaje" };
  }
}

export async function reorderPinnedMessages(subcategoryId: string, messageIds: string[]) {
    const session = await auth();
    if (!session?.user?.id) return { error: "No autenticado" };

    try {
        let sub = await db.roomSubcategory.findUnique({
            where: { id: subcategoryId },
            include: { category: { include: { room: true } } }
        });

        if (!sub && subcategoryId.length < 30) {
            // Probably a name or 'general', try finding by room
            sub = await db.roomSubcategory.findFirst({
                where: { 
                    OR: [
                        { name: 'Chat General', category: { roomId: subcategoryId } },
                        { name: 'General', category: { roomId: subcategoryId } }
                    ]
                },
                include: { category: { include: { room: true } } }
            });
        }

        if (!sub) return { error: "Subcategoría no encontrada" };

        const isAdmin = session.user.role === 'admin' || session.user.email === 'ciberportero@gmail.com' || sub.category.room.creatorId === session.user.id;
        if (!isAdmin) return { error: "No autorizado" };

        await Promise.all(messageIds.map((id, idx) => 
            db.roomMessage.update({
                where: { id },
                data: { pinOrder: idx } as any
            })
        ));

        revalidatePath(`/salas/${sub.category.roomId}`);
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Error al reordenar" };
    }
}
