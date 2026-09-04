"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const stages = [
  "Topic Submitted",
  "Topic Approved",
  "Chapter 1",
  "Chapter 2",
  "Chapter 3",
  "Chapter 4",
  "Chapter 5",
  "Final Approval",
]

interface ProgressTrackerProps {
  currentStageIndex: number
}

export function ProgressTracker({ currentStageIndex }: ProgressTrackerProps) {
  const percentage = Math.round(((currentStageIndex) / (stages.length - 1)) * 100)
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Project Progress</CardTitle>
          <span className="text-sm font-medium text-primary">{percentage}% Completed</span>
        </div>
        <p className="text-xs text-muted-foreground">Estimated completion: May 15, 2027</p>
      </CardHeader>
      <CardContent>
        <div className="relative mt-6">
          <div className="absolute left-4 top-0 h-full w-[2px] bg-border md:left-0 md:top-4 md:h-[2px] md:w-full" />
          
          <div className="relative flex flex-col gap-6 md:flex-row md:justify-between md:gap-0">
            {stages.map((stage, index) => {
              const isCompleted = index < currentStageIndex
              const isCurrent = index === currentStageIndex
              const isPending = index > currentStageIndex

              return (
                <div key={stage} className="flex items-start md:flex-col md:items-center gap-4 md:gap-2 relative z-10">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-background md:h-10 md:w-10",
                      isCompleted && "border-secondary bg-secondary text-secondary-foreground",
                      isCurrent && "border-primary ring-4 ring-primary/20",
                      isPending && "border-muted-foreground/30 text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4 md:h-5 md:w-5" />
                    ) : isCurrent ? (
                      <div className="h-2 w-2 md:h-2.5 md:w-2.5 rounded-full bg-primary animate-pulse" />
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="mt-1 md:mt-0 md:text-center">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isCompleted ? "text-foreground" : isCurrent ? "text-primary font-semibold" : "text-muted-foreground"
                      )}
                    >
                      {stage}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
