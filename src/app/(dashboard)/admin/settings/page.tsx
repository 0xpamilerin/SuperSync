import { getSystemSettings } from "@/app/actions/admin"
import { AdminSettingsClient } from "./AdminSettingsClient"

export const metadata = {
  title: "Settings - Admin Dashboard",
}

export const dynamic = "force-dynamic"

export default async function AdminSettingsPage() {
  const settings = await getSystemSettings()

  return <AdminSettingsClient initialSettings={settings} />
}
