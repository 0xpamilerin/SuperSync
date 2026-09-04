"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { ChapterStatus } from "../../../generated/prisma/client"

export async function createChapter(data: { title: string; number: number; fileUrl: string; fileName: string; fileSize: number }) {
  try {
    const session = await auth()
    if (!session || !session.user?.id || session.user?.role !== "STUDENT") {
      return { success: false, error: "Unauthorized" }
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!studentProfile) {
      return { success: false, error: "Student profile not found" }
    }

    const newChapter = await prisma.chapter.create({
      data: {
        studentId: studentProfile.id,
        title: data.title,
        number: data.number,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        status: "PENDING",
      }
    })

    revalidatePath("/student/chapters")
    revalidatePath("/student/documents")
    return { success: true, chapter: newChapter }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getStudentChapters() {
  const session = await auth()
  if (!session || !session.user?.id || session.user?.role !== "STUDENT") return []

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!studentProfile) return []

  return prisma.chapter.findMany({
    where: { studentId: studentProfile.id },
    include: { comments: true },
    orderBy: { submittedAt: 'desc' }
  })
}

export async function getSupervisorChapters() {
  const session = await auth()
  if (!session || !session.user?.id || session.user?.role !== "SUPERVISOR") return []

  const supervisorProfile = await prisma.supervisorProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!supervisorProfile) return []

  return prisma.chapter.findMany({
    where: {
      student: {
        supervisorId: supervisorProfile.id
      }
    },
    include: {
      student: {
        include: { user: true }
      },
      comments: true
    },
    orderBy: { submittedAt: 'desc' }
  })
}

export async function reviewChapter(chapterId: string, status: ChapterStatus) {
  try {
    const session = await auth()
    if (!session || !session.user?.id || session.user?.role !== "SUPERVISOR") {
      return { success: false, error: "Unauthorized" }
    }

    await prisma.chapter.update({
      where: { id: chapterId },
      data: { status }
    })

    revalidatePath("/supervisor/chapters")
    revalidatePath(`/chapters/${chapterId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getChapterById(id: string) {
  const session = await auth()
  if (!session || !session.user?.id) return null

  return prisma.chapter.findUnique({
    where: { id },
    include: {
      student: {
        include: { user: true }
      },
      comments: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })
}
