import * as React from "react"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { getStudentDetailsForSupervisor } from "@/app/actions/supervisor"
import { StudentDetailsClient } from "./StudentDetailsClient"

export default async function SupervisorStudentDetailPage({
  params
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== "SUPERVISOR") {
    redirect("/login")
  }

  const { id } = await Promise.resolve(params)
  const student = await getStudentDetailsForSupervisor(id)

  if (!student) {
    notFound()
  }

  return <StudentDetailsClient student={student} />
}
