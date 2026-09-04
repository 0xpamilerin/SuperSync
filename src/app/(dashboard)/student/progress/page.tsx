import * as React from "react"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

import { getStudentDashboardData } from "@/app/actions/dashboard"
import { getStudentProposal } from "@/app/actions/proposals"

export default async function StudentProgressPage() {
  const data = await getStudentDashboardData()
  const proposalData = await getStudentProposal()
  
  if (!data) return <div>No data available</div>
  
  const { studentProfile } = data
  const currentTopic = studentProfile.topics.length > 0 ? studentProfile.topics[0] : null
  const chapters = studentProfile.chapters
  
  const isTopicApproved = currentTopic?.status === "APPROVED"
  const isProposalApproved = isTopicApproved && proposalData?.background // Simulating proposal approval if it has data and topic is approved
  const isCh1Approved = chapters.some(c => c.number === 1 && c.status === "APPROVED")
  const isCh2Approved = chapters.some(c => c.number === 2 && c.status === "APPROVED")
  const isCh12Approved = isCh1Approved && isCh2Approved
  const isCh3Approved = chapters.some(c => c.number === 3 && c.status === "APPROVED")
  const isCh4Approved = chapters.some(c => c.number === 4 && c.status === "APPROVED")
  const isCh5Approved = chapters.some(c => c.number === 5 && c.status === "APPROVED")
  const isCh45Approved = isCh4Approved && isCh5Approved

  // Calculate current progress
  let completedStages = 0
  if (isTopicApproved) completedStages++
  if (isProposalApproved) completedStages++
  if (isCh12Approved) completedStages++
  if (isCh3Approved) completedStages++
  if (isCh45Approved) completedStages++

  const currentProgress = Math.round((completedStages / 6) * 100)

  const STAGES = [
    { 
      id: 1, 
      title: "Topic Selection", 
      description: "Submit and get approval for your project topic.", 
      status: isTopicApproved ? "completed" : (currentTopic ? "in-progress" : "pending"), 
      date: currentTopic?.updatedAt ? new Date(currentTopic.updatedAt).toLocaleDateString() : "Pending" 
    },
    { 
      id: 2, 
      title: "Proposal Approval", 
      description: "Detailed project proposal reviewed by supervisor.", 
      status: isProposalApproved ? "completed" : (isTopicApproved ? "in-progress" : "pending"), 
      date: isProposalApproved ? "Completed" : "Pending" 
    },
    { 
      id: 3, 
      title: "Chapter 1 & 2", 
      description: "Introduction and Literature Review submission.", 
      status: isCh12Approved ? "completed" : (isProposalApproved ? "in-progress" : "pending"), 
      date: isCh12Approved ? "Completed" : "Pending" 
    },
    { 
      id: 4, 
      title: "Chapter 3", 
      description: "Methodology submission and review.", 
      status: isCh3Approved ? "completed" : (isCh12Approved ? "in-progress" : "pending"), 
      date: isCh3Approved ? "Completed" : "Pending" 
    },
    { 
      id: 5, 
      title: "Chapter 4 & 5", 
      description: "Results, Analysis, and Conclusion.", 
      status: isCh45Approved ? "completed" : (isCh3Approved ? "in-progress" : "pending"), 
      date: isCh45Approved ? "Completed" : "Pending" 
    },
    { 
      id: 6, 
      title: "Final Defense", 
      description: "Project defense presentation and final grading.", 
      status: "pending", 
      date: "Pending" 
    },
  ]

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Project Progress</h1>
        <p className="text-muted-foreground">Track your journey from topic selection to final defense.</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Overall Completion</CardTitle>
          <CardDescription>Your estimated project completion based on milestones.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={currentProgress} className="h-4 flex-1" />
            <span className="font-bold tabular-nums text-lg">{currentProgress}%</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Milestones Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative border-l-2 border-muted ml-3 space-y-8 pb-4">
            {STAGES.map((stage) => (
              <div key={stage.id} className="relative pl-6">
                <div className={`absolute -left-[11px] top-1 h-5 w-5 rounded-full flex items-center justify-center bg-background border-2 
                  ${stage.status === 'completed' ? 'border-primary' : (stage.status === 'in-progress' ? 'border-warning' : 'border-muted')}`}
                >
                  {stage.status === 'completed' && <CheckCircle2 className="h-3 w-3 text-primary" />}
                  {stage.status === 'in-progress' && <Clock className="h-3 w-3 text-warning" />}
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div>
                    <h3 className={`font-semibold ${stage.status === 'pending' ? 'text-muted-foreground' : ''}`}>
                      {stage.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                  </div>
                  <div className="flex flex-col sm:items-end gap-1 shrink-0">
                    <Badge 
                      variant={stage.status === 'completed' ? 'default' : (stage.status === 'in-progress' ? 'outline' : 'secondary')}
                      className={stage.status === 'in-progress' ? "text-warning border-warning bg-warning/10" : (stage.status === 'completed' ? "bg-secondary text-white hover:bg-secondary" : "")}
                    >
                      {stage.status === 'completed' ? 'Completed' : (stage.status === 'in-progress' ? 'In Progress' : 'Pending')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{stage.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
