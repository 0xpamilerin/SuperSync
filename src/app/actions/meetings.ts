"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { MeetingStatus } from "../../../generated/prisma/client"

export async function scheduleMeeting(studentId: string, date: Date, agenda: string) {
  try {
    const session = await auth()
    if (!session || !session.user?.id || session.user?.role !== "SUPERVISOR") {
      return { success: false, error: "Unauthorized" }
    }

    const supervisorProfile = await prisma.supervisorProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!supervisorProfile) {
      return { success: false, error: "Supervisor profile not found" }
    }

    await prisma.meeting.create({
      data: {
        supervisorId: supervisorProfile.id,
        studentId,
        date,
        agenda,
        status: "SCHEDULED"
      }
    })

    revalidatePath("/supervisor/meetings")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getStudentMeetings() {
  const session = await auth()
  if (!session || !session.user?.id || session.user?.role !== "STUDENT") return []

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!studentProfile) return []

  return prisma.meeting.findMany({
    where: { studentId: studentProfile.id },
    include: {
      supervisor: {
        include: { user: true }
      }
    },
    orderBy: { date: 'asc' }
  })
}

export async function getSupervisorMeetings() {
  const session = await auth()
  if (!session || !session.user?.id || session.user?.role !== "SUPERVISOR") return []

  const supervisorProfile = await prisma.supervisorProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!supervisorProfile) return []

  return prisma.meeting.findMany({
    where: { supervisorId: supervisorProfile.id },
    include: {
      student: {
        include: { user: true }
      }
    },
    orderBy: { date: 'asc' }
  })
}

export async function updateMeetingStatus(meetingId: string, status: MeetingStatus, notes?: string) {
  try {
    const session = await auth()
    if (!session || !session.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        status,
        ...(notes !== undefined && { notes })
      }
    })

    revalidatePath("/supervisor/meetings")
    revalidatePath("/student/meetings")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
