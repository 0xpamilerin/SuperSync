"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { MeetingStatus } from "@/types/models"
import { resolveStudentProfile, resolveSupervisorProfile } from "@/lib/user-helper"

import { createNotification } from "@/app/actions/notifications"

export async function scheduleMeeting(studentId: string, date: Date, agenda: string) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "SUPERVISOR") {
      return { success: false, error: "Unauthorized" }
    }

    const supervisorProfile = await resolveSupervisorProfile(session)

    if (!supervisorProfile) {
      return { success: false, error: "Supervisor profile not found" }
    }

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      select: { userId: true }
    })

    await prisma.meeting.create({
      data: {
        supervisorId: supervisorProfile.id,
        studentId,
        date,
        agenda,
        status: "SCHEDULED"
      }
    })

    if (student) {
      const formattedDate = new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
      await createNotification({
        userId: student.userId,
        title: "New Meeting Scheduled",
        message: `Your supervisor scheduled a meeting for ${formattedDate}. Agenda: ${agenda}`,
        type: "MEETING",
        link: "/student/meetings"
      })
    }

    revalidatePath("/supervisor/meetings")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getStudentMeetings() {
  const session = await auth()
  if (!session?.user || session.user.role !== "STUDENT") return []

  const studentProfile = await resolveStudentProfile(session)

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
  if (!session?.user || session.user.role !== "SUPERVISOR") return []

  const supervisorProfile = await resolveSupervisorProfile(session)

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
    if (!session?.user) {
      return { success: false, error: "Unauthorized" }
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        student: { include: { user: true } },
        supervisor: { include: { user: true } }
      }
    })

    await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        status,
        ...(notes !== undefined && { notes })
      }
    })

    if (meeting) {
      const isSupervisor = session.user.role === "SUPERVISOR"
      const recipientId = isSupervisor ? meeting.student.userId : meeting.supervisor.userId
      const link = isSupervisor ? "/student/meetings" : "/supervisor/meetings"
      const statusText = status.toLowerCase()

      await createNotification({
        userId: recipientId,
        title: "Meeting Status Updated",
        message: `Meeting on ${new Date(meeting.date).toLocaleDateString()} has been marked as ${statusText}.${notes ? ` Notes: ${notes}` : ""}`,
        type: "MEETING",
        link
      })
    }

    revalidatePath("/supervisor/meetings")
    revalidatePath("/student/meetings")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
