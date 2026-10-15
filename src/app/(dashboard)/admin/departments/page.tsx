import { getDepartments } from "@/app/actions/admin"
import { AdminDepartmentsClient } from "./AdminDepartmentsClient"

export const metadata = {
  title: "Departments - Admin Dashboard",
}

export const dynamic = "force-dynamic"

export default async function AdminDepartmentsPage() {
  const departments = await getDepartments()

  return <AdminDepartmentsClient departments={departments as any[]} />
}
