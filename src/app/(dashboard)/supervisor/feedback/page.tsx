"use client"

import * as React from "react"
import { Search, MessageSquare, Filter, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const MOCK_FEEDBACK = [
  {
    id: 1,
    student: "Alice Johnson",
    matric: "182001",
    type: "Chapter Review",
    target: "Chapter 2: Literature Review",
    date: "Oct 15, 2026",
    content: "The review of existing systems is comprehensive, but you need to draw clearer comparisons with your proposed system. Focus more on the gaps in the literature.",
    status: "Sent"
  },
  {
    id: 2,
    student: "Bob Williams",
    matric: "182002",
    type: "Topic Proposal",
    target: "AI-Driven Maintenance",
    date: "Oct 10, 2026",
    content: "Good concept, but the scope is too broad for a final year project. Please narrow it down to a specific type of cloud infrastructure (e.g., AWS EC2 instances).",
    status: "Sent"
  },
  {
    id: 3,
    student: "Alice Johnson",
    matric: "182001",
    type: "General Meeting",
    target: "Progress Update",
    date: "Sep 28, 2026",
    content: "Student is progressing well. Advised to start data collection early to avoid delays in Chapter 4.",
    status: "Sent"
  }
]

export default function SupervisorFeedbackPage() {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Feedback History</h1>
          <p className="text-muted-foreground">Log of all feedback provided to your students.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search feedback..." className="pl-8" />
          </div>
          <Button variant="outline" className="shrink-0">
            <Filter className="h-4 w-4 mr-2" />
            Filter by Student
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {MOCK_FEEDBACK.map((feedback) => (
              <Collapsible key={feedback.id} className="border rounded-md overflow-hidden">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4 text-left">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <MessageSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">{feedback.student} <span className="text-muted-foreground font-normal text-sm ml-2">({feedback.matric})</span></div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {feedback.type} • {feedback.target}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-xs text-muted-foreground text-right hidden sm:block">
                        {feedback.date}
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 bg-muted/20 border-t text-sm leading-relaxed whitespace-pre-wrap">
                    {feedback.content}
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
