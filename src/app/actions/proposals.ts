"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { TopicStatus } from "../../../generated/prisma/client"

export async function submitProposal(data: any, actionType: "draft" | "submit") {
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

    let topic = await prisma.topic.findFirst({
      where: { studentId: studentProfile.id }
    })

    if (!topic) {
      // Create a default topic if none exists for the sake of the proposal workflow
      topic = await prisma.topic.create({
        data: {
          studentId: studentProfile.id,
          title: "Default Topic",
          status: "PENDING"
        }
      })
    }

    await prisma.topic.update({
      where: { id: topic.id },
      data: {
        background: data.background,
        problemStatement: data.problemStatement,
        objectives: data.objectives,
        methodology: data.methodology,
        status: actionType === "submit" ? "PENDING" : topic.status
      }
    })

    revalidatePath("/student/proposal")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getStudentProposal() {
  const session = await auth()
  if (!session || !session.user?.id || session.user?.role !== "STUDENT") return null

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: { topics: true }
  })

  if (!studentProfile || studentProfile.topics.length === 0) return null

  return studentProfile.topics[0]
}

export async function getSupervisorProposals() {
  const session = await auth()
  if (!session || !session.user?.id || session.user?.role !== "SUPERVISOR") return []

  const supervisorProfile = await prisma.supervisorProfile.findUnique({
    where: { userId: session.user.id }
  })

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
    if (!session || !session.user?.id || session.user?.role !== "SUPERVISOR") {
      return { success: false, error: "Unauthorized" }
    }

    await prisma.topic.update({
      where: { id: topicId },
      data: {
        status,
        supervisorReview: reviewNotes
      }
    })

    revalidatePath("/supervisor/proposals")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
