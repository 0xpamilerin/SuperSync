import { AdminAnnouncementsClient } from "./AdminAnnouncementsClient"
import { getAnnouncements } from "@/app/actions/announcements"

export const metadata = {
  title: "Announcements - Admin Dashboard",
}

export default async function AdminAnnouncementsPage() {
  const announcements = await getAnnouncements()
  
  return <AdminAnnouncementsClient announcements={announcements} />
}
