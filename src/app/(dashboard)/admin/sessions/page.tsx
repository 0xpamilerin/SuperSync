import * as React from "react"
import { getSessions } from "@/app/actions/admin"
import { AdminSessionsClient } from "./AdminSessionsClient"

export default async function AdminSessionsPage() {
  const sessions = await getSessions()
  return <AdminSessionsClient sessions={sessions} />
}
