"use client"

import * as React from "react"
import { Download, BarChart2, PieChart as PieChartIcon } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const progressData = [
  { name: 'Topic Selection', value: 2 },
  { name: 'Chapter 1-2', value: 3 },
  { name: 'Chapter 3', value: 4 },
  { name: 'Chapter 4-5', value: 2 },
  { name: 'Completed', value: 1 },
]

const COLORS = ['#F59E0B', '#0EA5E9', '#4F46E5', '#10B981', '#14b8a6']

const performanceData = [
  { name: 'Alice J.', score: 85 },
  { name: 'Bob W.', score: 60 },
  { name: 'Charlie D.', score: 92 },
  { name: 'David M.', score: 75 },
  { name: 'Eva G.', score: 88 },
]

export default function SupervisorReportsPage() {
  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Supervision Reports</h1>
          <p className="text-muted-foreground">Analytics and progress reports for your assigned students.</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Full Report (PDF)
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Student Progress Distribution
            </CardTitle>
            <CardDescription>Current project phases of your supervisees.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={progressData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {progressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              Student Performance Estimation
            </CardTitle>
            <CardDescription>Estimated grades based on submission quality and timeliness.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip cursor={{fill: 'var(--accent)', opacity: 0.2}} />
                <Bar dataKey="score" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Detailed Reports</CardTitle>
          <CardDescription>Generate specific reports based on criteria.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="progress">
            <TabsList className="mb-4">
              <TabsTrigger value="progress">Progress Report</TabsTrigger>
              <TabsTrigger value="attendance">Meeting Attendance</TabsTrigger>
              <TabsTrigger value="issues">At-Risk Students</TabsTrigger>
            </TabsList>
            <TabsContent value="progress" className="border rounded-md p-8 text-center text-muted-foreground">
              Detailed progress report table will be displayed here.
            </TabsContent>
            <TabsContent value="attendance" className="border rounded-md p-8 text-center text-muted-foreground">
              Meeting attendance logs will be displayed here.
            </TabsContent>
            <TabsContent value="issues" className="border rounded-md p-8 text-center text-muted-foreground">
              List of students requiring immediate attention will be displayed here.
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
