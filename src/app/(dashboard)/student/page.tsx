import * as React from "react"
import Link from "next/link"
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  Bell, 
  MessageSquare,
  Calendar,
  FileIcon,
  ArrowRight
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ProgressTracker } from "@/components/dashboard/ProgressTracker"

import { auth } from "@/auth"
import { getStudentDashboardData } from "@/app/actions/dashboard"
import { redirect } from "next/navigation"

export default async function StudentDashboard() {
  const session = await auth()
  if (!session || session.user?.role !== "STUDENT") {
    redirect("/login")
  }

  const data = await getStudentDashboardData()
  
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8 text-center rounded-2xl border border-border bg-card">
        <div className="rounded-full bg-primary/10 p-3 text-primary">
          <FileText className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold">Unable to load student data</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Your profile session could not be retrieved. Please sign in again to refresh your credentials.
        </p>
        <Link href="/login" className={buttonVariants({ variant: "default" })}>
          Sign In Again
        </Link>
      </div>
    )
  }

  const { studentProfile, stats } = data
  const user = session.user
  const currentTopic = studentProfile.topics.length > 0 ? studentProfile.topics[0] : null
  const supervisor = studentProfile.supervisor

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-2 rounded-2xl bg-primary/5 p-6 md:p-8">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-muted-foreground">
          Your current topic: <span className="font-semibold text-foreground">{currentTopic?.title || "No topic assigned yet"}</span>
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chapters Submitted</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{stats.chaptersSubmitted}</div>
            <p className="text-xs text-muted-foreground">Out of 5 total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums text-secondary">{stats.chaptersApproved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums text-warning">{stats.chaptersPending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{stats.unreadAlerts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Tracker */}
      <ProgressTracker currentStageIndex={currentTopic?.status === "APPROVED" ? 1 : 0} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Left Column: Feedback & Uploads */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          <Card className="flex-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-semibold">Recent Feedback</CardTitle>
                <CardDescription>Latest comments from your supervisor</CardDescription>
              </div>
              <Link href="/student/topics" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent className="grid gap-4">
              {currentTopic?.supervisorReview && (
                <div className="flex items-start gap-4 rounded-lg border p-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Topic Review</p>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{currentTopic.supervisorReview}</p>
                  </div>
                </div>
              )}
              {studentProfile.chapters.length === 0 && !currentTopic?.supervisorReview && (
                <p className="text-sm text-muted-foreground">No recent feedback.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Recent Uploads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentProfile.chapters.slice(0, 3).map((file, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded bg-muted p-2">
                        <FileIcon className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium leading-none">{file.fileName}</p>
                        <p className="text-xs text-muted-foreground">{(file.fileSize / 1024 / 1024).toFixed(2)} MB • Uploaded {new Date(file.submittedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Badge variant={file.status === 'APPROVED' ? 'default' : 'secondary'} className={
                      file.status === 'APPROVED' ? 'bg-secondary hover:bg-secondary text-white' : 'bg-warning/20 text-warning hover:bg-warning/30'
                    }>
                      {file.status === 'APPROVED' ? 'Approved' : file.status === 'PENDING' ? 'Pending' : file.status}
                    </Badge>
                  </div>
                ))}
                {studentProfile.chapters.length === 0 && (
                  <p className="text-sm text-muted-foreground">No uploads yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Supervisor & Meetings */}
        <div className="flex flex-col gap-6 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Assigned Supervisor</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center">
              {supervisor ? (
                <>
                  <Avatar className="h-20 w-20 mb-4">
                    <AvatarFallback>{supervisor.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold">{supervisor.user.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{supervisor.user.email}</p>
                  <div className="flex w-full gap-2">
                    <Link href={`/messages?to=${supervisor.user.id}`} className={buttonVariants({ variant: "outline", className: "flex-1" })}>
                      Message
                    </Link>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No supervisor assigned yet.</p>
              )}
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Upcoming Meetings</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {studentProfile.meetings.length > 0 ? (
                studentProfile.meetings.map(meeting => (
                  <div key={meeting.id} className="flex items-center gap-4 rounded-lg border p-3">
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded bg-primary/10 text-primary">
                      <span className="text-xs font-semibold uppercase">{new Date(meeting.date).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-lg font-bold leading-none">{new Date(meeting.date).getDate()}</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{meeting.agenda}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {new Date(meeting.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center rounded-lg border border-dashed p-6 text-center">
                  <div className="space-y-1">
                    <Calendar className="mx-auto h-6 w-6 text-muted-foreground" />
                    <p className="text-sm font-medium">No other meetings scheduled</p>
                    <Button variant="link" size="sm" className="px-0 h-auto">Request a meeting</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
