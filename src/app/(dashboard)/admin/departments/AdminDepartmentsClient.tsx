"use client"

import * as React from "react"
import { Building, Search, Plus, Trash2, Users, GraduationCap } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createDepartment, deleteDepartment } from "@/app/actions/admin"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface DepartmentItem {
  id: string
  name: string
  code: string
  createdAt: Date | string
  _count: {
    students: number
    supervisors: number
  }
}

export function AdminDepartmentsClient({ departments }: { departments: DepartmentItem[] }) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState({ name: "", code: "" })

  const filtered = departments.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.code) return

    setIsSubmitting(true)
    try {
      const res = await createDepartment(formData.name, formData.code)
      if (res.success) {
        setIsDialogOpen(false)
        setFormData({ name: "", code: "" })
        toast({ title: "Department Created", description: `Added department ${formData.name}.`, type: "success" })
        router.refresh()
      } else {
        toast({ title: "Failed to Create", description: res.error || "Failed to create department", variant: "destructive" })
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "An error occurred", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the ${name} department?`)) return

    setDeletingId(id)
    try {
      const res = await deleteDepartment(id)
      if (res.success) {
        toast({ title: "Department Deleted", description: `Removed department ${name}.`, type: "success" })
        router.refresh()
      } else {
        toast({ title: "Failed to Delete", description: res.error || "Failed to delete department", variant: "destructive" })
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "An error occurred", variant: "destructive" })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">Manage academic faculties, codes, and enrollments.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger className={buttonVariants({ variant: "default" })}>
            <Plus className="w-4 h-4 mr-2" />
            Add Department
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
              <DialogDescription>
                Define a departmental unit for student and supervisor allocations.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="dept-name">Department Name</Label>
                <Input
                  id="dept-name"
                  placeholder="e.g. Computer Science"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dept-code">Department Code</Label>
                <Input
                  id="dept-code"
                  placeholder="e.g. CSC"
                  required
                  maxLength={6}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Department"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4">
          <div>
            <CardTitle>All Departments</CardTitle>
            <CardDescription>A total of {departments.length} departments registered in the institution.</CardDescription>
          </div>
          <div className="relative mt-4 sm:mt-0">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search departments..." 
              className="pl-8 sm:w-[300px]" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Supervisors</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Building className="w-4 h-4 text-primary shrink-0" />
                      <span>{dept.name}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {dept.code}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span>{dept._count.students}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{dept._count.supervisors}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={deletingId === dept.id || dept._count.students > 0 || dept._count.supervisors > 0}
                        title={
                          dept._count.students > 0 || dept._count.supervisors > 0
                            ? "Cannot delete department with active members"
                            : "Delete department"
                        }
                        onClick={() => handleDelete(dept.id, dept.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No departments found.
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
