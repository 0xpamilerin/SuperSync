"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { ChapterStatus } from "@/types/models"
import { resolveStudentProfile, resolveSupervisorProfile } from "@/lib/user-helper"

import { createNotification } from "@/app/actions/notifications"

export async function createChapter(data: { title: string; number: number; fileUrl: string; fileName: string; fileSize: number }) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "STUDENT") {
      return { success: false, error: "Unauthorized" }
    }

    const studentProfile = await resolveStudentProfile(session)

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

    if (studentProfile.supervisor?.userId) {
      await createNotification({
        userId: studentProfile.supervisor.userId,
        title: `Chapter ${data.number} Uploaded`,
        message: `${studentProfile.user.name} submitted Chapter ${data.number}: "${data.title}" for review.`,
        type: "CHAPTER",
        link: `/chapters/${newChapter.id}`
      })
    }

    revalidatePath("/student/chapters")
    revalidatePath("/student/documents")
    return { success: true, chapter: newChapter }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getStudentChapters() {
  const session = await auth()
  if (!session?.user || session.user.role !== "STUDENT") return []

  const studentProfile = await resolveStudentProfile(session)

  if (!studentProfile) return []

  return prisma.chapter.findMany({
    where: { studentId: studentProfile.id },
    include: {
      comments: true,
      student: {
        include: { user: true }
      }
    },
    orderBy: { submittedAt: 'desc' }
  })
}

export async function getSupervisorChapters() {
  const session = await auth()
  if (!session?.user || session.user.role !== "SUPERVISOR") return []

  const supervisorProfile = await resolveSupervisorProfile(session)

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
    if (!session?.user || session.user.role !== "SUPERVISOR") {
      return { success: false, error: "Unauthorized" }
    }

    const updated = await prisma.chapter.update({
      where: { id: chapterId },
      data: { status },
      include: { student: { include: { user: true } } }
    })

    if (updated.student?.user?.id) {
      await createNotification({
        userId: updated.student.user.id,
        title: `Chapter ${updated.number} Status Update`,
        message: `Your supervisor marked Chapter ${updated.number} (${updated.title}) as ${status}.`,
        type: "CHAPTER",
        link: `/chapters/${chapterId}`
      })
    }

    revalidatePath("/supervisor/chapters")
    revalidatePath(`/chapters/${chapterId}`)
    revalidatePath("/student/chapters")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getChapterById(id: string) {
  const session = await auth()
  if (!session?.user) return null

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
