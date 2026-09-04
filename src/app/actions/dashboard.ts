"use server"

import prisma from "@/lib/db"
import { auth } from "@/auth"

export async function getStudentDashboardData() {
  const session = await auth()
  if (!session || !session.user?.id || session.user?.role !== "STUDENT") {
    return null
  }

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      supervisor: {
        include: { user: true }
      },
      topics: {
        orderBy: { updatedAt: 'desc' },
        take: 1
      },
      chapters: {
        orderBy: { submittedAt: 'desc' }
      },
      meetings: {
        where: { date: { gte: new Date() } },
        orderBy: { date: 'asc' },
        take: 3
      }
    }
  })

  if (!studentProfile) return null

  // Calculate stats
  const chaptersSubmitted = studentProfile.chapters.length
  const chaptersApproved = studentProfile.chapters.filter(c => c.status === "APPROVED").length
  const chaptersPending = studentProfile.chapters.filter(c => c.status === "PENDING").length
  
  // Fake unread alerts for now
  const unreadAlerts = 0 

  return {
    studentProfile,
    stats: {
      chaptersSubmitted,
      chaptersApproved,
      chaptersPending,
      unreadAlerts
    }
  }
}

export async function getSupervisorDashboardData() {
  const session = await auth()
  if (!session || !session.user?.id || session.user?.role !== "SUPERVISOR") {
    return null
  }

  const supervisorProfile = await prisma.supervisorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      assignedStudents: true,
      meetings: {
        where: { date: { gte: new Date() } },
        orderBy: { date: 'asc' },
        take: 5,
        include: { student: { include: { user: true } } }
      }
    }
  })

  if (!supervisorProfile) return null

  const assignedStudentsCount = supervisorProfile.assignedStudents.length

  // Get pending reviews count (topics + chapters)
  const pendingTopics = await prisma.topic.count({
    where: { student: { supervisorId: supervisorProfile.id }, status: "PENDING" }
  })
  
  const pendingChapters = await prisma.chapter.count({
    where: { student: { supervisorId: supervisorProfile.id }, status: "PENDING" }
  })

  const pendingReviewsCount = pendingTopics + pendingChapters

  // Recent submissions
  const recentChapters = await prisma.chapter.findMany({
    where: { student: { supervisorId: supervisorProfile.id } },
    orderBy: { submittedAt: 'desc' },
    take: 5,
    include: { student: { include: { user: true } } }
  })

  return {
    supervisorProfile,
    stats: {
      assignedStudentsCount,
      pendingReviewsCount,
      upcomingMeetings: supervisorProfile.meetings.length
    },
    recentChapters,
    upcomingMeetingsList: supervisorProfile.meetings
  }
}

export async function getAdminDashboardData() {
  const session = await auth()
  if (!session || !session.user?.id || session.user?.role !== "ADMIN") {
    return null
  }

  const totalStudents = await prisma.studentProfile.count()
  const totalSupervisors = await prisma.supervisorProfile.count()
  
  const totalProjects = await prisma.topic.count({
    where: { status: "APPROVED" }
  })

  const pendingTopics = await prisma.topic.count({
    where: { status: "PENDING" }
  })

  const pendingChapters = await prisma.chapter.count({
    where: { status: "PENDING" }
  })

  const completedProjects = await prisma.topic.count({
    where: { status: "APPROVED" } // in real app, we'd check if final chapter is approved
  })

  const activeSession = await prisma.session.findFirst({
    where: { isActive: true }
  })

  const supervisors = await prisma.supervisorProfile.findMany({
    include: {
      user: true,
      assignedStudents: true,
      department: true
    }
  })

  const recentRegistrations = await prisma.studentProfile.findMany({
    orderBy: { user: { createdAt: 'desc' } },
    take: 5,
    include: { user: true }
  })

  return {
    stats: {
      totalStudents,
      totalSupervisors,
      totalProjects,
      pendingReviews: pendingTopics + pendingChapters,
      completedProjects
    },
    supervisors,
    recentRegistrations,
    activeSession
  }
}

