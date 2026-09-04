"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function addComment(chapterId: string, content: string) {
  try {
    const session = await auth()
    if (!session || !session.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    await prisma.comment.create({
      data: {
        chapterId,
        authorId: session.user.id,
        content
      }
    })

    revalidatePath(`/chapters/${chapterId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function resolveComment(commentId: string, chapterId: string) {
  try {
    const session = await auth()
    if (!session || !session.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: { isResolved: true }
    })

    revalidatePath(`/chapters/${chapterId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getCommentsByChapter(chapterId: string) {
  return prisma.comment.findMany({
    where: { chapterId },
    orderBy: { createdAt: 'desc' }
  })
}
