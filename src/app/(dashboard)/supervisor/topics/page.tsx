import * as React from "react"
import { getSupervisorTopics } from "@/app/actions/topics"
import { SupervisorTopicsClient } from "./SupervisorTopicsClient"

export default async function SupervisorTopicsPage() {
  const topics = await getSupervisorTopics()
  
  return <SupervisorTopicsClient topics={topics} />
}
