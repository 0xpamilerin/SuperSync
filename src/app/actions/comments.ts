"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { resolveUser } from "@/lib/user-helper"

export async function addComment(chapterId: string, content: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: "Unauthorized" }
    }

    const resolvedUser = await resolveUser(session)
    if (!resolvedUser) {
      return { success: false, error: "User not found" }
    }

    await prisma.comment.create({
      data: {
        chapterId,
        authorId: resolvedUser.id,
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
    if (!session?.user) {
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
