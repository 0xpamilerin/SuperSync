"use server"

import prisma from "@/lib/db"
import { auth } from "@/auth"
import { resolveSupervisorProfile, resolveUser } from "@/lib/user-helper"

export async function getSupervisorStudents() {
  const session = await auth()
  if (!session?.user || session.user.role !== "SUPERVISOR") {
    return []
  }

  const supervisorProfile = await resolveSupervisorProfile(session)

  if (!supervisorProfile) return []

  const students = await prisma.studentProfile.findMany({
    where: { supervisorId: supervisorProfile.id },
    include: {
      user: true,
      department: true,
      topics: {
        orderBy: { updatedAt: "desc" },
        take: 1
      },
      chapters: {
        orderBy: { number: "desc" },
        take: 1
      }
    }
  })

  return students
}

export async function getSupervisorFeedbackHistory() {
  const session = await auth()
  if (!session?.user || session.user.role !== "SUPERVISOR") {
    return []
  }

  const supervisorProfile = await resolveSupervisorProfile(session)
  const user = await resolveUser(session)
  if (!supervisorProfile || !user) return []

  // 1. Topic reviews
  const reviewedTopics = await prisma.topic.findMany({
    where: {
      student: { supervisorId: supervisorProfile.id },
      supervisorReview: { not: null }
    },
    include: {
      student: { include: { user: true } }
    },
    orderBy: { updatedAt: "desc" }
  })

  // 2. Chapter comments written by supervisor
  const chapterComments = await prisma.comment.findMany({
    where: {
      authorId: user.id
    },
    include: {
      chapter: {
        include: {
          student: { include: { user: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  // 3. Meeting notes
  const meetingNotes = await prisma.meeting.findMany({
    where: {
      supervisorId: supervisorProfile.id,
      notes: { not: null }
    },
    include: {
      student: { include: { user: true } }
    },
    orderBy: { date: "desc" }
  })

  const feedbackList = [
    ...reviewedTopics.map(t => ({
      id: `topic-${t.id}`,
      student: t.student.user.name,
      matric: t.student.matricNumber,
      type: "Topic Review",
      target: t.title,
      date: new Date(t.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      content: t.supervisorReview || "",
      status: t.status
    })),
    ...chapterComments.map(c => ({
      id: `comment-${c.id}`,
      student: c.chapter.student.user.name,
      matric: c.chapter.student.matricNumber,
      type: "Chapter Review",
      target: `Chapter ${c.chapter.number}: ${c.chapter.title}`,
      date: new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      content: c.content,
      status: c.chapter.status
    })),
    ...meetingNotes.map(m => ({
      id: `meeting-${m.id}`,
      student: m.student.user.name,
      matric: m.student.matricNumber,
      type: "Meeting Notes",
      target: m.agenda,
      date: new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      content: m.notes || "",
      status: m.status
    }))
  ]

  return feedbackList
}

export async function getSupervisorReports() {
  const session = await auth()
  if (!session?.user || session.user.role !== "SUPERVISOR") {
    return {
      progressData: [],
      performanceData: [],
      totalStudents: 0
    }
  }

  const supervisorProfile = await resolveSupervisorProfile(session)
  if (!supervisorProfile) {
    return {
      progressData: [],
      performanceData: [],
      totalStudents: 0
    }
  }

  const students = await prisma.studentProfile.findMany({
    where: { supervisorId: supervisorProfile.id },
    include: {
      user: true,
      topics: true,
      chapters: true
    }
  })

  if (students.length === 0) {
    return {
      progressData: [],
      performanceData: [],
      totalStudents: 0
    }
  }

  // Count students by progress stage
  let topicSelectionCount = 0
  let chapter12Count = 0
  let chapter3Count = 0
  let chapter45Count = 0
  let completedCount = 0

  const performanceData: { name: string; score: number }[] = []

  for (const s of students) {
    const approvedCount = s.chapters.filter(c => c.status === "APPROVED").length
    const maxChapter = s.chapters.reduce((max, c) => Math.max(max, c.number), 0)

    if (approvedCount >= 5) {
      completedCount++
    } else if (maxChapter >= 4) {
      chapter45Count++
    } else if (maxChapter === 3) {
      chapter3Count++
    } else if (maxChapter >= 1) {
      chapter12Count++
    } else {
      topicSelectionCount++
    }

    // Performance score estimation based on progress and approvals
    const progressScore = Math.min(100, Math.round((approvedCount / 5) * 80 + (s.chapters.length > 0 ? 20 : 0)))
    performanceData.push({
      name: s.user.name.split(" ")[0] + ` (${s.matricNumber.slice(-3)})`,
      score: progressScore
    })
  }

  const progressData = [
    { name: "Topic Selection", value: topicSelectionCount },
    { name: "Chapter 1-2", value: chapter12Count },
    { name: "Chapter 3", value: chapter3Count },
    { name: "Chapter 4-5", value: chapter45Count },
    { name: "Completed", value: completedCount }
  ].filter(p => p.value > 0)

  return {
    progressData,
    performanceData,
    totalStudents: students.length
  }
}
