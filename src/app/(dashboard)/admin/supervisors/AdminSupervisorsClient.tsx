"use client"

import * as React from "react"
import { Search, Upload, Plus, MoreHorizontal } from "lucide-react"
import Link from "next/link"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export function AdminSupervisorsClient({ supervisors }: { supervisors: any[] }) {
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredSupervisors = supervisors.filter(supervisor => 
    supervisor.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    supervisor.staffId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supervisor.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Supervisors Management</h1>
          <p className="text-muted-foreground">Manage all project supervisors in the system.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/supervisors/upload">
            <Button variant="outline" >
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Button>
          </Link>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Supervisor
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4">
          <div>
            <CardTitle>All Supervisors</CardTitle>
            <CardDescription>A list of {supervisors.length} supervisors available for project allocation.</CardDescription>
          </div>
          <div className="relative mt-4 sm:mt-0">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search supervisors..." 
              className="pl-8 sm:w-[300px]" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supervisor Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Staff ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Load</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSupervisors.map((supervisor) => (
                  <TableRow key={supervisor.id}>
                    <TableCell className="font-medium">{supervisor.user.name}</TableCell>
                    <TableCell>{supervisor.user.email}</TableCell>
                    <TableCell>{supervisor.staffId}</TableCell>
                    <TableCell>{supervisor.department.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={supervisor.assignedStudents.length >= supervisor.maxStudents ? "destructive" : "secondary"}>
                          {supervisor.assignedStudents.length} / {supervisor.maxStudents}
                        </Badge>
                      </div>
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
                          <DropdownMenuItem>View details</DropdownMenuItem>
                          <DropdownMenuItem>Edit supervisor</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete supervisor</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredSupervisors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
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
