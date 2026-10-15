import * as React from "react"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { getChapterById } from "@/app/actions/chapters"
import { ChapterReviewClient } from "./ChapterReviewClient"
import { resolveStudentProfile, resolveSupervisorProfile } from "@/lib/user-helper"

export default async function ChapterReviewPage({ 
  params 
}: { 
  params: Promise<{ id: string }> | { id: string } 
}) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const { id } = await Promise.resolve(params)
  const chapter = await getChapterById(id)
  if (!chapter) {
    notFound()
  }

  // Security check: only allow student who owns it, or their supervisor
  if (session.user.role === "STUDENT") {
    const studentProfile = await resolveStudentProfile(session)
    if (studentProfile?.id !== chapter.studentId) {
      redirect("/student")
    }
  } else if (session.user.role === "SUPERVISOR") {
    const supervisorProfile = await resolveSupervisorProfile(session)
    if (supervisorProfile?.id !== chapter.student?.supervisorId) {
      redirect("/supervisor")
    }
  } else if (session.user.role !== "ADMIN") {
    redirect("/login")
  }

  return <ChapterReviewClient chapter={chapter} currentUser={session.user} />
}
