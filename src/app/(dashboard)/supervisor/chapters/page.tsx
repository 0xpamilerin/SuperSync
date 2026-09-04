import * as React from "react"
import { getSupervisorChapters } from "@/app/actions/chapters"
import { SupervisorChaptersClient } from "./SupervisorChaptersClient"

export default async function SupervisorChaptersPage() {
  const chapters = await getSupervisorChapters()
  
  return <SupervisorChaptersClient chapters={chapters} />
}
