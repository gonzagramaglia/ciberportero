'use server';

import { db } from "@/lib/db";
import { auth } from "@/auth";

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
