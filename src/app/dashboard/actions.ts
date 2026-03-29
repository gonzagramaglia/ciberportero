"use server"

import { auth } from "@/auth"
// import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function addExamProgress(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const examTitle = formData.get("examTitle") as string
  const type = formData.get("type") as string // "autoevaluacion" or "parcial"
  const subject = formData.get("subject") as string

  if (!examTitle || !type) return { error: "Missing fields" }

  /* 
  await db.examProgress.create({
    data: {
      userId: session.user.id as string,
      examTitle,
      type,
      subject,
      completed: true,
      completedAt: new Date(),
    }
  })
  */

  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteProgress(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  /*
  await db.examProgress.delete({
    where: { 
      id,
      userId: session.user.id // Security check: Ensure it's the owner
    }
  })
  */

  revalidatePath("/dashboard")
  return { success: true }
}
