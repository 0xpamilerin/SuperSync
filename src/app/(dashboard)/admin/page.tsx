import * as React from "react"
import { getAdminDashboardData } from "@/app/actions/dashboard"
import { redirect } from "next/navigation"
import { AdminDashboardClient } from "./AdminDashboardClient"

export default async function AdminDashboard() {
  const data = await getAdminDashboardData()
  
  if (!data) {
    redirect("/login")
  }

  return <AdminDashboardClient data={data} />
}
