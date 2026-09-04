import * as React from "react"
import { getSupervisors } from "@/app/actions/admin"
import { AdminSupervisorsClient } from "./AdminSupervisorsClient"

export default async function AdminSupervisorsPage() {
  const supervisors = await getSupervisors()
  return <AdminSupervisorsClient supervisors={supervisors} />
}
