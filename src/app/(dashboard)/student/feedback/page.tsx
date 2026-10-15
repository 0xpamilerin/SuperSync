"use client"

import * as React from "react"
import { Search, MessageSquare, Filter, ChevronDown, Reply } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Textarea } from "@/components/ui/textarea"

import { getStudentTopics } from "@/app/actions/topics"
import { getStudentChapters } from "@/app/actions/chapters"

type FeedbackItem = {
  id: string;
  type: string;
  target: string;
  date: Date;
  content: string;
  status: string;
}

export default function StudentFeedbackPage() {
  const [activeFeedback, setActiveFeedback] = React.useState<string | null>(null)
  const [feedbackList, setFeedbackList] = React.useState<FeedbackItem[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  
  React.useEffect(() => {
    async function loadFeedback() {
      const topics = await getStudentTopics()
      const chapters = await getStudentChapters()
      
      const items: FeedbackItem[] = []
      
      topics.forEach((t: any) => {
        if (t.supervisorReview) {
          items.push({
            id: `topic-${t.id}`,
            type: "Topic Review",
            target: t.title,
            date: t.updatedAt,
            content: t.supervisorReview,
            status: "Read"
          })
        }
      })
      
      chapters.forEach((c: any) => {
        if (c.comments && c.comments.length > 0) {
          c.comments.forEach((comment: any) => {
            // Include only comments not written by the student (written by supervisor)
            const studentUserId = c.student?.userId
            if (studentUserId ? comment.authorId !== studentUserId : comment.authorId !== c.studentId) {
              items.push({
                id: `comment-${comment.id}`,
                type: "Chapter Feedback",
                target: c.fileName || `Chapter ${c.number}`,
                date: comment.createdAt,
                content: comment.content,
                status: comment.isResolved ? "Resolved" : "New"
              })
            }
          })
        }
      })
      
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setFeedbackList(items)
    }
    loadFeedback()
  }, [])

  const filteredFeedback = React.useMemo(() => {
    if (!searchQuery.trim()) return feedbackList
    const q = searchQuery.toLowerCase()
    return feedbackList.filter(
      (item) =>
        item.target.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
    )
  }, [feedbackList, searchQuery])

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Feedback</h1>
          <p className="text-muted-foreground">View feedback and notes from your supervisor.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search feedback..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredFeedback.length === 0 && (
              <p className="text-center text-muted-foreground py-8 border border-dashed rounded-md">
                {searchQuery ? "No matching feedback found." : "No feedback found."}
              </p>
            )}
            {filteredFeedback.map((feedback) => (
              <Collapsible 
                key={feedback.id} 
                className="border rounded-md overflow-hidden"
                open={activeFeedback === feedback.id}
                onOpenChange={(isOpen) => setActiveFeedback(isOpen ? feedback.id : null)}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4 text-left">
                      <div className="bg-primary/10 p-2 rounded-full relative">
                        {feedback.status === "New" && (
                          <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                        <MessageSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          {feedback.type}
                          {feedback.status === "New" && (
                            <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 bg-blue-100 text-blue-700 hover:bg-blue-100">New</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Regarding: {feedback.target}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-xs text-muted-foreground text-right hidden sm:block">
                        {new Date(feedback.date).toLocaleDateString()}
                      </div>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${activeFeedback === feedback.id ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 bg-muted/20 border-t">
                    <div className="text-sm leading-relaxed whitespace-pre-wrap mb-4">
                      {feedback.content}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
