"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  Bell, 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Check, 
  CheckCheck, 
  Info,
  ExternalLink,
  Clock
} from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/app/actions/notifications"

interface NotificationItem {
  id: string
  userId: string
  title: string
  message: string
  type: "SYSTEM" | "TOPIC" | "CHAPTER" | "MEETING" | "MESSAGE"
  link?: string | null
  isRead: boolean
  createdAt: string | Date
  updatedAt: string | Date
}

export function NotificationsClient({ initialNotifications }: { initialNotifications: NotificationItem[] }) {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(initialNotifications)
  const [filter, setFilter] = React.useState("all")
  const [isMarkingAll, setIsMarkingAll] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    setNotifications(initialNotifications)
  }, [initialNotifications])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const getIcon = (type: string) => {
    switch (type) {
      case "MESSAGE": return <MessageSquare className="h-4 w-4" />
      case "MEETING": return <Calendar className="h-4 w-4" />
      case "CHAPTER": return <BookOpen className="h-4 w-4" />
      case "TOPIC": return <FileText className="h-4 w-4" />
      case "SYSTEM": return <Info className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "CHAPTER": return "text-blue-500 bg-blue-500/10 border-blue-500/20"
      case "TOPIC": return "text-purple-500 bg-purple-500/10 border-purple-500/20"
      case "MEETING": return "text-amber-500 bg-amber-500/10 border-amber-500/20"
      case "MESSAGE": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
      case "SYSTEM": return "text-indigo-500 bg-indigo-500/10 border-indigo-500/20"
      default: return "text-primary bg-primary/10 border-primary/20"
    }
  }

  const formatNotificationTime = (dateInput: string | Date) => {
    const date = new Date(dateInput)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      setNotifications(prev =>
        prev.map(n => (n.id === notif.id ? { ...n, isRead: true } : n))
      )
      await markNotificationAsRead(notif.id)
    }

    if (notif.link) {
      router.push(notif.link)
    }
  }

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true)
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    await markAllNotificationsAsRead()
    setIsMarkingAll(false)
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return !n.isRead
    if (filter === "all") return true
    return n.type === filter
  })

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="default" className="bg-primary px-2.5 py-0.5 text-xs font-semibold">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Stay updated with milestones, reviews, approvals, and scheduled meetings.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMarkAllRead} 
            disabled={isMarkingAll}
            className="w-full sm:w-auto self-start sm:self-auto flex items-center gap-2"
          >
            <CheckCheck className="h-4 w-4 text-muted-foreground" />
            <span>Mark all as read</span>
          </Button>
        )}
      </div>

      <Card className="shadow-xs border overflow-hidden">
        <CardHeader className="p-0 border-b bg-muted/20">
          <Tabs defaultValue="all" value={filter} onValueChange={setFilter} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-12 p-0 overflow-x-auto">
              <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4">
                All ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4">
                Unread ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="CHAPTER" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4">
                Chapters
              </TabsTrigger>
              <TabsTrigger value="TOPIC" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4">
                Topics
              </TabsTrigger>
              <TabsTrigger value="MEETING" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4">
                Meetings
              </TabsTrigger>
              <TabsTrigger value="SYSTEM" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4">
                System
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col divide-y">
            {filteredNotifications.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                <div className="rounded-full bg-muted/60 p-4 text-muted-foreground">
                  <Bell className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-base">No notifications</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {filter === "unread"
                    ? "You're all caught up! No unread notifications to display."
                    : "There are no notifications matching your current tab filter."}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={() => handleNotificationClick(notif)}
                  className={cn(
                    "flex items-start gap-4 p-4 hover:bg-muted/40 transition-colors cursor-pointer text-left relative",
                    !notif.isRead ? "bg-primary/5 border-l-4 border-l-primary" : "opacity-90"
                  )}
                >
                  <div className={cn(
                    "mt-0.5 rounded-lg p-2.5 border shrink-0",
                    getTypeColor(notif.type)
                  )}>
                    {getIcon(notif.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className={cn("text-sm", !notif.isRead ? "font-semibold text-foreground" : "font-medium text-foreground")}>
                          {notif.title}
                        </p>
                        {!notif.isRead && (
                          <span className="h-2 w-2 rounded-full bg-primary inline-block shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Clock className="h-3 w-3" />
                        <span>{formatNotificationTime(notif.createdAt)}</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notif.message}
                    </p>

                    {notif.link && (
                      <div className="pt-1 flex items-center gap-1 text-xs text-primary font-medium">
                        <span>View details</span>
                        <ExternalLink className="h-3 w-3" />
                      </div>
                    )}
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
