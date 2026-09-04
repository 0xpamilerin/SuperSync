"use client"

import * as React from "react"
import { Search, Shuffle, Users, UserPlus, CheckCircle2, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { getAssignmentData, autoAssignStudents, manualAssignStudent, unassignStudent } from "@/app/actions/admin"

export default function AssignmentsPage() {
  const [isDepartmentAware, setIsDepartmentAware] = React.useState(true)
  const [isShuffling, setIsShuffling] = React.useState(false)
  
  const [manualStudent, setManualStudent] = React.useState("")
  const [manualSupervisor, setManualSupervisor] = React.useState("")
  
  const [assignments, setAssignments] = React.useState<any[]>([])
  const [unassignedStudents, setUnassignedStudents] = React.useState<any[]>([])
  const [supervisors, setSupervisors] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  const fetchData = async () => {
    setLoading(true)
    const data = await getAssignmentData()
    setAssignments(data.assignments)
    setUnassignedStudents(data.unassignedStudents)
    setSupervisors(data.supervisors)
    setLoading(false)
  }

  React.useEffect(() => {
    fetchData()
  }, [])

  const handleShuffleAndConfirm = async () => {
    setIsShuffling(true)
    const result = await autoAssignStudents(isDepartmentAware)
    if (result.success) {
      alert(`Successfully assigned ${result.assignedCount} students!`)
      await fetchData()
    } else {
      alert(`Failed to assign: ${result.error}`)
    }
    setIsShuffling(false)
  }

  const handleManualAssign = async () => {
    if (manualStudent && manualSupervisor) {
      const result = await manualAssignStudent(manualStudent, manualSupervisor)
      if (result.success) {
        alert(`Successfully assigned student.`)
        setManualStudent("")
        setManualSupervisor("")
        await fetchData()
      } else {
        alert(`Failed to assign: ${result.error}`)
      }
    }
  }

  const handleUnassign = async (studentProfileId: string) => {
    const result = await unassignStudent(studentProfileId)
    if (result.success) {
      await fetchData()
    } else {
      alert(`Failed to unassign: ${result.error}`)
    }
  }

  const availableSlots = supervisors.reduce((acc, s) => acc + (s.maxStudents - s._count.assignedStudents), 0)

  if (loading) {
    return <div className="p-8 text-center">Loading assignments data...</div>
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Student Assignments</h1>
        <p className="text-muted-foreground">Manage and assign students to project supervisors.</p>
      </div>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 h-12">
          <TabsTrigger value="current" className="h-10">Current Assignments</TabsTrigger>
          <TabsTrigger value="auto" className="h-10">Auto-Assign</TabsTrigger>
          <TabsTrigger value="manual" className="h-10">Manual Assign</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Assignments</CardTitle>
                <CardDescription>View all currently assigned students and their supervisors.</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search students..." className="pl-8" />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Matric No.</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Supervisor</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.user.name}</TableCell>
                      <TableCell>{assignment.matricNumber}</TableCell>
                      <TableCell>{assignment.department.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {assignment.supervisor.user.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleUnassign(assignment.id)}>Unassign</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {assignments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No assignments found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="auto">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="md:col-span-1 h-fit">
              <CardHeader>
                <CardTitle>Algorithm Settings</CardTitle>
                <CardDescription>Configure how students are automatically matched.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="department-aware" className="flex flex-col space-y-1">
                    <span>Department Aware</span>
                    <span className="font-normal text-xs text-muted-foreground">Match students with supervisors in the same department</span>
                  </Label>
                  <Switch 
                    id="department-aware" 
                    checked={isDepartmentAware}
                    onCheckedChange={setIsDepartmentAware}
                  />
                </div>
                <div className="rounded-md bg-muted p-4">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex-1 text-center">
                      <div className="text-2xl font-bold">{unassignedStudents.length}</div>
                      <div className="text-xs text-muted-foreground uppercase">Unassigned</div>
                    </div>
                    <div className="w-px h-8 bg-border"></div>
                    <div className="flex-1 text-center">
                      <div className="text-2xl font-bold text-primary">{availableSlots}</div>
                      <div className="text-xs text-muted-foreground uppercase">Available Slots</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleShuffleAndConfirm} disabled={isShuffling || unassignedStudents.length === 0}>
                  {isShuffling ? "Running..." : (
                    <>
                      <Shuffle className="mr-2 h-4 w-4" />
                      Run Auto-Assign
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card className="md:col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>Unassigned Students</CardTitle>
                <CardDescription>These students will be assigned to a supervisor when you run the auto-assign algorithm.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Matric No.</TableHead>
                        <TableHead>Department</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unassignedStudents.map((student, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{student.user.name}</TableCell>
                          <TableCell>{student.matricNumber}</TableCell>
                          <TableCell>{student.department.name}</TableCell>
                        </TableRow>
                      ))}
                      {unassignedStudents.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">All students are currently assigned.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="manual">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Manual Assignment</CardTitle>
              <CardDescription>Directly assign a specific student to a supervisor.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Unassigned Student</Label>
                  <Select value={manualStudent} onValueChange={(v) => setManualStudent(v || "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a student..." />
                    </SelectTrigger>
                    <SelectContent>
                      {unassignedStudents.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.user.name} ({student.matricNumber}) - {student.department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-center p-2">
                  <div className="bg-muted rounded-full p-2">
                    <UserPlus className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Select Supervisor</Label>
                  <Select value={manualSupervisor} onValueChange={(v) => setManualSupervisor(v || "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a supervisor..." />
                    </SelectTrigger>
                    <SelectContent>
                      {supervisors.map(sup => (
                        <SelectItem key={sup.id} value={sup.id} disabled={sup._count.assignedStudents >= sup.maxStudents}>
                          {sup.user.name} - {sup.department.name} ({sup._count.assignedStudents}/{sup.maxStudents} assigned)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t p-6 justify-end">
              <Button onClick={handleManualAssign} disabled={!manualStudent || !manualSupervisor}>
                Assign Student
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
