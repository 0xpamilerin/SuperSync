import * as React from "react"
import { getStudents } from "@/app/actions/admin"
import { AdminStudentsClient } from "./AdminStudentsClient"

export default async function AdminStudentsPage() {
  const students = await getStudents()
  return <AdminStudentsClient students={students} />
}
