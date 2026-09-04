"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { TopicStatus } from "../../../generated/prisma/client"
import { resolveStudentProfile, resolveSupervisorProfile } from "@/lib/user-helper"

export async function submitTopic(data: { title: string; description: string }) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "STUDENT") {
      return { success: false, error: "Unauthorized" }
    }

    const studentProfile = await resolveStudentProfile(session)

    if (!studentProfile) {
      return { success: false, error: "Student profile not found" }
    }

    await prisma.topic.create({
      data: {
        studentId: studentProfile.id,
        title: data.title,
        description: data.description,
        status: "PENDING"
      }
    })

    revalidatePath("/student/topics")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getStudentTopics() {
  const session = await auth()
  if (!session?.user || session.user.role !== "STUDENT") return []

  const studentProfile = await resolveStudentProfile(session)

  if (!studentProfile) return []

  return prisma.topic.findMany({
    where: { studentId: studentProfile.id },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getSupervisorTopics() {
  const session = await auth()
  if (!session?.user || session.user.role !== "SUPERVISOR") return []

  const supervisorProfile = await resolveSupervisorProfile(session)

  if (!supervisorProfile) return []

  return prisma.topic.findMany({
    where: {
      student: {
        supervisorId: supervisorProfile.id
      }
    },
    include: {
      student: {
        include: { user: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function reviewTopic(topicId: string, status: TopicStatus, reviewNotes: string) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "SUPERVISOR") {
      return { success: false, error: "Unauthorized" }
    }

    await prisma.topic.update({
      where: { id: topicId },
      data: {
        status,
        supervisorReview: reviewNotes
      }
    })

    revalidatePath("/supervisor/topics")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
