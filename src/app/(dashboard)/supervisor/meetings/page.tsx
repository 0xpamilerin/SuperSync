import * as React from "react"
import { getSupervisorMeetings } from "@/app/actions/meetings"
import { getSupervisorStudents } from "@/app/actions/supervisor"
import { SupervisorMeetingsClient } from "./SupervisorMeetingsClient"

export default async function SupervisorMeetingsPage() {
  const meetings = await getSupervisorMeetings()
  const students = await getSupervisorStudents()
  
  return <SupervisorMeetingsClient meetings={meetings} students={students} />
}
