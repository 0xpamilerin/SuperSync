"use client"

import * as React from "react"
import { Search, FileText, CheckCircle2, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { reviewTopic } from "@/app/actions/topics"

export function SupervisorTopicsClient({ topics }: { topics: any[] }) {
  const [selectedTopic, setSelectedTopic] = React.useState<any | null>(null)
  const [feedback, setFeedback] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleReview = async (status: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED") => {
    if (!selectedTopic) return
    
    setIsSubmitting(true)
    const result = await reviewTopic(selectedTopic.id, status as any, feedback)
    
    if (result.success) {
      toast({
        title: "Topic Updated",
        description: `Topic has been ${status.toLowerCase()}.`,
        type: "success"
      })
      // We could update the local state here or let the parent component re-fetch.
      // Easiest is to reload the page or update local state.
      window.location.reload()
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update topic",
        type: "error"
      })
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Topic Reviews</h1>
        <p className="text-muted-foreground">Review and approve project topics proposed by your assigned students.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 h-fit max-h-[800px] flex flex-col">
          <CardHeader>
            <CardTitle>Queue</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search students..." className="pl-8" />
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto flex-1">
            <div className="flex flex-col divide-y">
              {topics.map((topic) => (
                <div 
                  key={topic.id}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${selectedTopic?.id === topic.id ? 'bg-muted' : ''}`}
                  onClick={() => {
                    setSelectedTopic(topic)
                    setFeedback(topic.supervisorReview || "")
                  }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold">{topic.student.user.name}</span>
                    <Badge variant={topic.status === "PENDING" ? "outline" : (topic.status === "APPROVED" ? "default" : "destructive")}
                           className={topic.status === "PENDING" ? "text-warning border-warning bg-warning/10" : ""}
                    >
                      {topic.status}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium line-clamp-1">{topic.title}</p>
                  <p className="text-xs text-muted-foreground mt-2">{new Date(topic.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
              {topics.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  No topics in queue.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          {selectedTopic ? (
            <>
              <CardHeader className="border-b pb-6">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-xl mb-2">{selectedTopic.title}</CardTitle>
                    <CardDescription>Submitted by {selectedTopic.student.user.name} ({selectedTopic.student.matricNumber}) on {new Date(selectedTopic.createdAt).toLocaleDateString()}</CardDescription>
                  </div>
                  <Badge variant={selectedTopic.status === "PENDING" ? "outline" : (selectedTopic.status === "APPROVED" ? "default" : "destructive")}
                         className={selectedTopic.status === "PENDING" ? "text-warning border-warning bg-warning/10 text-sm px-3 py-1" : "text-sm px-3 py-1"}
                  >
                    {selectedTopic.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Proposal Description</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {selectedTopic.description}
                  </p>
                </div>
                
                {selectedTopic.status === "PENDING" && (
                  <div className="space-y-3 pt-6 border-t">
                    <Label htmlFor="feedback">Reviewer Notes (Optional)</Label>
                    <Textarea 
                      id="feedback" 
                      placeholder="Add any feedback or conditions for approval here..." 
                      className="min-h-[100px]"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                )}
                
                {selectedTopic.status !== "PENDING" && selectedTopic.supervisorReview && (
                  <div className="space-y-3 pt-6 border-t">
                    <h3 className="font-semibold mb-2">Your Review Notes</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                      {selectedTopic.supervisorReview}
                    </p>
                  </div>
                )}
              </CardContent>
              {selectedTopic.status === "PENDING" && (
                <CardFooter className="flex justify-end gap-3 border-t p-6 bg-muted/20">
                  <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleReview("REJECTED")} disabled={isSubmitting}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Topic
                  </Button>
                  <Button variant="outline" className="text-warning hover:text-warning" onClick={() => handleReview("CHANGES_REQUESTED")} disabled={isSubmitting}>
                    Request Changes
                  </Button>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => handleReview("APPROVED")} disabled={isSubmitting}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve Topic
                  </Button>
                </CardFooter>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
              <FileText className="h-12 w-12 mb-4 opacity-20" />
              <p>Select a topic from the queue to review.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
