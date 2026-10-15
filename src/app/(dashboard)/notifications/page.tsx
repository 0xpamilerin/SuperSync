import { getUserNotifications } from "@/app/actions/notifications"
import { NotificationsClient } from "./NotificationsClient"

export const dynamic = "force-dynamic"

export default async function NotificationsPage() {
  const notifications = await getUserNotifications()

  return <NotificationsClient initialNotifications={notifications as any[]} />
}
