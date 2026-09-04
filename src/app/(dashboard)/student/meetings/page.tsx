import * as React from "react"
import { Calendar as CalendarIcon, Clock, MapPin, Video, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { getStudentMeetings } from "@/app/actions/meetings"

export default async function StudentMeetingsPage() {
  const meetings = await getStudentMeetings()
  
  const upcomingMeetings = meetings.filter(m => m.status === "SCHEDULED" || m.date >= new Date())
  const pastMeetings = meetings.filter(m => m.status === "COMPLETED" || m.status === "CANCELLED" || m.date < new Date())

  const formatMeetingDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Meetings</h1>
          <p className="text-muted-foreground">View and join scheduled meetings with your supervisor.</p>
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-[400px] grid-cols-2 mb-8">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past Meetings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingMeetings.map(meeting => (
              <Card key={meeting.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="bg-primary/5">{meeting.status}</Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">{meeting.agenda}</CardTitle>
                  <CardDescription>with {meeting.supervisor.user.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatMeetingDate(meeting.date)}
                  </div>
                  {meeting.notes && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-md text-xs text-muted-foreground flex gap-2 items-start">
                      <Info className="h-4 w-4 shrink-0 mt-0.5" />
                      <p>{meeting.notes}</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-3 border-t">
                  <Button className="w-full" variant="outline" disabled>Scheduled</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {upcomingMeetings.length === 0 && (
            <div className="text-center p-12 border rounded-md border-dashed text-muted-foreground">
              No upcoming meetings scheduled.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pastMeetings.map(meeting => (
              <Card key={meeting.id} className="opacity-75 bg-muted/30 flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <Badge variant="secondary">{meeting.status}</Badge>
                  </div>
                  <CardTitle className="text-lg mt-2 text-muted-foreground">{meeting.agenda}</CardTitle>
                  <CardDescription>with {meeting.supervisor.user.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatMeetingDate(meeting.date)}
                  </div>
                  {meeting.notes && (
                    <div className="mt-4 p-3 bg-background rounded-md text-xs text-muted-foreground">
                      <strong>Notes:</strong> {meeting.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          {pastMeetings.length === 0 && (
            <div className="text-center p-12 border rounded-md border-dashed text-muted-foreground">
              No past meetings found.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
