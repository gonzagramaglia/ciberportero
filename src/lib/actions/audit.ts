'use server';

import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function logAction(action: string, target: string, details: string) {
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
