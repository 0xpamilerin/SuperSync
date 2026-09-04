import * as React from "react"
import { 
  Users, 
  FileText, 
  Clock, 
  Activity
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupervisorDashboardData } from "@/app/actions/dashboard"
import { redirect } from "next/navigation"
import { SuperviseeTable } from "./supervisee-table"
import prisma from "@/lib/db"

export default async function SupervisorDashboard() {
  const data = await getSupervisorDashboardData()
  if (!data) {
    redirect("/login")
  }

  const { stats, supervisorProfile } = data

  // We need to fetch detailed info for each assigned student to pass to the table
  // This could also be an action
  const studentsWithDetails = await prisma.studentProfile.findMany({
    where: { supervisorId: supervisorProfile.id },
    include: {
      user: true,
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

  const mappedStudents = studentsWithDetails.map(student => {
    const currentTopic = student.topics.length > 0 ? student.topics[0] : null
    const latestChapter = student.chapters.length > 0 ? student.chapters[0] : null

    let status = "approved"
    let currentStage = "Initial Setup"
    
    if (currentTopic) {
      if (currentTopic.status === "PENDING") status = "pending_topic"
      else if (currentTopic.status === "CHANGES_REQUESTED") status = "action_required"
      
      currentStage = `Topic: ${currentTopic.title}`
    }

    if (latestChapter) {
      if (latestChapter.status === "PENDING") status = "pending_review"
      else if (latestChapter.status === "CHANGES_REQUESTED") status = "action_required"
      
      currentStage = `Chapter ${latestChapter.number}`
    }

    return {
      id: student.id,
      name: student.user.name,
      topic: currentTopic?.title || "No Topic Selected",
      currentChapter: currentStage,
      status: status,
      lastActivity: new Date(currentTopic?.createdAt || latestChapter?.submittedAt || student.user.createdAt).toLocaleDateString()
    }
  })

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Supervisor Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your supervisees and review their project progress.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Supervisees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{stats.assignedStudentsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Topics</CardTitle>
            <FileText className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums text-warning">
              {mappedStudents.filter(s => s.status === 'pending_topic').length}
            </div>
            <p className="text-xs text-muted-foreground">Requires your approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums text-warning">
              {stats.pendingReviewsCount - mappedStudents.filter(s => s.status === 'pending_topic').length}
            </div>
            <p className="text-xs text-muted-foreground">Chapters waiting for feedback</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
            <Activity className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{stats.upcomingMeetings}</div>
            <p className="text-xs text-muted-foreground">Scheduled meetings</p>
          </CardContent>
        </Card>
      </div>

      <SuperviseeTable students={mappedStudents} />
    </div>
  )
}
