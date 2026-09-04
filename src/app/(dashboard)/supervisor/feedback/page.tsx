import * as React from "react"
import { MessageSquare, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { getSupervisorFeedbackHistory } from "@/app/actions/supervisor"

export default async function SupervisorFeedbackPage() {
  const feedbackList = await getSupervisorFeedbackHistory()

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Feedback History</h1>
          <p className="text-muted-foreground">Log of all reviews and comments provided to your students.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
          <CardDescription>
            {feedbackList.length} feedback item{feedbackList.length === 1 ? "" : "s"} recorded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {feedbackList.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border rounded-lg border-dashed">
              <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
              <p className="font-medium text-foreground">No feedback recorded yet</p>
              <p className="text-xs max-w-sm mt-1">
                Reviews and comments you leave on student project topics, chapters, and meetings will automatically appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbackList.map((feedback) => (
                <Collapsible key={feedback.id} className="border rounded-md overflow-hidden">
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4 text-left">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <MessageSquare className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">
                            {feedback.student}{" "}
                            <span className="text-muted-foreground font-normal text-sm ml-2">
                              ({feedback.matric})
                            </span>
                          </div>
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
