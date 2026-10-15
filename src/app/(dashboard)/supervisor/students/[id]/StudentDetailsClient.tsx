"use client"

import * as React from "react"
import Link from "next/link"
import { 
  ArrowLeft, 
  Mail, 
  GraduationCap, 
  FileText, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ExternalLink, 
  Download, 
  MessageSquare,
  AlertCircle,
  Building
} from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function StudentDetailsClient({ student }: { student: any }) {
  const currentTopic = student.topics?.[0] || null
  const chapters = student.chapters || []
  const meetings = student.meetings || []

  const approvedChapters = chapters.filter((c: any) => c.status === "APPROVED")
  const pendingChapters = chapters.filter((c: any) => c.status === "PENDING")

  // Calculate milestones
  const isTopicApproved = currentTopic?.status === "APPROVED"
  const isProposalSubmitted = !!(currentTopic?.background || currentTopic?.problemStatement)
  const isProposalApproved = isTopicApproved && isProposalSubmitted
  const ch1Approved = chapters.some((c: any) => c.number === 1 && c.status === "APPROVED")
  const ch2Approved = chapters.some((c: any) => c.number === 2 && c.status === "APPROVED")
  const ch3Approved = chapters.some((c: any) => c.number === 3 && c.status === "APPROVED")
  const ch4Approved = chapters.some((c: any) => c.number === 4 && c.status === "APPROVED")
  const ch5Approved = chapters.some((c: any) => c.number === 5 && c.status === "APPROVED")

  let completedStages = 0
  if (isTopicApproved) completedStages++
  if (isProposalApproved) completedStages++
  if (ch1Approved && ch2Approved) completedStages++
  if (ch3Approved) completedStages++
  if (ch4Approved && ch5Approved) completedStages++

  const progressPercentage = Math.round((completedStages / 5) * 100)

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-secondary text-white hover:bg-secondary">Approved</Badge>
      case "PENDING":
        return <Badge variant="outline" className="text-warning border-warning bg-warning/10">Pending Review</Badge>
      case "CHANGES_REQUESTED":
        return <Badge variant="destructive">Changes Requested</Badge>
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-6xl mx-auto w-full pb-12">
      {/* Navigation Header */}
      <div className="flex items-center gap-4">
        <Link href="/supervisor/students" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Supervisee Dossier</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Comprehensive academic and project profile</p>
        </div>
      </div>

      {/* Student Profile Card */}
      <Card className="overflow-hidden border shadow-sm">
        <div className="bg-primary/5 p-6 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-primary/20">
              <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                {student.user.name?.charAt(0) || "S"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-foreground">{student.user.name}</h2>
                <Badge variant="outline" className="bg-background font-mono text-xs">
                  {student.matricNumber}
                </Badge>
                {student.level && (
                  <Badge variant="secondary" className="text-xs">
                    {student.level} Level
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground mt-1 flex-wrap">
                <a href={`mailto:${student.user.email}`} className="hover:text-primary flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {student.user.email}
                </a>
                <span className="flex items-center gap-1">
                  <Building className="h-3.5 w-3.5" />
                  {student.department?.name || "Computer Science"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link href="/supervisor/meetings" className={buttonVariants({ variant: "outline", size: "sm", className: "w-full sm:w-auto" })}>
              <Calendar className="h-4 w-4 mr-1.5" />
              Schedule Meeting
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x border-b bg-card">
          <div className="p-4 sm:p-5">
            <p className="text-xs text-muted-foreground uppercase font-medium">Topic Status</p>
            <div className="mt-2">
              {currentTopic ? getStatusBadge(currentTopic.status) : <Badge variant="secondary">No Topic</Badge>}
            </div>
            <p className="text-xs text-muted-foreground mt-2 truncate font-medium">
              {currentTopic?.title || "Pending submission"}
            </p>
          </div>

          <div className="p-4 sm:p-5">
            <p className="text-xs text-muted-foreground uppercase font-medium">Chapters Approved</p>
            <p className="text-2xl font-bold mt-1 text-foreground">
              {approvedChapters.length} <span className="text-sm font-normal text-muted-foreground">/ 5</span>
            </p>
            <p className="text-xs text-warning mt-1 font-medium">
              {pendingChapters.length} pending review
            </p>
          </div>

          <div className="p-4 sm:p-5">
            <p className="text-xs text-muted-foreground uppercase font-medium">Meetings Logged</p>
            <p className="text-2xl font-bold mt-1 text-foreground">
              {meetings.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Total sessions
            </p>
          </div>

          <div className="p-4 sm:p-5">
            <p className="text-xs text-muted-foreground uppercase font-medium">Overall Progress</p>
            <div className="flex items-center gap-3 mt-2">
              <Progress value={progressPercentage} className="h-2 flex-1" />
              <span className="text-sm font-bold">{progressPercentage}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Milestone completion
            </p>
          </div>
        </div>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="chapters" className="w-full">
        <TabsList className="grid w-full sm:w-auto grid-cols-3 max-w-md h-10 p-1 mb-6">
          <TabsTrigger value="chapters" className="text-xs sm:text-sm">Chapters ({chapters.length})</TabsTrigger>
          <TabsTrigger value="topics" className="text-xs sm:text-sm">Topics & Proposal</TabsTrigger>
          <TabsTrigger value="meetings" className="text-xs sm:text-sm">Meetings ({meetings.length})</TabsTrigger>
        </TabsList>

        {/* Chapters Tab */}
        <TabsContent value="chapters" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4">
              <div>
                <CardTitle className="text-lg">Chapter Submissions</CardTitle>
                <CardDescription>All drafts and finalized chapters submitted by {student.user.name}</CardDescription>
              </div>
              <Link href="/supervisor/chapters" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Go to Global Queue <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Chapter</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chapters.map((ch: any) => (
                      <TableRow key={ch.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-primary shrink-0" />
                            <span>Chapter {ch.number}: {ch.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">v{ch.version}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(ch.submittedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatFileSize(ch.fileSize)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(ch.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <a href={ch.fileUrl} download={ch.fileName} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </a>
                            <Link href={`/chapters/${ch.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                              <MessageSquare className="h-4 w-4 mr-1.5" />
                              Review Thread
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {chapters.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No chapters submitted yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Topics & Proposal Tab */}
        <TabsContent value="topics" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
              <div>
                <CardTitle className="text-lg">Project Topic</CardTitle>
                <CardDescription>Topic proposals submitted for your review</CardDescription>
              </div>
              <Link href="/supervisor/topics" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Review Topics
              </Link>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {student.topics?.map((topic: any) => (
                <div key={topic.id} className="p-4 rounded-lg border bg-card space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-base">{topic.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Submitted on {new Date(topic.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(topic.status)}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {topic.description}
                  </p>

                  {topic.supervisorReview && (
                    <div className="p-3 bg-muted/50 rounded-md border text-sm">
                      <p className="font-medium text-foreground text-xs uppercase mb-1">Your Review Notes:</p>
                      <p className="text-muted-foreground">{topic.supervisorReview}</p>
                    </div>
                  )}
                </div>
              ))}
              {(!student.topics || student.topics.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-6">No topics proposed yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Proposal Document details if present */}
          {currentTopic && (currentTopic.background || currentTopic.problemStatement) && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
                <div>
                  <CardTitle className="text-lg">Detailed Proposal Document</CardTitle>
                  <CardDescription>Formal research outline</CardDescription>
                </div>
                <Link href="/supervisor/proposals" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Proposal Reviews
                </Link>
              </CardHeader>
              <CardContent className="pt-6 space-y-4 text-sm">
                {currentTopic.background && (
                  <div>
                    <h5 className="font-semibold text-foreground mb-1">Background</h5>
                    <p className="text-muted-foreground leading-relaxed">{currentTopic.background}</p>
                  </div>
                )}
                {currentTopic.problemStatement && (
                  <div>
                    <h5 className="font-semibold text-foreground mb-1">Problem Statement</h5>
                    <p className="text-muted-foreground leading-relaxed">{currentTopic.problemStatement}</p>
                  </div>
                )}
                {currentTopic.objectives && (
                  <div>
                    <h5 className="font-semibold text-foreground mb-1">Objectives</h5>
                    <p className="text-muted-foreground leading-relaxed">{currentTopic.objectives}</p>
                  </div>
                )}
                {currentTopic.methodology && (
                  <div>
                    <h5 className="font-semibold text-foreground mb-1">Methodology</h5>
                    <p className="text-muted-foreground leading-relaxed">{currentTopic.methodology}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Meetings Tab */}
        <TabsContent value="meetings" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg">Supervision Meetings</CardTitle>
                <CardDescription>Scheduled and past advisory sessions with {student.user.name}</CardDescription>
              </div>
              <Link href="/supervisor/meetings" className={buttonVariants({ variant: "outline", size: "sm" })}>
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                Manage Meetings
              </Link>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agenda</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meetings.map((meeting: any) => (
                      <TableRow key={meeting.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          {meeting.agenda}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(meeting.date).toLocaleDateString()} at {new Date(meeting.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {meeting.notes || "No notes"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={meeting.status === "COMPLETED" ? "default" : "outline"}>
                            {meeting.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {meetings.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          No meetings logged with this student.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
