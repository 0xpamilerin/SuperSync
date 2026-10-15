"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { TopicStatus } from "@/types/models"
import { resolveStudentProfile, resolveSupervisorProfile } from "@/lib/user-helper"

import { createNotification } from "@/app/actions/notifications"

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

    const newTopic = await prisma.topic.create({
      data: {
        studentId: studentProfile.id,
        title: data.title,
        description: data.description,
        status: "PENDING"
      }
    })

    if (studentProfile.supervisor?.userId) {
      await createNotification({
        userId: studentProfile.supervisor.userId,
        title: "New Project Topic Submitted",
        message: `${studentProfile.user.name} submitted a project topic: "${data.title}"`,
        type: "TOPIC",
        link: "/supervisor/topics"
      })
    }

    revalidatePath("/student/topics")
    return { success: true, topic: newTopic }
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

    const updatedTopic = await prisma.topic.update({
      where: { id: topicId },
      data: {
        status,
        supervisorReview: reviewNotes
      },
      include: {
        student: { include: { user: true } }
      }
    })

    if (updatedTopic.student?.user?.id) {
      await createNotification({
        userId: updatedTopic.student.user.id,
        title: `Topic ${status === "APPROVED" ? "Approved" : status === "REJECTED" ? "Rejected" : "Changes Requested"}`,
        message: `Your supervisor reviewed your topic "${updatedTopic.title}": ${reviewNotes || status}`,
        type: "TOPIC",
        link: "/student/topics"
      })
    }

    revalidatePath("/supervisor/topics")
    revalidatePath("/student/topics")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
