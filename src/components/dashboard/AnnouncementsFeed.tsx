"use client"

import * as React from "react"
import { Megaphone, ChevronRight, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export interface AnnouncementItem {
  id: string
  title: string
  content: string
  target: string
  createdAt: Date | string
}

export function AnnouncementsFeed({ announcements }: { announcements: AnnouncementItem[] }) {
  const [selectedAnnouncement, setSelectedAnnouncement] = React.useState<AnnouncementItem | null>(null)

  if (!announcements || announcements.length === 0) {
    return null
  }

  return (
    <>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background shadow-xs overflow-hidden">
        <CardHeader className="pb-3 pt-4 px-4 sm:px-6 border-b border-border/50 bg-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary/15 p-1.5 text-primary">
                <Megaphone className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Department Announcements</CardTitle>
                <CardDescription className="text-xs">Official notices and critical dates</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-xs font-normal border-primary/30 text-primary">
              {announcements.length} {announcements.length === 1 ? "Notice" : "Notices"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {announcements.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedAnnouncement(item)}
                className="flex items-start justify-between gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer group"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric"
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.content}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground group-hover:text-primary"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Full announcement modal */}
      <Dialog open={!!selectedAnnouncement} onOpenChange={(open) => !open && setSelectedAnnouncement(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{selectedAnnouncement?.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {selectedAnnouncement?.target === "All" ? "All Users" : selectedAnnouncement?.target}
              </Badge>
              <span>
                {selectedAnnouncement &&
                  new Date(selectedAnnouncement.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  })}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {selectedAnnouncement?.content}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
