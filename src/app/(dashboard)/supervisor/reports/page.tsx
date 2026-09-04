"use client"

import * as React from "react"
import { Download, BarChart2, PieChart as PieChartIcon, Users } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSupervisorReports } from "@/app/actions/supervisor"

const COLORS = ['#F59E0B', '#0EA5E9', '#4F46E5', '#10B981', '#14b8a6']

export default function SupervisorReportsPage() {
  const [data, setData] = React.useState<{
    progressData: { name: string; value: number }[]
    performanceData: { name: string; score: number }[]
    totalStudents: number
  }>({
    progressData: [],
    performanceData: [],
    totalStudents: 0
  })
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      try {
        const res = await getSupervisorReports()
        setData(res)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Supervision Reports</h1>
          <p className="text-muted-foreground">Analytics and progress reports for your assigned students.</p>
        </div>
        <Button variant="outline" disabled={data.totalStudents === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export Report
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
          <CardContent className="h-[300px] flex items-center justify-center">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading chart data...</p>
            ) : data.progressData.length === 0 ? (
              <div className="text-center text-muted-foreground p-6">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No student progress data</p>
                <p className="text-xs mt-1">Assigned students will appear here as they progress.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.progressData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.progressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              Student Completion Estimation
            </CardTitle>
            <CardDescription>Estimated progress percentage based on chapter reviews.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading chart data...</p>
            ) : data.performanceData.length === 0 ? (
              <div className="text-center text-muted-foreground p-6">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No completion data</p>
                <p className="text-xs mt-1">Scores will be computed from student submissions.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip cursor={{fill: 'var(--accent)', opacity: 0.2}} />
                  <Bar dataKey="score" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Detailed Reports</CardTitle>
          <CardDescription>
            {data.totalStudents} student{data.totalStudents === 1 ? "" : "s"} currently under your supervision
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="progress">
            <TabsList className="mb-4">
              <TabsTrigger value="progress">Progress Report</TabsTrigger>
              <TabsTrigger value="attendance">Meeting Attendance</TabsTrigger>
              <TabsTrigger value="issues">Supervisee Overview</TabsTrigger>
            </TabsList>
            <TabsContent value="progress" className="border rounded-md p-8 text-center text-muted-foreground">
              {data.totalStudents === 0 ? "No active students to display in progress report." : "Detailed progress tracking is synchronized with student submissions."}
            </TabsContent>
            <TabsContent value="attendance" className="border rounded-md p-8 text-center text-muted-foreground">
              Meeting records and attendance logs are maintained in the Meetings section.
            </TabsContent>
            <TabsContent value="issues" className="border rounded-md p-8 text-center text-muted-foreground">
              View assigned students and manage deadlines directly from the Students tab.
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
