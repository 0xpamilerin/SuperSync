import * as React from "react"
import { Search, Mail, ExternalLink } from "lucide-react"
import Link from "next/link"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

import { getSupervisorStudents } from "@/app/actions/supervisor"

export default async function SupervisorStudentsPage() {
  const students = await getSupervisorStudents()

  const mappedStudents = students.map(student => {
    const currentTopic = student.topics.length > 0 ? student.topics[0] : null
    const latestChapter = student.chapters.length > 0 ? student.chapters[0] : null

    let status = "On Track"
    let phase = "Initial Setup"
    let progress = 10
    
    if (currentTopic) {
      if (currentTopic.status === "PENDING") status = "Action Required"
      else if (currentTopic.status === "CHANGES_REQUESTED") status = "Changes Requested"
      
      phase = `Topic: ${currentTopic.title}`
      progress = 25
    }

    if (latestChapter) {
      if (latestChapter.status === "PENDING") status = "Action Required"
      else if (latestChapter.status === "CHANGES_REQUESTED") status = "Changes Requested"
      
      phase = `Chapter ${latestChapter.number}`
      progress = 25 + (latestChapter.number * 10)
    }

    return {
      id: student.id,
      name: student.user.name,
      email: student.user.email,
      matric: student.matricNumber || "N/A",
      progress,
      phase,
      status
    }
  })

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Students</h1>
          <p className="text-muted-foreground">Manage your assigned supervisees and track their progress.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4">
          <div>
            <CardTitle>Assigned Students</CardTitle>
            <CardDescription>You are currently supervising {mappedStudents.length} students.</CardDescription>
          </div>
          <div className="relative mt-4 sm:mt-0">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search students..." className="pl-8 sm:w-[300px]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Current Phase</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappedStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-xs text-muted-foreground">{student.matric}</div>
                    </TableCell>
                    <TableCell>
                      <a href={`mailto:${student.email}`} className={buttonVariants({ variant: "link", className: "p-0 h-auto text-xs text-muted-foreground flex items-center" })}>
                        <Mail className="w-3 h-3 mr-1" />
                        {student.email}
                      </a>
                    </TableCell>
                    <TableCell>
                      <span className="line-clamp-2" title={student.phase}>{student.phase}</span>
                    </TableCell>
                    <TableCell className="w-[200px]">
                      <div className="flex items-center gap-2">
                        <Progress value={student.progress} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground w-8 text-right">{student.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          student.status === "On Track" ? "default" : 
                          (student.status === "Action Required" ? "destructive" : "secondary")
                        }
                      >
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/supervisor/students/${student.id}`}><Button variant="ghost" size="sm" >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Details
                        </Button></Link>
                    </TableCell>
                  </TableRow>
                ))}
                {mappedStudents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No students found.
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
