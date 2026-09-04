"use client"

import * as React from "react"
import { Search, FileText, CheckCircle2, MessageSquare, Download, Filter, Eye } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function SupervisorChaptersClient({ chapters }: { chapters: any[] }) {
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredChapters = chapters.filter((c) => {
    return c.student.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           c.title.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chapter Review Queue</h1>
          <p className="text-muted-foreground">Manage and review project chapter submissions from your students.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search students or chapters..." 
                className="pl-8 sm:w-[300px]" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Chapter</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredChapters.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium whitespace-nowrap">{doc.student.user.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="line-clamp-1">{doc.title}</span>
                        <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 shrink-0">v{doc.version}</Badge>
                        {doc.comments && doc.comments.length > 0 && (
                           <MessageSquare className="h-3 w-3 text-muted-foreground ml-1 shrink-0" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {new Date(doc.submittedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={doc.status === "APPROVED" ? "default" : (doc.status === "REVIEWING" ? "secondary" : "outline")}
                        className={doc.status === "PENDING" ? "text-warning border-warning bg-warning/10" : ""}
                      >
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <a href={doc.fileUrl} download={doc.fileName} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                          <Download className="h-4 w-4" />
                        </a>
                        <Link href={`/supervisor/chapters/${doc.id}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredChapters.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No chapters found.
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
