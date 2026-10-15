"use client"

import * as React from "react"
import { Calendar as CalendarIcon, Clock, Plus, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { scheduleMeeting, updateMeetingStatus } from "@/app/actions/meetings"

export function SupervisorMeetingsClient({ meetings, students }: { meetings: any[], students: any[] }) {
  const [isScheduling, setIsScheduling] = React.useState(false)
  const [selectedStudent, setSelectedStudent] = React.useState("")
  const [date, setDate] = React.useState("")
  const [time, setTime] = React.useState("")
  const [agenda, setAgenda] = React.useState("")
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent || !date || !time || !agenda) return

    setIsScheduling(true)
    const dateTime = new Date(`${date}T${time}`)
    
    const result = await scheduleMeeting(selectedStudent, dateTime, agenda)
    if (result.success) {
      toast({ title: "Meeting scheduled", type: "success" })
      setIsDialogOpen(false)
      window.location.reload()
    } else {
      toast({ title: "Failed to schedule", description: result.error, type: "error" })
    }
    setIsScheduling(false)
  }

  const handleStatusUpdate = async (id: string, status: "COMPLETED" | "CANCELLED") => {
    const result = await updateMeetingStatus(id, status)
    if (result.success) {
      toast({ title: `Meeting marked as ${status.toLowerCase()}`, type: "success" })
      window.location.reload()
    } else {
      toast({ title: "Failed to update", description: result.error, type: "error" })
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meetings Management</h1>
          <p className="text-muted-foreground">Schedule and manage meetings with your supervisees.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Meeting
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule a Meeting</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSchedule} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Student</Label>
                <Select value={selectedStudent} onValueChange={(val) => setSelectedStudent(val || "")} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>{s.user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Agenda</Label>
                <Input value={agenda} onChange={(e) => setAgenda(e.target.value)} required placeholder="e.g. Discuss Chapter 2" />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isScheduling}>
                  {isScheduling ? "Scheduling..." : "Schedule Meeting"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-[400px] grid-cols-2 mb-8">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past Meetings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {meetings.filter(m => m.status === "SCHEDULED" || m.status === "PENDING").map(meeting => (
              <Card key={meeting.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="bg-primary/5">{meeting.status}</Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">{meeting.agenda}</CardTitle>
                  <CardDescription>with {meeting.student?.user?.name || "Student"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {new Date(meeting.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    {new Date(meeting.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </CardContent>
                <CardFooter className="pt-3 border-t flex gap-2">
                  <Button className="flex-1" variant="outline" onClick={() => handleStatusUpdate(meeting.id, "COMPLETED")}>
                    Mark Completed
                  </Button>
                  <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleStatusUpdate(meeting.id, "CANCELLED")}>
                    Cancel
                  </Button>
                </CardFooter>
              </Card>
            ))}
            {meetings.filter(m => m.status === "SCHEDULED" || m.status === "PENDING").length === 0 && (
              <div className="col-span-3 text-center p-8 border rounded-lg text-muted-foreground">
                No upcoming meetings scheduled.
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="past">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {meetings.filter(m => m.status === "COMPLETED" || m.status === "CANCELLED").map(meeting => (
              <Card key={meeting.id} className="opacity-75 bg-muted/30">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <Badge variant="secondary">{meeting.status}</Badge>
                  </div>
                  <CardTitle className="text-lg mt-2 text-muted-foreground">{meeting.agenda}</CardTitle>
                  <CardDescription>with {meeting.student?.user?.name || "Student"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {new Date(meeting.date).toLocaleDateString()} at {new Date(meeting.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </CardContent>
              </Card>
            ))}
            {meetings.filter(m => m.status === "COMPLETED" || m.status === "CANCELLED").length === 0 && (
              <div className="col-span-3 text-center p-8 border rounded-lg text-muted-foreground">
                No past meetings.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
