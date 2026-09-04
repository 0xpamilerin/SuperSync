"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, FileText, MessageSquare, Clock, Check, XCircle } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { addComment, resolveComment } from "@/app/actions/comments"
import { reviewChapter } from "@/app/actions/chapters"

export function ChapterReviewClient({ 
  chapter, 
  currentUser 
}: { 
  chapter: any, 
  currentUser: any 
}) {
  const [comments, setComments] = React.useState(chapter.comments || [])
  const [newComment, setNewComment] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const isSupervisor = currentUser.role === "SUPERVISOR"
  const isStudent = currentUser.role === "STUDENT"

  const handleResolve = async (id: string) => {
    const result = await resolveComment(id, chapter.id)
    if (result.success) {
      setComments(comments.map((c: any) => 
        c.id === id ? { ...c, isResolved: true } : c
      ))
      toast({ title: "Comment resolved", type: "success" })
    } else {
      toast({ title: "Failed to resolve comment", description: result.error, type: "error" })
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return
    setIsSubmitting(true)

    const result = await addComment(chapter.id, newComment)
    if (result.success) {
      toast({ title: "Comment added", type: "success" })
      setNewComment("")
      window.location.reload()
    } else {
      toast({ title: "Failed to add comment", description: result.error, type: "error" })
    }
    setIsSubmitting(false)
  }

  const handleReviewChapter = async (status: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED") => {
    setIsSubmitting(true)
    const result = await reviewChapter(chapter.id, status)
    if (result.success) {
      toast({ title: `Chapter marked as ${status}`, type: "success" })
      window.location.reload()
    } else {
      toast({ title: "Failed to review chapter", description: result.error, type: "error" })
    }
    setIsSubmitting(false)
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Link href={isSupervisor ? "/supervisor/chapters" : "/student/chapters"} className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Chapter {chapter.number}: {chapter.title}</h1>
            <Badge variant="outline" className={
              chapter.status === "PENDING" ? "text-warning border-warning bg-warning/10" : 
              chapter.status === "APPROVED" ? "bg-primary text-primary-foreground" : "text-destructive border-destructive"
            }>
              {chapter.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Submitted by {chapter.student.user.name} on {new Date(chapter.submittedAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 items-start">
        {/* Left Column: Comments Thread */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" /> Review Thread
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col">
                {comments.map((comment: any) => {
                  // Determine if the comment was written by supervisor or student based on role?
                  // We don't have author's role attached directly to comment, but we can compare authorId
                  const isAuthorSupervisor = comment.authorId !== chapter.student.user.id
                  const authorName = isAuthorSupervisor ? "Supervisor" : chapter.student.user.name
                  
                  return (
                    <div key={comment.id} className={cn("p-6 border-b last:border-0", comment.isResolved && "bg-muted/30 opacity-70")}>
                      <div className="flex gap-4">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{authorName}</span>
                              {isAuthorSupervisor && <Badge variant="secondary" className="text-[10px] h-4 px-1.5 py-0">Supervisor</Badge>}
                              <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            {isSupervisor && !comment.isResolved && (
                              <Button 
                                variant="outline"
                                size="sm" 
                                className="h-7 text-xs"
                                onClick={() => handleResolve(comment.id)}
                              >
                                Mark resolved
                              </Button>
                            )}
                            {comment.isResolved && (
                              <Badge variant="secondary" className="text-xs"><Check className="mr-1 h-3 w-3" /> Resolved</Badge>
                            )}
                          </div>
                          <div className="text-sm text-foreground/90 bg-muted/50 p-3 rounded-md">
                            {comment.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {comments.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No comments yet. Start the conversation below.
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="bg-muted/20 border-t p-6 flex flex-col items-end gap-3">
              <Textarea 
                placeholder="Reply to feedback or ask a question..." 
                className="min-h-[100px] bg-background"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={isSubmitting}
              />
              <Button onClick={handleSubmitComment} disabled={isSubmitting || !newComment.trim()}>Comment</Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Meta info & Revisions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current Submission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-md">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">{chapter.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {(chapter.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <a href={chapter.fileUrl} target="_blank" rel="noreferrer" download={chapter.fileName} className={buttonVariants({ variant: "outline", className: "w-full" })}>
                Download File
              </a>
            </CardContent>
          </Card>

          {isSupervisor && chapter.status !== "APPROVED" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Review Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => handleReviewChapter("APPROVED")}
                  disabled={isSubmitting}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve Chapter
                </Button>
                <Button 
                  className="w-full" variant="outline"
                  onClick={() => handleReviewChapter("CHANGES_REQUESTED")}
                  disabled={isSubmitting}
                >
                  Request Changes
                </Button>
                <Button 
                  className="w-full text-destructive hover:text-destructive" variant="outline"
                  onClick={() => handleReviewChapter("REJECTED")}
                  disabled={isSubmitting}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Chapter
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
