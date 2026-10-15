"use server"

import prisma from "@/lib/db"
import { auth } from "@/auth"

export async function getStudentDashboardData() {
  const session = await auth()
  if (!session || !session.user || session.user.role !== "STUDENT") {
    return null
  }

  let studentProfile = await prisma.studentProfile.findFirst({
    where: {
      OR: [
        ...(session.user.id ? [{ userId: session.user.id }] : []),
        ...(session.user.email ? [{ user: { email: session.user.email } }] : [])
      ]
    },
    include: {
      user: true,
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

  // Self-heal: if student user exists in database but has no profile, create default profile
  if (!studentProfile && session.user.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (user && user.role === "STUDENT") {
      let dept = await prisma.department.findFirst()
      if (!dept) {
        dept = await prisma.department.create({
          data: { name: "Computer Science", code: "CSC" }
        })
      }
      studentProfile = await prisma.studentProfile.create({
        data: {
          userId: user.id,
          matricNumber: `MAT${Math.floor(100000 + Math.random() * 900000)}`,
          departmentId: dept.id,
          level: 400
        },
        include: {
          user: true,
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
    }
  }

  if (!studentProfile) return null

  // Calculate stats
  const chaptersSubmitted = studentProfile.chapters.length
  const chaptersApproved = studentProfile.chapters.filter(c => c.status === "APPROVED").length
  const chaptersPending = studentProfile.chapters.filter(c => c.status === "PENDING").length
  
  // Real unread alerts
  const unreadAlerts = await prisma.notification.count({
    where: { userId: studentProfile.userId, isRead: false }
  })

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
  if (!session || !session.user || session.user.role !== "SUPERVISOR") {
    return null
  }

  let supervisorProfile = await prisma.supervisorProfile.findFirst({
    where: {
      OR: [
        ...(session.user.id ? [{ userId: session.user.id }] : []),
        ...(session.user.email ? [{ user: { email: session.user.email } }] : [])
      ]
    },
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

  // Self-heal supervisor profile
  if (!supervisorProfile && session.user.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (user && user.role === "SUPERVISOR") {
      let dept = await prisma.department.findFirst()
      if (!dept) {
        dept = await prisma.department.create({
          data: { name: "Computer Science", code: "CSC" }
        })
      }
      supervisorProfile = await prisma.supervisorProfile.create({
        data: {
          userId: user.id,
          staffId: `STAFF${Math.floor(1000 + Math.random() * 9000)}`,
          departmentId: dept.id,
          maxStudents: 5
        },
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
    }
  }

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
  if (!session || !session.user || session.user.role !== "ADMIN") {
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

