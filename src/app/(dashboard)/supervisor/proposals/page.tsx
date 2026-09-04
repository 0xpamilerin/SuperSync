"use client"

import * as React from "react"
import { Search, FileText, CheckCircle2, XCircle, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { getSupervisorProposals, reviewProposal } from "@/app/actions/proposals"

export default function SupervisorProposalsPage() {
  const [proposals, setProposals] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedProposal, setSelectedProposal] = React.useState<any | null>(null)
  const [reviewNotes, setReviewNotes] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const fetchProposals = async () => {
    setLoading(true)
    const data = await getSupervisorProposals()
    // Filter to only those submitted (PENDING, APPROVED, REJECTED)
    const submitted = data.filter((t: any) => t.status !== "DRAFT")
    setProposals(submitted)
    if (selectedProposal) {
      const updated = submitted.find((p: any) => p.id === selectedProposal.id)
      setSelectedProposal(updated || null)
    }
    setLoading(false)
  }

  React.useEffect(() => {
    fetchProposals()
  }, [])

  const handleReview = async (status: "APPROVED" | "REJECTED") => {
    if (!selectedProposal) return
    setIsSubmitting(true)
    const result = await reviewProposal(selectedProposal.id, status, reviewNotes)
    if (result.success) {
      alert(`Proposal ${status.toLowerCase()} successfully.`)
      setReviewNotes("")
      await fetchProposals()
    } else {
      alert(`Error: ${result.error}`)
    }
    setIsSubmitting(false)
  }

  if (loading) {
    return <div className="p-8 text-center">Loading proposals...</div>
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Proposal Reviews</h1>
        <p className="text-muted-foreground">Review and approve detailed project proposals submitted by your students.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Queue</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search students..." className="pl-8" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col divide-y max-h-[600px] overflow-y-auto">
              {proposals.map((proposal) => (
                <div 
                  key={proposal.id}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${selectedProposal?.id === proposal.id ? 'bg-muted' : ''}`}
                  onClick={() => setSelectedProposal(proposal)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold">{proposal.student.user.name}</span>
                    <Badge variant={proposal.status === "PENDING" ? "outline" : (proposal.status === "APPROVED" ? "default" : "destructive")}
                           className={proposal.status === "PENDING" ? "text-warning border-warning bg-warning/10" : ""}
                    >
                      {proposal.status}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium line-clamp-1">{proposal.title || "Untitled"}</p>
                  <p className="text-xs text-muted-foreground mt-2">{new Date(proposal.updatedAt).toLocaleDateString()}</p>
                </div>
              ))}
              {proposals.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  No proposals in queue.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          {selectedProposal ? (
            <>
              <CardHeader className="border-b pb-6">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-xl mb-2">{selectedProposal.title}</CardTitle>
                    <CardDescription>Submitted by {selectedProposal.student.user.name} ({selectedProposal.student.matricNumber}) on {new Date(selectedProposal.updatedAt).toLocaleDateString()}</CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge variant={selectedProposal.status === "PENDING" ? "outline" : (selectedProposal.status === "APPROVED" ? "default" : "destructive")}
                           className={selectedProposal.status === "PENDING" ? "text-warning border-warning bg-warning/10 text-sm px-3 py-1" : "text-sm px-3 py-1"}
                    >
                      {selectedProposal.status}
                    </Badge>
                    <Button variant="outline" size="sm" className="h-8">
                      <Download className="w-3.5 h-3.5 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6 max-h-[50vh] overflow-y-auto pr-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-1">Background</h3>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedProposal.background}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-1">Problem Statement</h3>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedProposal.problemStatement}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-1">Objectives</h3>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedProposal.objectives}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-1">Methodology</h3>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedProposal.methodology}</p>
                  </div>
                </div>
                
                {(selectedProposal.status === "PENDING" || selectedProposal.supervisorReview) && (
                  <div className="space-y-3 pt-6 border-t">
                    <Label htmlFor="feedback">Reviewer Notes</Label>
                    <Textarea 
                      id="feedback" 
                      placeholder="Add any feedback, corrections, or conditions for approval here..." 
                      className="min-h-[100px]"
                      value={selectedProposal.status === "PENDING" ? reviewNotes : (selectedProposal.supervisorReview || "")}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      disabled={selectedProposal.status !== "PENDING" || isSubmitting}
                    />
                  </div>
                )}
              </CardContent>
              {selectedProposal.status === "PENDING" && (
                <CardFooter className="flex justify-end gap-3 border-t p-6 bg-muted/20">
                  <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleReview("REJECTED")} disabled={isSubmitting}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Request Revisions
                  </Button>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => handleReview("APPROVED")} disabled={isSubmitting}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve Proposal
                  </Button>
                </CardFooter>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
              <FileText className="h-12 w-12 mb-4 opacity-20" />
              <p>Select a proposal from the queue to review.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
