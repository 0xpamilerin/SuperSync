"use client"

import * as React from "react"
import { Search, Plus, MoreHorizontal, Megaphone, CheckCircle2, Clock } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { createAnnouncement, updateAnnouncement, deleteAnnouncement } from "@/app/actions/announcements"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"

export function AdminAnnouncementsClient({ announcements }: { announcements: any[] }) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [formData, setFormData] = React.useState({ title: "", content: "", target: "All", status: "Published" })
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const filteredAnnouncements = announcements.filter((a) => {
    return a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           a.target.toLowerCase().includes(searchQuery.toLowerCase())
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createAnnouncement(formData)
      toast({ title: "Success", description: "Announcement created successfully." })
      setIsDialogOpen(false)
      setFormData({ title: "", content: "", target: "All", status: "Published" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to create announcement.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this announcement?")) return
    try {
      await deleteAnnouncement(id)
      toast({ title: "Success", description: "Announcement deleted." })
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete announcement.", variant: "destructive" })
    }
  }

  async function handleToggleStatus(id: string, currentStatus: string) {
    try {
      const newStatus = currentStatus === "Published" ? "Draft" : "Published"
      const announcement = announcements.find(a => a.id === id)
      if (!announcement) return
      await updateAnnouncement(id, {
        title: announcement.title,
        content: announcement.content,
        target: announcement.target,
        status: newStatus
      })
      toast({ title: "Success", description: `Announcement ${newStatus.toLowerCase()}.` })
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" })
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">Broadcast messages to students and supervisors.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger className={buttonVariants({ variant: "default" })}>
            <Plus className="w-4 h-4 mr-2" />
            New Announcement
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Announcement</DialogTitle>
              <DialogDescription>Create a new announcement to broadcast to users.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. System Maintenance" />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea required value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Select value={formData.target} onValueChange={v => setFormData({ ...formData, target: v || "All" })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Users</SelectItem>
                      <SelectItem value="Students">Students Only</SelectItem>
                      <SelectItem value="Supervisors">Supervisors Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v || "Published" })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Published">Published</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Announcement"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4">
          <div>
            <CardTitle>All Announcements</CardTitle>
            <CardDescription>A list of {filteredAnnouncements.length} announcements.</CardDescription>
          </div>
          <div className="relative mt-4 sm:mt-0">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search announcements..." className="pl-8 sm:w-[300px]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Target Audience</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnnouncements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="flex flex-col">
                        <span>{announcement.title}</span>
                        <span className="text-xs text-muted-foreground font-normal line-clamp-1">{announcement.content}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{announcement.target}</Badge>
                    </TableCell>
                    <TableCell>{new Date(announcement.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {announcement.status === "Published" ? (
                         <Badge variant="default" className="flex w-fit items-center gap-1 bg-green-500 hover:bg-green-600">
                           <CheckCircle2 className="w-3 h-3" /> Published
                         </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex w-fit items-center gap-1">
                          <Clock className="w-3 h-3" /> Draft
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
                          <DropdownMenuItem onClick={() => handleToggleStatus(announcement.id, announcement.status)}>
                            {announcement.status === "Published" ? "Unpublish" : "Publish"}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(announcement.id)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredAnnouncements.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      No announcements found.
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
