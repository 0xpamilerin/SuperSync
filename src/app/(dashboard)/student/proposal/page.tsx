"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CheckCircle2, FileEdit, XCircle, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { getStudentProposal, submitProposal } from "@/app/actions/proposals"

import { toast } from "@/hooks/use-toast"

const proposalSchema = z.object({
  background: z.string().min(50, { message: "Background must be at least 50 characters." }),
  problemStatement: z.string().min(50, { message: "Problem statement must be at least 50 characters." }),
  objectives: z.string().min(50, { message: "Objectives must be at least 50 characters." }),
  methodology: z.string().min(50, { message: "Methodology must be at least 50 characters." }),
})

type ProposalFormValues = z.infer<typeof proposalSchema>

export default function ProposalPage() {
  
  
  const [topic, setTopic] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      background: "",
      problemStatement: "",
      objectives: "",
      methodology: "",
    },
  })

  const loadTopic = async () => {
    setLoading(true)
    const data = await getStudentProposal()
    setTopic(data)
    if (data) {
      reset({
        background: data.background || "",
        problemStatement: data.problemStatement || "",
        objectives: data.objectives || "",
        methodology: data.methodology || ""
      })
    }
    setLoading(false)
  }

  React.useEffect(() => {
    loadTopic()
  }, [reset])

  async function onSubmit(data: ProposalFormValues, actionType: "draft" | "submit") {
    const result = await submitProposal(data, actionType)
    if (result.success) {
      toast({
        title: actionType === "draft" ? "Draft Saved" : "Proposal Submitted",
        description: actionType === "draft" ? "Your proposal draft has been saved." : "Your proposal has been submitted for review.",
        type: "success"
      })
      await loadTopic()
    } else {
      toast({
        title: "Action Failed",
        description: result.error || "Failed to save proposal",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = () => {
    if (!topic) return null
    switch(topic.status) {
      case "APPROVED": return <Badge className="bg-secondary hover:bg-secondary/90 text-white">Approved</Badge>
      case "REJECTED": return <Badge variant="destructive">Rejected</Badge>
      case "PENDING": return <Badge variant="outline" className="text-warning border-warning bg-warning/10">Under Review</Badge>
      default: return <Badge variant="secondary">Draft</Badge>
    }
  }

  if (loading) return <div className="p-8 text-center">Loading proposal...</div>

  if (!topic) return (
    <div className="p-8 text-center max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">No Topic Found</h2>
      <p className="text-muted-foreground mb-4">You need an approved topic before you can submit a proposal. A default one will be created when you submit your first draft.</p>
      <Button onClick={() => setTopic({ status: "DRAFT", title: "New Topic" })}>Start Draft Anyway</Button>
    </div>
  )

  const isReadOnly = topic.status === "PENDING" || topic.status === "APPROVED"

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Project Proposal</h1>
          <p className="text-muted-foreground">Draft and submit your formal project proposal for the approved topic.</p>
        </div>
        {getStatusBadge()}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Approved Topic</p>
            <h3 className="font-semibold text-lg">{topic.title || "Untitled Topic"}</h3>
          </div>
          {topic.supervisorReview && (
            <div className="mt-4 p-4 bg-background rounded-md border">
              <p className="text-sm font-medium text-muted-foreground mb-1">Supervisor Feedback</p>
              <p className="text-sm">{topic.supervisorReview}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Proposal Document</CardTitle>
          <CardDescription>
            {isReadOnly ? "Your proposal is currently locked for review or approved." : "Fill out each section of your proposal carefully. You can save as draft and continue later."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="background">Background to the Study</Label>
              <Textarea
                id="background"
                placeholder="Provide the context and background of your project..."
                className={`min-h-[150px] resize-y ${errors.background ? "border-destructive" : ""}`}
                disabled={isReadOnly}
                {...register("background")}
              />
              {errors.background && (
                <p className="text-xs text-destructive">{errors.background.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="problemStatement">Problem Statement</Label>
              <Textarea
                id="problemStatement"
                placeholder="Clearly define the problem you are trying to solve..."
                className={`min-h-[150px] resize-y ${errors.problemStatement ? "border-destructive" : ""}`}
                disabled={isReadOnly}
                {...register("problemStatement")}
              />
              {errors.problemStatement && (
                <p className="text-xs text-destructive">{errors.problemStatement.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="objectives">Aims & Objectives</Label>
              <Textarea
                id="objectives"
                placeholder="List the main aim and specific objectives of your project..."
                className={`min-h-[150px] resize-y ${errors.objectives ? "border-destructive" : ""}`}
                disabled={isReadOnly}
                {...register("objectives")}
              />
              {errors.objectives && (
                <p className="text-xs text-destructive">{errors.objectives.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="methodology">Methodology</Label>
              <Textarea
                id="methodology"
                placeholder="Describe how you plan to achieve your objectives (tools, techniques, architecture)..."
                className={`min-h-[150px] resize-y ${errors.methodology ? "border-destructive" : ""}`}
                disabled={isReadOnly}
                {...register("methodology")}
              />
              {errors.methodology && (
                <p className="text-xs text-destructive">{errors.methodology.message}</p>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button 
            variant="outline" 
            onClick={() => onSubmit(getValues(), "draft")}
            disabled={isSubmitting || isReadOnly}
          >
            Save Draft
          </Button>
          <Button 
            onClick={handleSubmit((d) => onSubmit(d, "submit"))}
            disabled={isSubmitting || isReadOnly}
          >
            {topic.status === "PENDING" ? "Under Review" : topic.status === "APPROVED" ? "Approved" : "Submit Proposal"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
