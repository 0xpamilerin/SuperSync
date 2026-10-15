"use client"

import * as React from "react"
import { 
  BarChart3, 
  GraduationCap, 
  Users, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Building,
  ArrowUpRight
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ReportsData {
  overview: {
    totalStudents: number
    totalSupervisors: number
    totalTopics: number
    topicsApproved: number
    topicsPending: number
    totalChapters: number
    chaptersApproved: number
    chaptersPending: number
  }
  departments: Array<{
    id: string
    name: string
    code: string
    _count: {
      students: number
      supervisors: number
    }
  }>
  supervisors: Array<{
    id: string
    staffId: string
    maxStudents: number
    department: { name: string; code: string }
    user: { name: string; email: string }
    _count: { assignedStudents: number }
  }>
}

export function AdminReportsClient({ data }: { data: ReportsData }) {
  const { overview, departments, supervisors } = data

  const topicApprovalRate = overview.totalTopics > 0 
    ? Math.round((overview.topicsApproved / overview.totalTopics) * 100) 
    : 0

  const chapterApprovalRate = overview.totalChapters > 0
    ? Math.round((overview.chaptersApproved / overview.totalChapters) * 100)
    : 0

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full print:p-0">
      <div className="flex items-center justify-between flex-wrap gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Institutional Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive overview of project allocations, approvals, and faculty workloads.</p>
        </div>

        <Button variant="outline" onClick={() => window.print()} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          <span>Print / Export Report</span>
        </Button>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students Enrolled</CardTitle>
            <GraduationCap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all departments</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Supervisors</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalSupervisors}</div>
            <p className="text-xs text-muted-foreground mt-1">Faculty advisors</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Topic Approvals</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{overview.topicsApproved} / {overview.totalTopics}</div>
            <p className="text-xs text-muted-foreground mt-1">{topicApprovalRate}% approval rate ({overview.topicsPending} pending)</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chapters Submitted</CardTitle>
            <BookOpen className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{overview.totalChapters}</div>
            <p className="text-xs text-muted-foreground mt-1">{chapterApprovalRate}% approved ({overview.chaptersPending} in review)</p>
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown */}
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg">Departmental Allocation Statistics</CardTitle>
          <CardDescription>Student and supervisor distribution per department.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Supervisors</TableHead>
                  <TableHead>Student-to-Staff Ratio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept) => {
                  const ratio = dept._count.supervisors > 0
                    ? (dept._count.students / dept._count.supervisors).toFixed(1) + ":1"
                    : "N/A"
                  return (
                    <TableRow key={dept.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>{dept.name}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{dept.code}</Badge>
                      </TableCell>
                      <TableCell>{dept._count.students}</TableCell>
                      <TableCell>{dept._count.supervisors}</TableCell>
                      <TableCell className="font-semibold">{ratio}</TableCell>
                    </TableRow>
                  )
                })}
                {departments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      No departments registered.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Supervisor Allocation & Load */}
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg">Supervisor Capacity & Allocation</CardTitle>
          <CardDescription>Live tracking of student allocations against supervisor quota limits.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supervisor</TableHead>
                  <TableHead>Staff ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Allocated</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Load Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supervisors.map((sup) => {
                  const assignedCount = sup._count?.assignedStudents ?? 0
                  const maxCap = sup.maxStudents || 1
                  const percent = Math.min(100, Math.round((assignedCount / maxCap) * 100))
                  const isFull = assignedCount >= maxCap

                  return (
                    <TableRow key={sup.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p>{sup.user?.name || "Staff Member"}</p>
                          <p className="text-xs text-muted-foreground">{sup.user?.email || ""}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{sup.staffId}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{sup.department?.name || "General"}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {assignedCount} / {sup.maxStudents || 0}
                      </TableCell>
                      <TableCell className="w-[180px]">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${isFull ? 'bg-destructive' : 'bg-primary'}`} 
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground font-mono w-8">{percent}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isFull ? (
                          <Badge variant="destructive" className="text-xs">At Capacity</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                            Available ({sup.maxStudents - sup._count.assignedStudents})
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
                {supervisors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No supervisors found.
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
