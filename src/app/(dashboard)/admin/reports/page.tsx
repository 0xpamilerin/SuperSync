import { getReportsData } from "@/app/actions/admin"
import { AdminReportsClient } from "./AdminReportsClient"

export const metadata = {
  title: "Reports & Analytics - Admin Dashboard",
}

export const dynamic = "force-dynamic"

export default async function AdminReportsPage() {
  const data = await getReportsData()

  if (!data) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Unable to load reports data. Please ensure you are logged in as administrator.
      </div>
    )
  }

  return <AdminReportsClient data={data} />
}
