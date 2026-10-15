"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { resolveUser } from "@/lib/user-helper"

import { createNotification } from "@/app/actions/notifications"

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

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        student: {
          include: {
            user: true,
            supervisor: { include: { user: true } }
          }
        }
      }
    })

    await prisma.comment.create({
      data: {
        chapterId,
        authorId: resolvedUser.id,
        content
      }
    })

    if (chapter) {
      const isStudent = resolvedUser.id === chapter.student.user.id
      const recipientUserId = isStudent 
        ? chapter.student.supervisor?.userId 
        : chapter.student.user.id

      if (recipientUserId) {
        await createNotification({
          userId: recipientUserId,
          title: isStudent 
            ? `New Reply from ${resolvedUser.name}` 
            : `Feedback on Chapter ${chapter.number}`,
          message: `${resolvedUser.name}: "${content.length > 80 ? content.slice(0, 77) + '...' : content}"`,
          type: "CHAPTER",
          link: `/chapters/${chapterId}`
        })
      }
    }

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
