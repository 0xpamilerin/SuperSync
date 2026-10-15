"use client"

import * as React from "react"
import Link from "next/link"
import { 
  CheckCircle,
  XCircle,
  MessageSquare,
  Download,
  Search,
  Filter,
  Eye
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function SuperviseeTable({ students }: { students: any[] }) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.topic.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || student.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "approved": 
        return <Badge className="bg-secondary hover:bg-secondary text-white">On Track</Badge>
      case "pending_review": 
      case "pending_topic":
        return <Badge variant="outline" className="text-warning border-warning bg-warning/10">Pending Review</Badge>
      case "action_required":
        return <Badge variant="destructive">Needs Action</Badge>
      default: 
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <CardTitle>Supervisee Progress</CardTitle>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search students..."
              className="pl-8 sm:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className={buttonVariants({ variant: "outline", className: "shrink-0" })}>
                <Filter className="mr-2 h-4 w-4" />
                Filter
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                <DropdownMenuRadioItem value="all">All Students</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="pending_review">Pending Chapter Review</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="pending_topic">Pending Topic Approval</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="action_required">Needs Student Action</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="approved">On Track</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop Table */}
        <div className="hidden md:block rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="w-[30%]">Project Topic</TableHead>
                <TableHead>Current Stage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No students found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{student.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <span className="line-clamp-2">{student.topic}</span>
                    </TableCell>
                    <TableCell>{student.currentChapter}</TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                    <TableCell className="text-muted-foreground">{student.lastActivity}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-1.5">
                        <Link 
                          href={`/supervisor/students/${student.id}`} 
                          className={buttonVariants({ variant: "ghost", size: "sm", className: "h-8 px-2.5 text-xs font-medium" })}
                          title="View student dossier"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Dossier
                        </Link>
                        {student.chapterId ? (
                          <Link 
                            href={`/chapters/${student.chapterId}`} 
                            className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 px-2.5 text-xs font-medium" })}
                            title="Review latest chapter"
                          >
                            <MessageSquare className="h-3.5 w-3.5 mr-1" />
                            Review
                          </Link>
                        ) : student.status === "pending_topic" ? (
                          <Link 
                            href="/supervisor/topics" 
                            className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 px-2.5 text-xs font-medium text-warning border-warning" })}
                            title="Review pending topic"
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Review Topic
                          </Link>
                        ) : null}
                        {student.fileUrl && (
                          <a 
                            href={student.fileUrl} 
                            download={student.fileName || "submission"} 
                            target="_blank" 
                            rel="noreferrer"
                            className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8" })}
                            title="Download submission"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards Fallback */}
        <div className="md:hidden space-y-4">
          {filteredStudents.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground border rounded-lg">
              No students found matching your filters.
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div key={student.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.lastActivity}</p>
                    </div>
                  </div>
                  {getStatusBadge(student.status)}
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Project Topic</p>
                  <p className="text-sm font-medium">{student.topic}</p>
                </div>
                
                <div className="flex items-center justify-between border-t pt-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Current Stage</p>
                    <p className="text-sm font-medium">{student.currentChapter}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link 
                      href={`/supervisor/students/${student.id}`} 
                      className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 text-xs font-medium" })}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Dossier
                    </Link>
                    {student.chapterId ? (
                      <Link 
                        href={`/chapters/${student.chapterId}`} 
                        className={buttonVariants({ variant: "default", size: "sm", className: "h-8 text-xs font-medium" })}
                      >
                        Review
                      </Link>
                    ) : student.status === "pending_topic" ? (
                      <Link 
                        href="/supervisor/topics" 
                        className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 text-xs font-medium text-warning border-warning" })}
                      >
                        Topic
                      </Link>
                    ) : null}
                    {student.fileUrl && (
                      <a 
                        href={student.fileUrl} 
                        download={student.fileName || "submission"} 
                        target="_blank" 
                        rel="noreferrer"
                        className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8" })}
                        title="Download submission"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
