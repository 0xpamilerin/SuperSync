"use client"

import * as React from "react"
import { Search, Plus, MoreHorizontal, Calendar as CalendarIcon, CheckCircle2, Archive } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { createSession, setActiveSession, archiveSession } from "@/app/actions/admin"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export function AdminSessionsClient({ sessions }: { sessions: any[] }) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [formData, setFormData] = React.useState({
    title: "",
    startDate: "",
    endDate: "",
    isActive: true
  })

  const filteredSessions = sessions.filter(session => 
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.startDate || !formData.endDate) return

    setIsSubmitting(true)
    try {
      const res = await createSession({
        title: formData.title,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        isActive: formData.isActive
      })

      if (res.success) {
        setIsDialogOpen(false)
        setFormData({
          title: "",
          startDate: "",
          endDate: "",
          isActive: true
        })
        toast({ title: "Session Created", description: `Academic session "${formData.title}" created.`, type: "success" })
        router.refresh()
      } else {
        toast({ title: "Failed to Create", description: res.error || "Failed to create session", variant: "destructive" })
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "An error occurred", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSetActive = async (sessionId: string) => {
    try {
      const res = await setActiveSession(sessionId)
      if (res.success) {
        toast({ title: "Session Activated", description: "Academic session marked as active.", type: "success" })
        router.refresh()
      } else {
        toast({ title: "Failed to Activate", description: res.error || "Failed to activate session", variant: "destructive" })
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to activate session", variant: "destructive" })
    }
  }

  const handleArchive = async (sessionId: string) => {
    try {
      const res = await archiveSession(sessionId)
      if (res.success) {
        toast({ title: "Session Archived", description: "Academic session archived successfully.", type: "success" })
        router.refresh()
      } else {
        toast({ title: "Failed to Archive", description: res.error || "Failed to archive session", variant: "destructive" })
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to archive session", variant: "destructive" })
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Academic Sessions</h1>
          <p className="text-muted-foreground">Manage project allocation sessions and timelines.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger className={buttonVariants({ variant: "default" })}>
            <Plus className="w-4 h-4 mr-2" />
            New Session
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Academic Session</DialogTitle>
              <DialogDescription>
                Define a new academic year for topic allocation and project monitoring.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSession} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="session-title">Session Title</Label>
                <Input
                  id="session-title"
                  placeholder="e.g. 2024/2025"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session-start">Start Date</Label>
                  <Input
                    id="session-start"
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-end">End Date</Label>
                  <Input
                    id="session-end"
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border rounded-lg p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="session-active" className="text-sm font-medium">Set as Active Session</Label>
                  <p className="text-xs text-muted-foreground">Sets this session as current and archives previous ones.</p>
                </div>
                <Switch
                  id="session-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Session"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4">
          <div>
            <CardTitle>All Sessions</CardTitle>
            <CardDescription>A list of {sessions.length} academic sessions.</CardDescription>
          </div>
          <div className="relative mt-4 sm:mt-0">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search sessions..." 
              className="pl-8 sm:w-[300px]" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session Title</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      {session.title}
                    </TableCell>
                    <TableCell>{new Date(session.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(session.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {session.isActive ? (
                         <Badge variant="default" className="flex w-fit items-center gap-1 bg-green-500 hover:bg-green-600">
                           <CheckCircle2 className="w-3 h-3" /> Active
                         </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex w-fit items-center gap-1">
                          <Archive className="w-3 h-3" /> Archived
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", className: "h-8 w-8 p-0" })}>
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {!session.isActive ? (
                            <DropdownMenuItem onClick={() => handleSetActive(session.id)}>
                              Set as Active
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleArchive(session.id)} className="text-muted-foreground">
                              Archive session
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredSessions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No sessions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
