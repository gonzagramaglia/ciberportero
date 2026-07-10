'use server';

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { logAction } from "./audit";

export async function uploadImage(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if ((user as any)?.role !== 'admin' && (user as any)?.role !== 'editor') return { error: "Unauthorized" };

  const file = formData.get('file') as File;
  const slug = formData.get('slug') as string;

  if (!file || !slug) return { error: "Faltan datos" };

  const source = formData.get('source') as string || 'admin';

  const { supabaseAdmin } = await import('@/lib/supabase');
  
  if (!supabaseAdmin) {
    return { error: "Supabase credentials are not configured properly" };
  }

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
        source,
        userId: user?.id || null,
      }
    });

    await logAction('CREATE', 'image', `Subió imagen: ${slug}`);
    return { success: true, image };
  } catch (error: any) {
    console.error('Prisma Error:', error);
    // Clean up the uploaded file since DB insert failed
    await supabaseAdmin.storage.from('images').remove([filePath]);
    if (error.code === 'P2002') return { error: "El slug ya existe" };
    return { error: `Error en DB: ${error.message}` };
  }
}

export async function getImages(filterByUploader: boolean = false, source: string = 'admin') {
  const session = await auth();
  if (!session?.user?.id) return [];

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  
  if ((user as any)?.role === 'admin') {
    if (filterByUploader) {
      return db.image.findMany({
        where: { userId: user?.id, source },
        orderBy: { createdAt: 'desc' }
      });
    }
    return db.image.findMany({ 
      orderBy: { createdAt: 'desc' } 
    });
  }
  
  if ((user as any)?.role === 'editor') {
    return db.image.findMany({
      where: { userId: user?.id, source },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  return [];
}

export async function deleteImage(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if ((user as any)?.role !== 'admin' && (user as any)?.role !== 'editor') return { error: "Unauthorized" };

  const image = await db.image.findUnique({ where: { id } });
  if (!image) return { error: "Not found" };

  if ((user as any)?.role === 'editor' && image.userId !== user?.id) {
    return { error: "Unauthorized: Solo puedes eliminar tus propias imágenes" };
  }

  const { supabaseAdmin } = await import('@/lib/supabase');
  const path = image.url.split('/').pop();
  if (supabaseAdmin && path) {
    await supabaseAdmin.storage.from('images').remove([path]);
  }

  await db.image.delete({ where: { id } });
  await logAction('DELETE', 'image', `Eliminó imagen: ${image.slug}`);

  return { success: true };
}
