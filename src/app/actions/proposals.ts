"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { TopicStatus } from "@/types/models"
import { resolveStudentProfile, resolveSupervisorProfile } from "@/lib/user-helper"

export async function submitProposal(data: any, actionType: "draft" | "submit") {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "STUDENT") {
      return { success: false, error: "Unauthorized" }
    }

    const studentProfile = await resolveStudentProfile(session)

    if (!studentProfile) {
      return { success: false, error: "Student profile not found" }
    }

    let topic = await prisma.topic.findFirst({
      where: { studentId: studentProfile.id }
    })

    if (!topic) {
      // Create a default topic if none exists for the sake of the proposal workflow
      topic = await prisma.topic.create({
        data: {
          studentId: studentProfile.id,
          title: "Default Topic",
          status: actionType === "submit" ? "PENDING" : "DRAFT"
        }
      })
    }

    const nextStatus = actionType === "submit" ? "PENDING" : (topic.status === "PENDING" || topic.status === "APPROVED" ? topic.status : "DRAFT")

    await prisma.topic.update({
      where: { id: topic.id },
      data: {
        background: data.background,
        problemStatement: data.problemStatement,
        objectives: data.objectives,
        methodology: data.methodology,
        status: nextStatus
      }
    })

    if (actionType === "submit" && studentProfile.supervisorId) {
      const sup = await prisma.supervisorProfile.findUnique({
        where: { id: studentProfile.supervisorId }
      })
      if (sup) {
        await prisma.notification.create({
          data: {
            userId: sup.userId,
            title: "Proposal Submitted",
            message: "A student submitted a project proposal for review.",
            link: "/supervisor/proposals"
          }
        })
      }
    }

    revalidatePath("/student/proposal")
    revalidatePath("/supervisor/proposals")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getStudentProposal() {
  const session = await auth()
  if (!session?.user || session.user.role !== "STUDENT") return null

  const studentProfile = await resolveStudentProfile(session)
  if (!studentProfile) return null

  const topic = await prisma.topic.findFirst({
    where: { studentId: studentProfile.id },
    orderBy: { updatedAt: "desc" }
  })

  return topic
}

export async function getSupervisorProposals() {
  const session = await auth()
  if (!session?.user || session.user.role !== "SUPERVISOR") return []

  const supervisorProfile = await resolveSupervisorProfile(session)
  if (!supervisorProfile) return []

  const topics = await prisma.topic.findMany({
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
    orderBy: { updatedAt: 'desc' }
  })

  return topics
}

export async function reviewProposal(topicId: string, status: TopicStatus, reviewNotes: string) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "SUPERVISOR") {
      return { success: false, error: "Unauthorized" }
    }

    const updated = await prisma.topic.update({
      where: { id: topicId },
      data: {
        status,
        supervisorReview: reviewNotes
      },
      include: {
        student: {
          include: { user: true }
        }
      }
    })

    if (updated?.student?.userId) {
      await prisma.notification.create({
        data: {
          userId: updated.student.userId,
          title: "Proposal Review Updated",
          message: `Your project proposal has been marked as ${status.toLowerCase()} by your supervisor.`,
          link: "/student/proposal"
        }
      })
    }

    revalidatePath("/supervisor/proposals")
    revalidatePath("/student/proposal")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
