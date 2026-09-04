"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CheckCircle2, Clock, FileEdit, XCircle, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

import { getStudentTopics, submitTopic } from "@/app/actions/topics"

const topicSchema = z.object({
  title: z.string().min(10, { message: "Title must be at least 10 characters." }).max(150),
  description: z.string().min(20, { message: "Description must be at least 20 characters." }).max(500),
})

type TopicFormValues = z.infer<typeof topicSchema>

export default function TopicsPage() {
  const [topics, setTopics] = React.useState<any[]>([])
  
  React.useEffect(() => {
    async function loadTopics() {
      const data = await getStudentTopics()
      setTopics(data)
    }
    loadTopics()
  }, [])

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TopicFormValues>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  })

  const descriptionValue = watch("description")

  async function onSubmit(data: TopicFormValues, actionType: "draft" | "submit") {
    // Only supporting direct submit for now, draft is not in schema explicitly without extending model
    if (actionType === "draft") {
      toast({
        title: "Not Implemented",
        description: "Drafting is not currently implemented in this version.",
        type: "info"
      })
      return;
    }

    const result = await submitTopic(data)
    if (result.success) {
      toast({
        title: "Topic Submitted",
        description: "Your topic has been successfully submitted.",
        type: "success"
      })
      reset()
      // Reload topics
      const updated = await getStudentTopics()
      setTopics(updated)
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to submit topic",
        type: "error"
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "APPROVED": return <Badge className="bg-secondary hover:bg-secondary/90 text-white">Approved</Badge>
      case "REJECTED": return <Badge variant="destructive">Rejected</Badge>
      case "PENDING": return <Badge variant="outline" className="text-warning border-warning bg-warning/10">Pending</Badge>
      case "CHANGES_REQUESTED": return <Badge variant="outline" className="text-warning border-warning bg-warning/10">Changes Requested</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Project Topics</h1>
        <p className="text-muted-foreground">Submit a project topic for your supervisor to review and approve.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submit Topic</CardTitle>
          <CardDescription>
            Propose a new project topic. Keep the description concise.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Topic Title</Label>
              <Input 
                id="title" 
                placeholder="e.g. AI-Driven Predictive Maintenance..." 
                {...register("title")}
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="description">Brief Description</Label>
                <span className="text-xs text-muted-foreground">
                  {descriptionValue?.length || 0} / 500
                </span>
              </div>
              <Textarea
                id="description"
                placeholder="Provide a brief overview of what this project entails..."
                className={`min-h-[100px] resize-y ${errors.description ? "border-destructive" : ""}`}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end border-t p-6">
          <Button 
            onClick={handleSubmit((d) => onSubmit(d, "submit"))}
            disabled={isSubmitting}
          >
            Submit for Review
          </Button>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Submitted Topics</h3>
        <div className="grid gap-4">
          {topics.length === 0 && (
            <p className="text-sm text-muted-foreground">You have not submitted any topics yet.</p>
          )}
          {topics.map((topic) => (
            <Card key={topic.id}>
              <CardContent className="p-6 sm:flex sm:gap-6">
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="font-semibold text-lg leading-tight">{topic.title}</h4>
                    <div className="flex shrink-0 items-center gap-2">
                      {getStatusBadge(topic.status)}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{topic.description}</p>
                  
                  {topic.supervisorReview && (
                    <div className="mt-4 p-4 rounded-md bg-muted/50 border">
                      <p className="text-sm font-medium mb-1">Supervisor Notes:</p>
                      <p className="text-sm text-muted-foreground">{topic.supervisorReview}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
