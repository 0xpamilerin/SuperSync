"use client"

import * as React from "react"
import { Bell, BookOpen, Calendar, MessageSquare, FileText } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const notificationsData = [
  {
    id: 1,
    type: "comment",
    title: "New feedback on Chapter 3",
    description: "Dr. Smith left a comment: 'Please expand on the methodology...'",
    date: "Today, 10:45 AM",
    read: false,
  },
  {
    id: 2,
    type: "meeting",
    title: "Meeting Scheduled",
    description: "Chapter 3 Review on Oct 24 at 10:00 AM",
    date: "Yesterday",
    read: false,
  },
  {
    id: 3,
    type: "chapter",
    title: "Chapter 2 Approved",
    description: "Your supervisor has approved Chapter 2.",
    date: "Oct 12",
    read: true,
  },
  {
    id: 4,
    type: "topic",
    title: "Topic Approved",
    description: "Your project topic has been officially approved by the department.",
    date: "Sep 10",
    read: true,
  },
]

export default function NotificationsPage() {
  const [filter, setFilter] = React.useState("all")

  const getIcon = (type: string) => {
    switch (type) {
      case "comment": return <MessageSquare className="h-4 w-4" />
      case "meeting": return <Calendar className="h-4 w-4" />
      case "chapter": return <BookOpen className="h-4 w-4" />
      case "topic": return <FileText className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const filteredNotifications = notificationsData.filter(n => {
    if (filter === "unread") return !n.read
    if (filter === "all") return true
    return n.type === filter
  })

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">Stay updated with feedback, approvals, and meetings.</p>
      </div>

      <Card>
        <CardHeader className="p-0 border-b">
          <Tabs defaultValue="all" value={filter} onValueChange={setFilter} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-12 p-0 overflow-x-auto">
              <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4">All</TabsTrigger>
              <TabsTrigger value="unread" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4">Unread</TabsTrigger>
              <TabsTrigger value="comment" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4">Comments</TabsTrigger>
              <TabsTrigger value="chapter" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4">Chapters</TabsTrigger>
              <TabsTrigger value="meeting" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4">Meetings</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No notifications found.
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={cn(
                    "flex items-start gap-4 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer",
                    !notif.read ? "bg-primary/5 border-l-4 border-l-primary pl-3" : "pl-4"
                  )}
                >
                  <div className={cn(
                    "mt-1 rounded-full p-2",
                    !notif.read ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-sm", !notif.read ? "font-bold text-foreground" : "font-medium text-foreground")}>
                        {notif.title}
                      </p>
                      <span className="text-xs text-muted-foreground shrink-0">{notif.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{notif.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
